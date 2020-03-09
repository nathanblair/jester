#!/usr/bin/env node

//import { sep as pathSep } from 'path'
//import { writeFileSync, } from 'fs'
//import { Session } from 'inspector'
import { readdir, stat } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'
import { Status } from '../lib/status.js'
import { Configure } from '../lib/configure.js'

/** @typedef {{Run: Function, id: String}} TestModule */

/**
 * @param {TestModule[]} testModules
 * @param {Configure} config
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
    config.logger.WriteTestHead(eachTestModule.id)
    const status = new Status()
    runTestsPromise.push(
      new Promise(async resolve => {
        config.dryRun || (await eachTestModule.Run(status, config.logger))
        resolve(status.failedAssertions !== 0 ? 1 : 0)
      })
    )
    config.logger.WriteModuleSummary(eachTestModule.id, status)
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
  config.logger.WriteTestingSummary(
    endingTime - initialTime,
    failedTests,
    testsRun
  )

  return failedTests
}

/**
 * @param {String} dir
 * @param {Logger} logger
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
    logger.Error(error)
    return Promise.resolve([])
  }
}

/**
 * @param {String} path
 * @param {Logger} logger
 *
 * @returns {Promise<import('fs').Stats?>}
 */
function GetEntryStats(path, logger) {
  try {
    return new Promise((resolve, reject) => {
      stat(path, (err, stats) => (err ? reject(err) : resolve(stats)))
    })
  } catch (error) {
    logger.Error(error)
    return Promise.resolve(null)
  }
}

/**
 * @param {String} dir
 * @param {Logger} logger
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
        logger.Error(error)
        continue
      }

      if (module['Run']) {
        if (!module['id']) module = { ...module, id: eachEntry }
        logger.Debug(`Found module: ${module['id']}`)
        testModules.push(module)
      }
    }
  }
  await functionFinished
}

async function jester() {
  const config = new Configure()
  if (config.exitAfter) return config.exitCode

  let err = null
  /** @type {TestModule[]} */
  let testModules = []
  try {
    await FindTestModules(config.testDir, config.logger, testModules)
  } catch (error) {
    config.logger.Error(error)
    err = -1
  }
  if (err !== null) return err
  config.logger.Warn()

  let failedTests = 0
  try {
    failedTests = await RunTests(testModules, config)
  } catch (error) {
    config.logger.Error(error)
    err = -1
  }

  return err || failedTests
}

jester()
