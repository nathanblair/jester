import { existsSync } from 'fs'
import { join } from 'path'
import { MarkdownLogger } from '../src/markdownLogger.js'
import { ConsoleLogger } from '../src/consoleLogger.js'
import pkg from '../package.json'

/** @typedef {import('../lib/logger.js').Logger} Logger */
/** @typedef {{ testDir: String, logger: Logger, dryRun: Boolean, coverageDir: String }} Config */

/**
 * @returns {Config}
 */
export class Configure {
  exitCode = 0
  exitAfter = false
  testDir = 'tests'
  dryRun = false
  coverageDir = 'coverage'
  /** @type {Logger} */
  logger = new ConsoleLogger()

  #showHelp() {
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
        -l                    set the bitmask level(s) of output (defaults to '1111' - All)
           1 = 'Overall Summary'
           2 = 'Module Summary'
           4 = 'Assertion Result'
           8 = 'General'
        -c                    set the bitmask channel(s) of output (defaults to '0111' - All but DEBUG)
           1 = 'ERROR'
           2 = 'WARN'
           4 = 'INFO'
           8 = 'DEBUG'

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
  #errorOut(message) {
    console.error(message)
    this.#showHelp()
    this.exitCode = 1
    this.exitAfter = true
  }

  #parseArgs() {
    const availableOptions = ['-d', '-f', '-o', '-n', '-h', '-v', '-l', '-c']
    const availableLevels = [...Array(16).keys()]
    const availableChannels = [...Array(16).keys()]
    /** @type {Logger.Level} */
    let enabledLevel = 0b1111
    /** @type {Logger.Channel} */
    let enabledChannel = 0b0111

    for (let index = 2; index < process.argv.length; index++) {
      const option = process.argv[index]
      if (availableOptions.indexOf(option) < 0)
        this.errorOut(`Invalid options: ${option}`)

      const nextElement = process.argv[index + 1]
      const parsedBinary = parseInt(nextElement, 2)
      switch (option) {
        case '-v':
          console.log(`Version: ${pkg.version}`)
          this.exitAfter = true
          return

        case '-h':
          this.#showHelp()
          this.exitAfter = true
          return

        case '-f':
          switch (nextElement) {
            case 'text':
              break
            case 'md':
              this.logger = new MarkdownLogger()
              break
            default:
              this.errorOut(`Invalid format: ${nextElement}`)
              return
          }
          index++
          break

        case '-l':
          if (availableLevels.indexOf(parsedBinary) < 0) {
            this.#errorOut(
              `Invalid value (must be between ${0b0000} and ${0b1111}): ${nextElement}`
            )
            return
          }
          enabledLevel = parsedBinary
          index++
          break

        case '-c':
          if (availableChannels.indexOf(parsedBinary) < 0) {
            this.#errorOut(
              `Invalid value (must be between ${0b0000} and ${0b1111}): ${nextElement}`
            )
            return
          }
          enabledChannel = parsedBinary
          index++
          break

        case '-d':
          // @ts-ignore
          this.testDir = nextElement || ''
          index++
          break

        case '-o':
          this.coverageDir = nextElement || ''
          index++
          break

        case '-n':
          this.dryRun = true
          break

        default:
          break
      }
    }

    this.logger.enabledLevel = enabledLevel
    this.logger.enabledChannel = enabledChannel
  }

  constructor() {
    this.#parseArgs()
    if (this.exitAfter) return

    this.logger.Debug(`Logging using: ${this.logger.constructor.name}`)
    this.logger.Debug(`Enabled channel bitmask: ${this.logger.enabledChannel}`)
    this.logger.Debug(`Enabled level bitmask: ${this.logger.enabledLevel}`)

    this.coverageDir = join(process.cwd(), this.coverageDir)
    if (!existsSync(this.coverageDir)) {
      this.#errorOut(`Unable to find coverage directory: ${this.coverageDir}`)
      return
    }
    this.logger.Debug(`Writing coverage data to: ${this.coverageDir}`)

    this.testDir = join(process.cwd(), this.testDir)
    if (!existsSync(this.testDir)) {
      this.#errorOut(`Unable to find test directory: ${this.testDir}`)
      return
    }
    this.logger.Debug(`Importing tests from: ${this.testDir}`)
    this.logger.Info('')
  }
}
