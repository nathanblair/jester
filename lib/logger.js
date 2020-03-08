import { Status } from './status.js'

/**
 * An interface for how to log tests
 *
 * @abstract
 */
export class TestLogger {
  /**
   * Write the start of the testing results
   *
   * @param {String} _id the identifier of the test module
   *
   * @abstract
   */
  WriteTestHead(_id) {}

  /**
   * @param {Boolean} _result the number of failed assertions
   * @param {String} _shouldMsg statement of what it means if the tests `passes` or `fails`
   *
   * @abstract
   */
  WriteTestResult(_result, _shouldMsg) {}

  /**
   * Write the end of the testing results
   *
   * @param {String} _testClassFriendlyName
   * @param {Status} _status
   *
   * @abstract
   */
  WriteTestFoot(_testClassFriendlyName, _status) {}

  /**
   * Show test time and test overall results
   *
   * @param {Number} _testingTime
   * @param {Number} _failedTests
   * @param {number} _totalTests
   *
   * @abstract
   */
  WriteTestSummary(_testingTime, _failedTests, _totalTests) {}
}
