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
/** @typedef {{ testDir: String, logger: TestLogger?, dryRun: Boolean, coverageDir: String }} Config */
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

      case '-f':
        switch (nextElement) {
          case 'text':
            config.logger = new ConsoleLogger(0b1111, 0b1111)
            break
          case 'md':
            config.logger = new MarkdownLogger(0b1111, 0b1111)
            break
          default:
            console.error(`Invalid format: ${nextElement}`)
            showHelp()
            return 1
        }
        index++
        break

      case '-d':
        // @ts-ignore
        config.testDir = nextElement || ''
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

  config.logger?.Debug(`Logging using: ${config.logger.constructor.name}`)

  config.coverageDir = join(process.cwd(), config.coverageDir)
  if (!existsSync(config.coverageDir)) {
    config.logger?.Error(
      `Unable to find coverage directory: ${config.coverageDir}`
    )
    return 1
  }
  config.logger?.Debug(`Writing coverage data to: ${config.coverageDir}`)

  config.testDir = join(process.cwd(), config.testDir)
  if (!existsSync(config.testDir)) {
    config.logger?.Error(`Unable to find test directory: ${config.testDir}`)
    return 1
  }
  config.logger?.Debug(`Importing tests from: ${config.testDir}`)
  config.logger?.Info('')

  return null
}

/**
 * @param {TestModule[]} testModules
 * @param {Config} config
 * @returns {Promise<Number>} totalFailedTests
 */
async function RunTests(testModules, config) {
  //const session = new Session()
  //session.connect()
  //session.post('Profiler.enable')
  //session.post('Profiler.startPreciseCoverage', {callCount: true, detailed: true})

  const runTestsPromise = []
  const initialTime = performance.now()
  for (const eachTestModule of testModules) {
    config.logger?.WriteTestHead(eachTestModule.id)
    const status = new Status()
    runTestsPromise.push(
      new Promise(async resolve => {
        config.dryRun || (await eachTestModule.Run(status, config.logger))
        resolve(status.failedAssertions !== 0 ? 1 : 0)
      })
    )
    config.logger?.WriteModuleSummary(eachTestModule.id, status)
  }
  const testResults = await Promise.all(runTestsPromise)
  const endingTime = performance.now()

  //session.post('Profiler.takePreciseCoverage', (err, data) => {
  //session.post('Profiler.getBestEffortCoverage', (err, data) => {
  //if (err) {config.logger.Error(err); return}
  //writeFileSync(`${_coverageDir}${pathSep}coverage-${Date.now()}.json`, JSON.stringify(data))
  //})

  const failedTests = testResults.reduce((a, b) => a + b, 0)
  const testsRun = testResults.length
  config.logger?.WriteTestingSummary(
    endingTime - initialTime,
    failedTests,
    testsRun
  )

  return failedTests
}

/**
 * @param {String} dir
 * @param {TestLogger?} logger
 *
 * @returns {Promise<String[]>}
 */
function GetEntries(dir, logger) {
  //logger.Warn(`Looking in: ${dir}`)
  try {
    return new Promise((resolve, reject) => {
      readdir(dir, (err, entries) => (err ? reject(err) : resolve(entries)))
    })
  } catch (error) {
    logger?.Error(error)
    return Promise.resolve([])
  }
}

/**
 * @param {String} path
 * @param {TestLogger?} logger
 *
 * @returns {Promise<import('fs').Stats?>}
 */
function GetEntryStats(path, logger) {
  try {
    return new Promise((resolve, reject) => {
      stat(path, (err, stats) => (err ? reject(err) : resolve(stats)))
    })
  } catch (error) {
    logger?.Error(error)
    return Promise.resolve(null)
  }
}

/**
 * @param {String} dir
 * @param {TestLogger?} logger
 * @param {TestModule[]} testModules
 */
async function FindTestModules(dir, logger, testModules) {
  let functionFinished
  for (const eachEntry of await GetEntries(dir, logger)) {
    const fullPath = join(dir, eachEntry)
    const entryStats = await GetEntryStats(fullPath, logger)
    if (entryStats?.isDirectory()) {
      functionFinished = new Promise(resolve =>
        resolve(FindTestModules(fullPath, logger, testModules))
      )
    } else if (entryStats?.isFile()) {
      //logger.Warn(`Found file: ${fullPath}`)
      /** @type {TestModule} */
      let module
      try {
        module = await import(fullPath.replace(/\\/g, '/').replace(/c:/gi, ''))
      } catch (error) {
        logger?.Error(error)
        continue
      }

      if (module['Run']) {
        if (!module['id']) module = { ...module, id: eachEntry }
        logger?.Debug(`Found module: ${module['id']}`)
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
    logger: null,
    dryRun: false,
    coverageDir: 'coverage'
  }
  if (Configure(config) !== null) return 0

  let err = null
  /** @type {TestModule[]} */
  let testModules = []
  try {
    await FindTestModules(config.testDir, config.logger, testModules)
  } catch (error) {
    config.logger?.Error(error)
    err = -1
  }
  if (err !== null) return err
  config.logger?.Warn()

  let failedTests = 0
  try {
    failedTests = await RunTests(testModules, config)
  } catch (error) {
    config.logger?.Error(error)
    err = -1
  }

  return err || failedTests
}

jester()
