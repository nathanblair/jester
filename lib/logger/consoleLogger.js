import { TestLogger } from './testLogger.js'

/** A console implementation of the TestLogger */
export class ConsoleLogger extends TestLogger {
  static Reset = '\x1b[0m'
  static Bright = '\x1b[1m'
  static Dim = '\x1b[2m'
  static Underscore = '\x1b[4m'
  static Blink = '\x1b[5m'
  static Reverse = '\x1b[7m'
  static Hidden = '\x1b[8m'

  static FgBlack = '\x1b[30m'
  static FgRed = '\x1b[31m'
  static FgGreen = '\x1b[32m'
  static FgYellow = '\x1b[33m'
  static FgBlue = '\x1b[34m'
  static FgMagenta = '\x1b[35m'
  static FgCyan = '\x1b[36m'
  static FgWhite = '\x1b[37m'

  static BgBlack = '\x1b[40m'
  static BgRed = '\x1b[41m'
  static BgGreen = '\x1b[42m'
  static BgYellow = '\x1b[43m'
  static BgBlue = '\x1b[44m'
  static BgMagenta = '\x1b[45m'
  static BgCyan = '\x1b[46m'
  static BgWhite = '\x1b[47m'

  /**
   * @param {String} message the string message to log
   * @param {Number} channels bitmask of the channels to send the message
   */
  Log(message = '', channels) {
    if (!(channels & this.enabledChannels)) {
      process.stdout.write('') // This is a BS add but JS doesn't perform correctly if its not included
      return
    }

    const inErrorChannel = channels & ConsoleLogger.Channels.ERROR
    const inWarnChannel = channels & ConsoleLogger.Channels.WARN
    const inInfoChannel = channels & ConsoleLogger.Channels.INFO
    const inDebugChannel = channels & ConsoleLogger.Channels.DEBUG

    /** @type {String[]} */
    const channelNames = []
    inErrorChannel &&
      channelNames.push(`${ConsoleLogger.FgRed}ERROR${ConsoleLogger.Reset}`)
    inWarnChannel &&
      channelNames.push(`${ConsoleLogger.FgYellow}WARN${ConsoleLogger.Reset}`)
    inInfoChannel && channelNames.push(`INFO`)
    inDebugChannel &&
      channelNames.push(`${ConsoleLogger.Dim}DEBUG${ConsoleLogger.Reset}`)

    const prefix =
      inErrorChannel | inWarnChannel | inInfoChannel | inDebugChannel
        ? `${new Date().toLocaleTimeString()} [${channelNames}] `
        : ''
    const stream = inErrorChannel ? process.stderr : process.stdout
    stream.write(`${prefix}${message}\n`)
  }

  /** @param {String} id the identifier of the test module */
  WriteModuleHead(id) {
    this.Log(`${id}`, TestLogger.Channels.MODULE)
  }

  /**
   * @param {Boolean} result the number of failed assertions
   * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
   * @param {Boolean} skipped whether the assertion was skipped
   */
  WriteAssertionResult(result, shouldMsg, skipped) {
    this.Log(
      ` [${
        skipped
          ? `${ConsoleLogger.Dim}SKIP`
          : result
          ? `${ConsoleLogger.FgGreen}PASS`
          : `${ConsoleLogger.FgRed}FAIL`
      }${ConsoleLogger.Reset}] ${shouldMsg}`,
      TestLogger.Channels.ASSERTION
    )
  }

  /**
   * @param {String} id
   * @param {Number} totalAssertions
   * @param {Number} failedAssertions
   */
  WriteModuleSummary(id, totalAssertions, failedAssertions) {
    const color =
      failedAssertions === 0 ? ConsoleLogger.FgGreen : ConsoleLogger.FgRed
    this.Log(
      `  ↳ ${id} Summary (passed/total): ${color}${totalAssertions -
        failedAssertions}/${totalAssertions}${ConsoleLogger.Reset}\n`,
      TestLogger.Channels.MODULE
    )
  }

  /**
   * @param {Number} testingTime
   * @param {Number} failedTests
   * @param {number} totalTests
   */
  WriteTestingSummary(testingTime, failedTests, totalTests) {
    const color =
      failedTests === 0 ? ConsoleLogger.FgGreen : ConsoleLogger.FgRed
    this.Log(
      `Time:                   ${testingTime.toFixed(1)} ms\n` +
        `Summary (passed/total): ${color}${totalTests -
          failedTests}/${totalTests}${ConsoleLogger.Reset}`,
      TestLogger.Channels.OVERALL
    )
  }
}
