import {TestLogger} from '../lib/logger.js'
import {Status} from '../lib/status.js'

/** A console implementation of the TestLogger */
export class ConsoleLogger extends TestLogger {
  static Reset = "\x1b[0m"
  static Bright = "\x1b[1m"
  static Dim = "\x1b[2m"
  static Underscore = "\x1b[4m"
  static Blink = "\x1b[5m"
  static Reverse = "\x1b[7m"
  static Hidden = "\x1b[8m"

  static FgBlack = "\x1b[30m"
  static FgRed = "\x1b[31m"
  static FgGreen = "\x1b[32m"
  static FgYellow = "\x1b[33m"
  static FgBlue = "\x1b[34m"
  static FgMagenta = "\x1b[35m"
  static FgCyan = "\x1b[36m"
  static FgWhite = "\x1b[37m"

  static BgBlack = "\x1b[40m"
  static BgRed = "\x1b[41m"
  static BgGreen = "\x1b[42m"
  static BgYellow = "\x1b[43m"
  static BgBlue = "\x1b[44m"
  static BgMagenta = "\x1b[45m"
  static BgCyan = "\x1b[46m"
  static BgWhite = "\x1b[47m"

  /** @param {String} testId the identifier of the test module */
  WriteTestHead(testId) {
    console.warn(`\n${testId}`)
  }

  /**
    * @param {Boolean} result the number of failed assertions
    * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
    */
  WriteTestResult(result, shouldMsg) {
    console.warn(` - ${shouldMsg} : ${result ? `${ConsoleLogger.FgGreen}PASS` : `${ConsoleLogger.FgRed}FAIL`}${ConsoleLogger.Reset}`)
  }

  /** @param {String} testClassFriendlyName @param {Status} status */
  WriteTestFoot(testClassFriendlyName, status) {
    const color = status.failedAssertions === 0 ? ConsoleLogger.FgGreen : ConsoleLogger.FgRed
    console.warn(` // ${testClassFriendlyName} Summary (passed/total): ${color}${(status.totalAssertions - status.failedAssertions)}/${status.totalAssertions}${ConsoleLogger.Reset}`)
  }

  /** @param {Number} testingTime @param {Number} failedTests @param {number} totalTests */
  WriteTestSummary(testingTime, failedTests, totalTests) {
    console.log('')
    console.log(`Testing took ${testingTime.toFixed(1)} ms`)
    console.log('')
    const color = failedTests === 0 ? ConsoleLogger.FgGreen : ConsoleLogger.FgRed
    console.log(`Testing summary (passed/total): ${color}${(totalTests - failedTests)}/${totalTests}${ConsoleLogger.Reset}`)
  }
}
