import {TestLogger} from '../lib/logger.js'
import {Status} from '../lib/status.js'

/** A markdown implementation of the TestLogger */
export class MarkdownLogger extends TestLogger {
  /**
    * @param {Boolean} result the number of failed assertions
    * @param {String} shouldMsg statement of what it means if the tests `passes` or `fails`
    */
  WriteTestResult(result, shouldMsg) {
      console.warn(` - [${result ? "X" : " "}] ${shouldMsg}`)
  }

  /** @param {String} testClassFriendlyName the name of the test class */
  WriteTestHead(testClassFriendlyName) {
      console.warn(
`
<details>
<summary>${testClassFriendlyName}</summary>
`
      )
  }

  /** @param {String} _testClassFriendlyName @param {Status} _status */
  WriteTestFoot(_testClassFriendlyName, _status) {
    console.warn(`</details>`)
  }

  /** @param {Number} testingTime @param {Number} failedTests @param {number} totalTests */
  WriteTestSummary(testingTime, failedTests, totalTests) {
    console.log('')
    console.log(`Testing took ${testingTime.toFixed(1)} ms`)
    console.log('')
    console.log(`Testing summary (passed/total): ${(totalTests - failedTests)}/${totalTests} ${failedTests === 0 ? "✓" : "✗"}`)
  }
}
