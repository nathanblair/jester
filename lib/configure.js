import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { TestLogger } from '../lib/logger/testLogger.js'
import { MarkdownLogger } from '../lib/logger/markdownLogger.js'
import { ConsoleLogger } from '../lib/logger/consoleLogger.js'

const pkg = JSON.parse(readFileSync("./package.json").toString("utf-8"))

/** @typedef {{ testDir: String, logger: TestLogger, dryRun: Boolean, coverageDir: String }} Config */

/**
 * @returns {Config}
 */
export class Configure {
  exitCode = 0
  exitAfter = false
  /** @type {String[]} */
  testDirs = []
  /** @type {String[]} */
  excludeDirs = []
  dryRun = false
  coverageDir = 'coverage'
  coverageEnabled = false
  clearCoverage = false
  enabledChannels =
    TestLogger.Channels.ERROR |
    TestLogger.Channels.WARN |
    TestLogger.Channels.INFO |
    TestLogger.Channels.OVERALL |
    TestLogger.Channels.MODULE |
    TestLogger.Channels.ASSERTION
  /** @type {TestLogger} */
  logger = new ConsoleLogger()

  args = {
    '-v': (_index, argLength) => {
      console.log(pkg.version)
      this.exitAfter = true
      return argLength
    },
    '-h': (_index, argLength) => {
      this.showHelp()
      this.exitAfter = true
      return argLength
    },
    '-f': (index, argLength, nextElement) => {
      switch (nextElement) {
        case 'text':
          break
        case 'md':
          this.logger = new MarkdownLogger()
          break
        default:
          this.errorOut(`Invalid format: ${nextElement}`)
          return argLength
      }
      return ++index
    },
    '-c': (index, argLength, nextElement) => {
      const parsedBinary = parseInt(nextElement, 2)
      if ([...Array(128).keys()].indexOf(parsedBinary) < 0) {
        this.errorOut(
          `Invalid value (must be between 0 and 127): ${nextElement}`
        )
        return argLength
      }
      this.enabledChannels = parsedBinary
      return ++index
    },
    '-d': (index, _argLength, nextElement) => {
      this.testDirs.push(nextElement)
      return ++index
    },
    '-x': (index, _argLength, nextElement) => {
      this.excludeDirs.push(nextElement)
      return ++index
    },
    '-o': (index, _argLength, nextElement) => {
      this.coverageDir = nextElement
      return ++index
    },
    '-n': index => {
      this.dryRun = true
      return index
    },
    '-g': index => {
      this.coverageEnabled = true
      return index
    },
    '-s': index => {
      this.clearCoverage = true
      return index
    },
  }

  showHelp() {
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
        -g                    enable code coverage
        -c                    set the bitmask channel(s) of output (defaults to '1110111' - All but DEBUG)
           1 = 'ERROR'
           2 = 'WARN'
           4 = 'INFO'
           8 = 'DEBUG'
           16 = 'OVERALL'
           32 = 'MODULE'
           64 = 'ASSERTION'

        -d testDir            relative path containing tests (defaults to 'tests')
                              pass multiple times to add more directories
                              all subdirectories will be searched automatically

        -x excludeDir         relative path of directory to exclude from test search path
                              pass multiple times to add more directories
                              all subdirectories of this directory will be skipped as well

        -f format
          text                print plain text to stdout (default)
          md                  print markdown formatted text to stdout

        -g                    enable code coverage
        -o outputDir          the name of the folder you want coverage data written to
                              (defaults to 'coverage')
        -s                    clear code coverage-out directory before writing new data
    `
    )
  }

  /** @param {String} message */
  errorOut(message) {
    console.error(message)
    this.showHelp()
    this.exitCode = 1
    this.exitAfter = true
  }

  constructor() {
    for (let index = 2; index < process.argv.length; index++) {
      const option = process.argv[index]

      const operation = this.args[option]
      if (operation == undefined) {
        this.errorOut(`Invalid options: ${option}`)
        return
      }
      index = operation(index, process.argv.length, process.argv[index + 1])
    }

    this.logger.enabledChannels = this.enabledChannels
    if (this.exitAfter) return

    this.logger.Debug(`Logging using: ${this.logger.constructor.name}`)
    this.logger.Debug(`Enabled channels: ${this.logger.enabledChannels}`)

    this.coverageEnabled && this.logger.Debug('Coverage enabled')
    this.clearCoverage &&
      this.logger.Debug('Coverage directory will be cleared')

    this.coverageDir = join(process.cwd(), this.coverageDir)
    if (!existsSync(this.coverageDir)) {
      this.errorOut(`Unable to find coverage directory: ${this.coverageDir}`)
      return
    }
    this.logger.Debug(`Writing coverage data to: ${this.coverageDir}`)

    this.testDirs.length === 0 && this.testDirs.push('tests')
    this.logger.Debug(`Importing tests from: [${this.testDirs}]`)
    for (const eachDirIndex in this.testDirs) {
      if (!existsSync(this.testDirs[eachDirIndex])) {
        this.errorOut(
          `Unable to find test directory: ${this.testDirs[eachDirIndex]}`
        )
        return
      }
    }

    this.logger.Debug(`Excluding tests from: [${this.excludeDirs}]`)
    for (let eachDirIndex in this.excludeDirs) {
      this.excludeDirs[eachDirIndex] = join(
        process.cwd(),
        this.excludeDirs[eachDirIndex]
      )
      if (!existsSync(this.excludeDirs[eachDirIndex])) {
        this.errorOut(
          `Unable to find test exclusion directory: ${this.excludeDirs[eachDirIndex]}`
        )
        return
      }
    }
  }
}
