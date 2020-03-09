import { existsSync } from 'fs'
import { join } from 'path'
import { TestLogger } from '../lib/logger/testLogger.js'
import { MarkdownLogger } from '../lib/logger/markdownLogger.js'
import { ConsoleLogger } from '../lib/logger/consoleLogger.js'
import pkg from '../package.json'

/** @typedef {{ testDir: String, logger: TestLogger, dryRun: Boolean, coverageDir: String }} Config */

/**
 * @returns {Config}
 */
export class Configure {
  exitCode = 0
  exitAfter = false
  testDir = 'tests'
  dryRun = false
  coverageDir = 'coverage'
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
      this.testDir = nextElement || ''
      return ++index
    },
    '-o': (index, _argLength, nextElement) => {
      this.coverageDir = nextElement || ''
      return ++index
    },
    '-n': () => {
      this.dryRun = true
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
        -c                    set the bitmask channel(s) of output (defaults to '1110111' - All but DEBUG)
           1 = 'ERROR'
           2 = 'WARN'
           4 = 'INFO'
           8 = 'DEBUG'
           16 = 'OVERALL'
           32 = 'MODULE'
           64 = 'ASSERTION'

        -d testDir            relative path containing tests (defaults to 'tests')

        -f format
          text                print plain text to stdout (default)
          md                  print markdown formatted text to stdout

        -o outputDir          the name of the folder you want coverage data written to
                              (defaults to 'coverage')
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

    this.coverageDir = join(process.cwd(), this.coverageDir)
    if (!existsSync(this.coverageDir)) {
      this.errorOut(`Unable to find coverage directory: ${this.coverageDir}`)
      return
    }
    this.logger.Debug(`Writing coverage data to: ${this.coverageDir}`)

    this.testDir = join(process.cwd(), this.testDir)
    if (!existsSync(this.testDir)) {
      this.errorOut(`Unable to find test directory: ${this.testDir}`)
      return
    }
    this.logger.Debug(`Importing tests from: ${this.testDir}`)
  }
}
