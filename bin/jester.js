#!/usr/bin/env node

import { existsSync, readdir, stat } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'
import { TestLogger } from '../lib/logger.js'
import { ConsoleLogger } from '../src/consoleLogger.js'
import { MarkdownLogger } from '../src/markdownLogger.js'
import pkg from '../package.json'
import { Status } from '../lib/status.js'

/** @typedef {'text' | 'md'} Format */
/** @typedef {{ testDir: String, format: Format, dryRun: Boolean, coverageDir: String }} Config */
/** @typedef {{Run: Function, name: String}} TestModule */

export function showHelp() {
  console.log(
    `
    Name:         ${pkg.name}
    Author:       ${pkg.author}
    Version:      ${pkg.version}
    Description:  ${pkg.description}
    License:      ${pkg.license}

    Usage:
        (npx [-n "--harmony [experimental-flags]"]) jester [options]

    Options:
        -h                    show this message
        -v                    print the version of this script
        -n                    does everything but run the actual test

        -d testDir            relative path containing tests (defaults to 'tests')

        -f format
          text                print plain text to stdout (default)
          md                  print markdown formatted text to stdout

        -o outputDir          the name of the folder you want coverage data written to
                              (defaults to 'coverage')
    `
  )
}

/**
 * @param {Config} config
 */
export function Configure(config) {
  console.warn('')
  const availableFormats = ['text', 'md']
  const availableOptions = ['-d', '-f', '-o', '-n', '-h', '-v']

  for (let index = 2; index < process.argv.length; index++) {
    const option = process.argv[index]
    if (availableOptions.indexOf(option) === -1) {
      console.error(`Invalid options: ${option}`)
      showHelp()
      return 1
    }

    const nextElement = process.argv[index + 1]
    switch (option) {
      case '-v':
        console.log(`Version: ${pkg.version}`)
        return 0

      case '-h':
        showHelp()
        return 0

      case '-d':
        // @ts-ignore
        config.testDir = nextElement || ''
        index++
        break

      case '-f':
        // @ts-ignore
        config.format = nextElement || ''
        index++
        break

      case '-o':
        config.coverageDir = nextElement || ''
        index++
        break

      case '-n':
        config.dryRun = true
        break

      default:
        break
    }
  }

  console.warn(`Printing to ${config.format} format`)
  if (availableFormats.indexOf(config.format) === -1) {
    console.error(`Invalid format: ${config.format}`)
    showHelp()
    return 1
  }

  config.coverageDir = join(process.cwd(), config.coverageDir)
  if (!existsSync(config.coverageDir)) {
    console.error(`Unable to find coverage directory: ${config.coverageDir}`)
    return 1
  }
  console.warn(`Writing coverage data to: ${config.coverageDir}`)

  config.testDir = join(process.cwd(), config.testDir)
  if (!existsSync(config.testDir)) {
    console.error(`Unable to find test directory: ${config.testDir}`)
    return 1
  }
  console.warn(`Importing tests from: ${config.testDir}`)
  console.warn('')

  return null
}

/**
 * @param {TestModule} testModule
 * @param {TestLogger} testLogger
 * @param {boolean} dryRun
 */
async function RunTest(testModule, testLogger, dryRun) {
  testLogger.WriteTestHead(testModule.name)
  const status = new Status()
  dryRun || await testModule.Run(status, testLogger)
  await testLogger.WriteTestFoot(testModule.name, status)
  return status.failedAssertions !== 0 ? 1 : 0
}

/**
 *
 * @param {TestModule[]} testModules
 * @param {TestLogger} testLogger
 * @param {Boolean} dryRun
 * @param {String} _coverageDir
 * @returns {Promise<Number[]>} [totalFailedTests, testsRun, testingTime]
 */
