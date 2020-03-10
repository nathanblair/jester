#!/usr/bin/env node

import { Session } from 'inspector'
import { sep as pathSep } from 'path'
import { writeFile, readdir, stat, unlink } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'
import { Status } from '../lib/status.js'
import { Configure } from '../lib/configure.js'

/** @typedef {{Run: Function, id: String}} TestModule */
/** @typedef {import('../lib/logger/testLogger.js').TestLogger} TestLogger */

/**
 * @param {Session} session
 */
async function StartCoverage(session) {
  session.connect()
  await new Promise((resolve, reject) =>
    session?.post('Profiler.enable', {}, err =>
      err ? reject(err) : resolve(null)
    )
  )
  await new Promise((resolve, reject) =>
    session?.post(
      'Profiler.startPreciseCoverage',
      {
        callCount: true,
        detailed: true,
      },
      err => (err ? reject(err) : resolve(null))
    )
  )
}

/**
 * @param {Session} session
 * @param {TestLogger} logger
 * @param {String} coverageDir
 * @param {Boolean} clearCoverage
 */
async function WriteCoverageResults(
  session,
  logger,
  coverageDir,
  clearCoverage
) {
  /** @type {import('inspector').Profiler.TakePreciseCoverageReturnType?} */
  let data = null
  try {
    data = await new Promise((resolve, reject) => {
      session?.post('Profiler.takePreciseCoverage', (err, data) =>
        err ? reject(err) : resolve(data)
      )
    })
  } catch (err) {
    logger.Error(err)
  }

  if (data === null) return

  if (clearCoverage) {
    /** @type {string[]} */
    let entries = []
    try {
      entries = await new Promise((resolve, reject) => {
        readdir(coverageDir, (err, entries) =>
          err ? reject(err) : resolve(entries)
        )
      })
    } catch (err) {
      logger.Error(err)
    }

    for (const eachEntry of entries) {
      if (eachEntry === '.gitignore') continue
      const coverageFile = join(coverageDir, eachEntry)
      logger.Debug(`Removing ${coverageFile}`)
      try {
        await new Promise((resolve, reject) => {
          unlink(coverageFile, err => (err ? reject(err) : resolve(null)))
        })
      } catch (err) {
        logger.Error(err)
        return
      }
    }
  }

  const coverageFile = `${coverageDir}${pathSep}coverage-${Date.now()}.json`
  logger.Debug(`Writing ${coverageFile}`)
  try {
    await new Promise((resolve, reject) => {
      writeFile(coverageFile, JSON.stringify(data), err =>
        err ? reject(err) : resolve(null)
      )
    })
  } catch (err) {
    logger.Error(err)
  }
}

/**
 * @param {TestModule[]} testModules
 * @param {Configure} config
 * @returns {Promise<Number>} totalFailedTests
 */
async function RunTests(testModules, config) {
  const session = new Session()
  config.coverageEnabled && (await StartCoverage(session))

  const runTestsPromise = []
  const initialTime = performance.now()
  for (const eachTestModule of testModules) {
    config.logger.WriteModuleHead(eachTestModule.id)
    const status = new Status()
    runTestsPromise.push(
      new Promise(async resolve => {
        config.dryRun || (await eachTestModule.Run(status, config.logger))
        resolve(status.failedAssertions !== 0 ? 1 : 0)
      })
    )
    config.logger.WriteModuleSummary(
      eachTestModule.id,
      status.totalAssertions,
      status.failedAssertions
    )
  }
  const testResults = await Promise.all(runTestsPromise)
  const endingTime = performance.now()

  config.coverageEnabled &&
    (await WriteCoverageResults(
      session,
      config.logger,
      config.coverageDir,
      config.clearCoverage
    ))

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
 * @param {TestLogger} logger
 *
 * @returns {Promise<String[]>}
 */
function GetEntries(dir, logger) {
  logger.Debug(`Looking in: ${dir}`)
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
 * @param {TestLogger} logger
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
 * @param {TestLogger} logger
 * @param {String[]} excludeDirs
 * @param {TestModule[]} testModules
 */
async function FindTestModules(dir, logger, excludeDirs, testModules) {
  let functionFinished
  for (const eachEntry of await GetEntries(dir, logger)) {
    const fullPath = join(dir, eachEntry)
    const entryStats = await GetEntryStats(fullPath, logger)
    if (entryStats?.isDirectory()) {
      if (excludeDirs.indexOf(fullPath) >= 0) {
        logger.Debug(`${fullPath} is excluded. Skipping...`)
        continue
      }
      functionFinished = new Promise(resolve =>
        resolve(FindTestModules(fullPath, logger, excludeDirs, testModules))
      )
    } else if (entryStats?.isFile()) {
      logger.Debug(`Found file: ${fullPath}`)
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

  /** @type {TestModule[]} */
  let testModules = []
  try {
    for (let eachDirectory of config.testDirs) {
      eachDirectory = join(process.cwd(), eachDirectory)
      await FindTestModules(
        eachDirectory,
        config.logger,
        config.excludeDirs,
        testModules
      )
    }
  } catch (error) {
    config.logger.Error(error)
    process.exitCode = -1
    return
  }

  let failedTests = 0
  try {
    failedTests = await RunTests(testModules, config)
  } catch (error) {
    config.logger.Error(error)
    process.exitCode = -1
    return
  }

  process.exitCode = failedTests
  return
}

jester()
