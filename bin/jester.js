#!/usr/bin/env node

/** @private */

//import { sep as pathSep } from 'path'
//import { writeFileSync, } from 'fs'
//import { Session } from 'inspector'
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
/** @typedef {{Run: Function, id: String}} TestModule */

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
 * @param {TestModule[]} testModules
 * @param {Config} config
 * @returns {Promise<Number>} totalFailedTests
 */
async function RunTests(testModules, config) {
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

  //const session = new Session()
  //session.connect()
  //session.post('Profiler.enable')
  //session.post('Profiler.startPreciseCoverage', {callCount: true, detailed: true})

  const runTestsPromise = []
  const initialTime = performance.now()
  for (const eachTestModule of testModules) {
    testLogger.WriteTestHead(eachTestModule.id)
    const status = new Status()
    runTestsPromise.push(
      new Promise(async resolve => {
        config.dryRun || (await eachTestModule.Run(status, testLogger))
        resolve(status.failedAssertions !== 0 ? 1 : 0)
      })
    )
    testLogger.WriteTestFoot(eachTestModule.id, status)
  }
  const testResults = await Promise.all(runTestsPromise)
  const endingTime = performance.now()

  //session.post('Profiler.takePreciseCoverage', (err, data) => {
  //session.post('Profiler.getBestEffortCoverage', (err, data) => {
  //if (err) {console.error(err); return}
  //writeFileSync(`${_coverageDir}${pathSep}coverage-${Date.now()}.json`, JSON.stringify(data))
  //})

  const totalFailedTests = testResults.reduce((a, b) => a + b, 0)
  const totalTestsRun = testResults.length
  testLogger.WriteTestSummary(
    endingTime - initialTime,
    totalFailedTests,
    totalTestsRun
  )

  return totalFailedTests
}

/**
 * @param {String} dir
 *
 * @returns {Promise<String[]>}
 */
function GetEntries(dir) {
  //console.warn(`Looking in: ${dir}`)
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
 * @param {TestModule[]} testModules
 */
async function FindTestModules(dir, testModules) {
  let functionFinished
  for (const eachEntry of await GetEntries(dir)) {
    const fullPath = join(dir, eachEntry)
    const entryStats = await GetEntryStats(fullPath)
    if (entryStats?.isDirectory()) {
      functionFinished = new Promise(resolve =>
        resolve(FindTestModules(fullPath, testModules))
      )
    } else if (entryStats?.isFile()) {
      //console.warn(`Found file: ${fullPath}`)
      /** @type {TestModule} */
      let module
      try {
        module = await import(fullPath.replace(/\\/g, '/').replace(/c:/gi, ''))
      } catch (error) {
        console.error(error)
        continue
      }

      if (module['Run']) {
        if (!module['id']) module = { ...module, id: eachEntry }
        console.warn(`Found module: ${module['id']}`)
        testModules.push(module)
      }
    }
  }
  await functionFinished
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
  /** @type {TestModule[]} */
  let testModules = []
  try {
    await FindTestModules(config.testDir, testModules)
  } catch (error) {
    console.error(error)
    err = -1
  }
  if (err !== null) return err
  console.warn()

  let failedTests = 0
  try {
    failedTests = await RunTests(testModules, config)
  } catch (error) {
    console.log(error)
    err = -1
  }

  return err || failedTests
}

jester()
