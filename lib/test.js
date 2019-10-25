import { TestLogger } from "./logger.js";

/**
 * @exports Test
 * @abstract
 */
export class Test {
  static testClassName = "Test"

  /**
   * Provides the assertions
   *
   * @param {TestLogger} _testLogger - the test logger that will write the
   * assertion status
   * @returns {Promise<[Number, Number]>} [failedAssertions, totalAssertions]
   * @async
   * @virtual
   */
  static async Run(_testLogger) { return [0, 0] }

  /**
   * @param {() => void} assertFunction - the assert function to call
   * @param {String} shouldBeMsg - a message to pass to logStatusCallback
   * @param {TestLogger} [testLogger] - the logger to use to write the assertion status
   * @returns {Boolean}
   * @protected
   */
  static Assert(assertFunction, shouldBeMsg, testLogger = null) {
    let status = false
    try { assertFunction(); status = true } catch (AssertionError) { }
    if (testLogger) testLogger.WriteTestStatus(status, shouldBeMsg);
    return status
  }
}
