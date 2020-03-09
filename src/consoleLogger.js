import { TestLogger } from '../lib/logger.js'

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
   * @param {TestLogger.Level} [enabledLevel]
   * @param {TestLogger.Channel} [enabledChannel]
   */
  constructor(enabledLevel, enabledChannel) {
    super(enabledLevel, enabledChannel)
    /** @type {{message: String, time: String, level: TestLogger.Level, channel: TestLogger.Channel}[]} */
    this.buffer = []
  }

  /**
   * @param {String} message the string message to log
   * @param {TestLogger.Level} level
   * @param {TestLogger.Channel} channel
   */
  Log(message = '', level, channel) {
    if (!(channel & this.enabledChannel) || !(level & this.enabledLevel)) return

    this.buffer.push({
      message: `${message}\n`,
      time: new Date().toLocaleTimeString(),
      level: level,
      channel: channel
    })
    process.stdout.write('\x1b[3J')

    for (const eachMessage of this.buffer) {
      (channel & TestLogger.errorChannel
        ? process.stderr
        : process.stdout
      ).write(
        `${
          channel & TestLogger.debugChannel
            ? `${eachMessage.time} [${eachMessage.channel}] - `
            : ''
        }${eachMessage.message}`
      )
    }
  }

  /** @param {String} testId the identifier of the test module */
  WriteTestHead(testId) {
    this.Log(
      `${testId}`,
      TestLogger.overallSummaryLevel,
      TestLogger.infoChannel
    )
  }

  /**
   * @param {Boolean} result the number of failed assertions
   * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
   */
  WriteAssertionResult(result, shouldMsg) {
    this.Log(
      ` [${
        result ? `${ConsoleLogger.FgGreen}PASS` : `${ConsoleLogger.FgRed}FAIL`
      }${ConsoleLogger.Reset}] ${shouldMsg}`,
      TestLogger.assertionResultLevel,
      TestLogger.infoChannel
    )
  }

  /** @param {String} testClassFriendlyName @param {import('../lib/status').Status} status */
  WriteModuleSummary(testClassFriendlyName, status) {
    const color =
      status.failedAssertions === 0
        ? ConsoleLogger.FgGreen
        : ConsoleLogger.FgRed
    this.Log(
      `  ↳ ${testClassFriendlyName} Summary (passed/total): ${color}${status.totalAssertions -
        status.failedAssertions}/${status.totalAssertions}${
        ConsoleLogger.Reset
      }\n`,
      TestLogger.moduleSummaryLevel,
      TestLogger.infoChannel
    )
  }

  /** @param {Number} testingTime @param {Number} failedTests @param {number} totalTests */
  WriteTestingSummary(testingTime, failedTests, totalTests) {
    this.Log(
      `Testing took ${testingTime.toFixed(1)} ms`,
      TestLogger.overallSummaryLevel,
      TestLogger.infoChannel
    )
    const color =
      failedTests === 0 ? ConsoleLogger.FgGreen : ConsoleLogger.FgRed
    this.Log(
      `\nTesting summary (passed/total): ${color}${totalTests -
        failedTests}/${totalTests}${ConsoleLogger.Reset}`,
      TestLogger.overallSummaryLevel,
      TestLogger.infoChannel
    )
  }
}
