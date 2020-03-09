import { Logger } from './logger.js'

/**
 * A test logger interface
 *
 * @abstract
 */
export class TestLogger extends Logger {
  static Channels = {
    ...Logger.Channels,
    OVERALL: 16,
    MODULE: 32,
    ASSERTION: 64,
  }

  enabledChannels =
    TestLogger.Channels.ERROR |
    TestLogger.Channels.WARN |
    TestLogger.Channels.INFO |
    TestLogger.Channels.OVERALL |
    TestLogger.Channels.MODULE |
    TestLogger.Channels.ASSERTION

  /**
   * Write the start of the testing results
   *
   * @param {String} _id the identifier of the test module
   *
   * @abstract
   */
  WriteModuleHead(_id) {}

  /**
   * @param {Boolean} _result the number of failed assertions
   * @param {String} _shouldMsg statement of what it means if the tests `passes` or `fails`
   *
   * @abstract
   */
  WriteAssertionResult(_result, _shouldMsg) {}

  /**
   * Write the end of the testing results
   *
   * @param {String} _id the identifier of the test module
   * @param {Number} _totalAssertions
   * @param {Number} _failedAssertions
   *
   * @abstract
   */
  WriteModuleSummary(_id, _totalAssertions, _failedAssertions) {}

  /**
   * Show test time and test overall results
   *
   * @param {Number} _testingTime
   * @param {Number} _failedTests
   * @param {number} _totalTests
   *
   * @abstract
   */
  WriteTestingSummary(_testingTime, _failedTests, _totalTests) {}
}
