import {TestLogger} from '../lib/logger.js'

/** A markdown implementation of the TestLogger */
export class MarkdownLogger extends TestLogger {
  /**
   * @param {String} message the string message to log
   * @param {TestLogger.Level} _level
   * @param {TestLogger.Channel} _channel
   */
  Log(message = '', _level, _channel) {
    console.log(message)
  }

  /** @param {String} id the identifier of the test module */
  WriteTestHead(id) {
      console.log(
`<details>
<summary>${id}</summary>
`
      )
  }

  /**
    * @param {Boolean} result the number of failed assertions
    * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
    */
  WriteTestResult(result, shouldMsg) {
      console.log(` - [${result ? "X" : " "}] ${shouldMsg}`)
  }

  /** @param {String} id @param {import('../lib/status').Status} status */
  WriteTestFoot(id, status) {
    console.log(`### ${id} Summary (passed/total): ${(status.totalAssertions - status.failedAssertions)}/${status.totalAssertions}`)
    console.log(`</details>\n`)
  }

  /** @param {Number} testingTime @param {Number} failedTests @param {number} totalTests */
  WriteTestSummary(testingTime, failedTests, totalTests) {
    console.log(`\nTesting took ${testingTime.toFixed(1)} ms\n`)
    console.log(`Testing summary (passed/total): ${(totalTests - failedTests)}/${totalTests} ${failedTests === 0 ? "✓" : "✗"}`)
  }
}
