import { TestLogger } from './testLogger.js'

/** A markdown implementation of the TestLogger */
export class MarkdownLogger extends TestLogger {
  /**
   * @param {String} message the string message to log
   * @param {Number} _channels
   */
  Log(message = '', _channels) {
    console.log(message)
  }

  /** @param {String} id the identifier of the test module */
  WriteModuleHead(id) {
    console.log(`<details>\n<summary>${id}</summary>`)
  }

  /**
   * @param {Boolean} result the number of failed assertions
   * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
   */
  WriteTestResult(result, shouldMsg) {
    console.log(` - [${result ? 'X' : ' '}] ${shouldMsg}`)
  }

  /**
   * @param {String} id
   * @param {Number} totalAssertions
   * @param {Number} failedAssertions
   */
  WriteTestFoot(id, totalAssertions, failedAssertions) {
    console.log(
      `### ${id} Summary (passed/total): ${totalAssertions -
        failedAssertions}/${totalAssertions}\n</details>\n`
    )
  }

  /**
   * @param {Number} testingTime
   * @param {Number} failedTests
   * @param {Number} totalTests
   */
  WriteTestSummary(testingTime, failedTests, totalTests) {
    console.log(
      `\nTesting took ${testingTime.toFixed(
        1
      )} ms\n\nTesting summary (passed/total): ${totalTests -
        failedTests}/${totalTests}${failedTests === 0 ? '✓' : '✗'}`
    )
  }
}
