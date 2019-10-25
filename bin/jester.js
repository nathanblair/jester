#!/usr/bin/env node

import { existsSync, readdir, stat, writeFileSync } from "fs"
import { Session } from "inspector";
import { join, sep as pathSep } from "path"
import { performance } from "perf_hooks"
import { TestLogger } from "../lib/logger.js"
import { Test } from "../lib/test.js"
import pkg from "../package.json"

/** @typedef {"text" | "md"} Format */
/** @typedef {{ testDir: String, format: Format, dryRun: Boolean, coverageDir: String }} Config */

function showHelp() {
  console.log(
    `
    Name:         ${pkg.name}
    Author:       ${pkg.author}
    Version:      ${pkg.version}
    Description:  ${pkg.description}
    License:      ${pkg.license}

    Usage:
        (npx) jester [options]

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
function Configure(config) {
  console.warn("")
  const availableFormats = ["text", "md"]
  const availableOptions = ["-d", "-f", "-o", "-n", "-h", "-v"]

  for (let index = 2; index < process.argv.length; index++) {
    const option = process.argv[index]
    if (availableOptions.indexOf(option) === -1) {
      console.error(`Invalid options: ${option}`)
      showHelp()
      return 1
    }

    const nextElement = process.argv[index + 1]
    switch (option) {
      case "-v":
        console.log(`Version: ${pkg.version}`)
        return 0

      case "-h":
        showHelp()
        return 0

      case "-d":
        // @ts-ignore
        config.testDir = nextElement || ""
        index++
        break

      case "-f":
        // @ts-ignore
        config.format = nextElement || ""
        index++
        break

      case "-o":
        config.coverageDir = nextElement || ""
        index++
        break

      case "-n":
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
  console.warn(`Writing coverage data to: ${config.coverageDir}`)

  if (!existsSync(config.coverageDir)) {
    console.error("Coverage output directory doesn't exist!")
    return 1
  }

  config.testDir = join(process.cwd(), config.testDir)
  console.warn(`Importing tests from: ${config.testDir}`)
  if (!existsSync(config.testDir)) {
    console.error(`${config.testDir} doesn't exist!`)
    return 1
  }
  console.warn("")

  return null
}

/**
 * @param {typeof Test} test
 * @param {TestLogger} testLogger
 * @param {boolean} dryRun
 */
async function RunTest(test, testLogger, dryRun) {
  testLogger.WriteTestHead(test.testClassName)

  let [failedAssertions, totalAssertions] = [0, 0]

  if (!dryRun) [failedAssertions, totalAssertions] = await test.Run(testLogger)

  testLogger.WriteTestFoot(test.testClassName, failedAssertions, totalAssertions)
  return failedAssertions !== 0 ? 1 : 0
}

/**
 *
 * @param {typeof Test[]} testClasses
 * @param {TestLogger} testLogger
 * @param {Boolean} dryRun
 * @param {String} coverageDir
 * @returns {Promise<Number[]>} [totalFailedTests, testsRun, testingTime]
 */
async function RunTests(testClasses, testLogger, dryRun, coverageDir) {
  let testResults = []
  const session = new Session()
  session.connect()
  session.post("Profiler.enable")
  // session.post("Profiler.startPreciseCoverage", {callCount: true, detailed: true})

  const initialTime = performance.now();
  testResults  = await Promise.all(testClasses.map(eachTest => RunTest(eachTest, testLogger, dryRun)))
  const endingTime = performance.now()

  // session.post("Profiler.takePreciseCoverage", (err, data) => {
  session.post("Profiler.getBestEffortCoverage", (err, data) => {
    // session.post("Profiler.stopPreciseCoverage")
    if (err) return console.error(err)

    // TODO Empty out the directory
    writeFileSync(`${coverageDir}${pathSep}coverage-${Date.now()}.json`, JSON.stringify(data))
  })

  const totalFailedTests = testResults.reduce((a, b) => (a + b), 0)
  const totalTestsRun = testResults.length

  return [totalFailedTests, totalTestsRun, (endingTime - initialTime)]
}

/**
 * @param {String} fullPath
 */
function GetPathStats(fullPath) {
  return new Promise((resolve, reject) => {
    stat(fullPath, (err, stats) => { if (err) reject(err); resolve(stats) })
  })
}

/**
 * @param {String} module a module path
 * @param {typeof Test[]} testClasses
 */
async function ImportTestClasses(module, testClasses) {
  module = module.replace(/\\/g, "/")
  module = module.replace(/c:/ig, "")
  let moduleExports = null
  try {
    moduleExports = await import(module)
  } catch (error) {
    console.error(error)
    return
  }

  for (const eachExportName in moduleExports) {
    const eachExport = moduleExports[eachExportName]
    if (eachExport.__proto__.name === Test.name) testClasses.push(eachExport)
  }
  return
}

/**
 * @param {String} fullPath
 * @param {typeof Test[]} testClasses
 */
async function EntryCallBack(fullPath, testClasses) {
  /** @type {import('fs').Stats} */
  let entryStats = null
  try {
    entryStats = await GetPathStats(fullPath)
  } catch (error) {
    console.error(error)
  }

  switch (true) {
    case entryStats === null:
      break

    case entryStats.isFile():
      console.warn(`Found file: ${fullPath}`)
      return await ImportTestClasses(fullPath, testClasses)

    case entryStats.isDirectory():
      return await FindTestClasses(fullPath, testClasses)
  }
}

/**
 * @param {String} dir
 */
function GetEntriesInDir(dir) {
  return new Promise((resolve, reject) => {
    readdir(dir, (err, entries) => { if (err) reject(err); resolve(entries) })
  })
}

/**
 * @param {String} dir
 * @param {typeof Test[]} testClasses
 */
async function FindTestClasses(dir, testClasses) {
  console.warn(`Looking in: ${dir}`)
  let entries = []
  try {
    entries = await GetEntriesInDir(dir)
  } catch (error) {
    console.error(error)
  }

  let entryPromises = []
  /**
   * @param {string} entry
   */
  entries.forEach(entry =>
    entryPromises.push(new Promise(async (resolve, _) =>
      resolve(await EntryCallBack(join(dir, entry), testClasses))
    ))
  )

  await Promise.all(entryPromises)
  return
}

/**
 *
 */
async function jester() {
  /** @type {Config} */
  const config = {testDir: "tests", format: "text", dryRun: false, coverageDir: "coverage"}
  if (Configure(config) !== null) return 0

  let err = null
  let testClasses = []
  try {
    await FindTestClasses(config.testDir, testClasses)
  } catch (error) {
    console.error(error)
    err = -1
  }
  if (err !== null) return err

  console.warn(`Found ${testClasses.length} tests`)
  console.warn("")

  let testsRun = 0
  let failedTests = 0
  let testingTime = 0.0
  const testLogger = new TestLogger(config.format)

  try {
    [failedTests, testsRun, testingTime] =
      await RunTests(testClasses, testLogger, config.dryRun, config.coverageDir)
  } catch (error) {
    console.log(error)
    err = -1
  }

  testLogger.WriteTestSummary(testingTime, failedTests, testsRun)
  return err || failedTests
}

jester()
