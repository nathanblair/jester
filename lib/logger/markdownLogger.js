import { TestLogger } from './testLogger.js'

/** A markdown implementation of the TestLogger */
export class MarkdownLogger extends TestLogger {

  /** @param {String} id the identifier of the test module */
  WriteModuleHead(id) {
    this.Log(`<details>\n<summary>${id}</summary>`, TestLogger.Channels.MODULE)
  }

  /**
   * @param {Boolean} result the number of failed assertions
   * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
   */
  WriteAssertionResult(result, shouldMsg) {
    this.Log(` - [${result ? 'X' : ' '}] ${shouldMsg}`, TestLogger.Channels.ASSERTION)
  }

  /**
   * @param {String} id
   * @param {Number} totalAssertions
   * @param {Number} failedAssertions
   */
  WriteModuleSummary(id, totalAssertions, failedAssertions) {
    this.Log(
      `### ${id} Summary (passed/total): ${totalAssertions -
        failedAssertions}/${totalAssertions}\n</details>\n`, TestLogger.Channels.MODULE
    )
  }

  /**
   * @param {Number} testingTime
   * @param {Number} failedTests
   * @param {Number} totalTests
   */
  WriteTestingSummary(testingTime, failedTests, totalTests) {
    this.Log(
      `\nTime:                   ${testingTime.toFixed(1)} ms\n` +
        `Summary (passed/total): ${totalTests - failedTests}/${totalTests} ${
          failedTests === 0 ? '✓' : '✗'
        }`, TestLogger.Channels.OVERALL
    )
  }
}