async function RunTests(testModules, testLogger, dryRun, _coverageDir = '') {
  let testResults = []

  // TODO Make coverage collection configurable
  //const session = new Session()
  //session.connect()
  //session.post('Profiler.enable')
  // session.post('Profiler.startPreciseCoverage', {callCount: true, detailed: true})

  const initialTime = performance.now()
  testResults = await Promise.all(
    testModules.map(testModule => RunTest(testModule, testLogger, dryRun))
  )
  const endingTime = performance.now()

  // session.post('Profiler.takePreciseCoverage', (err, data) => {
  //session.post('Profiler.getBestEffortCoverage', (err, data) => {
  //// session.post('Profiler.stopPreciseCoverage')
  //if (err) return console.error(err)

  //writeFileSync(
  //`${_coverageDir}${pathSep}coverage-${Date.now()}.json`,
  //JSON.stringify(data)
  //)
  //})

  const totalFailedTests = testResults.reduce((a, b) => a + b, 0)
  const totalTestsRun = testResults.length

  return [totalFailedTests, totalTestsRun, endingTime - initialTime]
}

/**
 * @param {String} dir
 *
 * @returns {Promise<String[]>}
 */
function GetEntries(dir) {
  console.warn(`Looking in: ${dir}`)
  try {
    return new Promise((resolve, reject) => {
      readdir(dir, (err, entries) => (err ? reject(err) : resolve(entries)))
    })
  } catch (error) {
    console.error(error)
    return Promise.resolve([])
  }
}

/**
 * @param {String} path
 *
 * @returns {Promise<import('fs').Stats?>}
 */
function GetEntryStats(path) {
  try {
    return new Promise((resolve, reject) => {
      stat(path, (err, stats) => (err ? reject(err) : resolve(stats)))
    })
  } catch (error) {
    console.error(error)
    return Promise.resolve(null)
  }
}

/**
 * @param {String} dir
 * @param {Promise<TestModule>[]} testModules
 */
async function FindTestModules(dir, testModules) {
  for (const eachEntry of await GetEntries(dir)) {
    const fullPath = join(dir, eachEntry)
    const entryStats = await GetEntryStats(fullPath)
    switch (true) {
      case entryStats?.isDirectory():
        await FindTestModules(fullPath, testModules)
        break

      case entryStats?.isFile():
        console.warn(`Found file: ${fullPath}`)
        /** @type {TestModule} */
        let module
        try {
          module = await import(fullPath.replace(/\\/g, '/').replace(/c:/gi, ''))
        } catch (error) {
          console.error(error)
          break
        }

        for (const eachExport in module) {
          if (eachExport === 'Run') {
            testModules.push(new Promise(resolve => resolve(module)))
            break
          }
        }
    }
  }
}

async function jester() {
  /** @type {Config} */
  const config = {
    testDir: 'tests',
    format: 'text',
    dryRun: false,
    coverageDir: 'coverage'
  }
  if (Configure(config) !== null) return 0

  let err = null
  /** @type {Promise<TestModule>[]} */
  let testModulePromises = []
  /** @type {TestModule[]} */
  let testModules = []

  await FindTestModules(config.testDir, testModulePromises)
  try {
    testModules = await Promise.all(testModulePromises)
  } catch (error) {
    console.error(error)
    err = -1
  }
  if (err !== null) return err

  console.warn(`Found ${testModules.length} test modules`)
  console.warn('')

  let testsRun = 0
  let failedTests = 0
  let testingTime = 0.0
  /** @type {TestLogger} */
  let testLogger
  switch (config.format) {
    case 'text':
      testLogger = new ConsoleLogger()
      break
    case 'md':
      testLogger = new MarkdownLogger()
      break
  }

  try {
    [failedTests, testsRun, testingTime] = await RunTests(
      testModules,
      testLogger,
      config.dryRun,
      config.coverageDir
    )
  } catch (error) {
    console.log(error)
    err = -1
  }

  testLogger.WriteTestSummary(testingTime, failedTests, testsRun)
  return err || failedTests
}

jester()
