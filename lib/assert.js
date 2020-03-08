import { TestLogger } from './logger.js'
import { Status } from './status.js'

/**
 * Provides an assertion for a test case
 *
 * @param {function():void} assertFunction the assert function to call
 * @param {String} shouldMsg a message to pass to the test logger when it writes the test result
 * @param {Status} status forwarded parameter from the `Run` method
 * @param {TestLogger} [testLogger] forwarded parameter from the `Run` method
 *
 * @example
 * const dummy = 2
 * Assert(() => assert.strictEqual(dummy, 2), '2 should equal 2', status, logger)
 *
 * @returns {Boolean} a boolean indicating whether the assertion was correct
 *
 * @module
 */
export function Assert(assertFunction, shouldMsg, status, testLogger = undefined) {
  status.totalAssertions++
  let result = false
  try {
    assertFunction()
    result = true
  } catch (AssertionError) {
    status.failedAssertions++
  }
  testLogger?.WriteTestResult(result, shouldMsg)
  return result
}
