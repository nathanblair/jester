import { TestLogger } from './logger.js'
import { Status } from './status.js'

/**
 * Provides an assertion for a test case
 *
 * @param {function():void} assertFunction the assert function to call
 * @param {String} shouldMsg a message to pass to the test logger when it writes the test result
 * @param {Status} status forwarded parameter from the `Run` method
 * @param {TestLogger} [testLogger] the logger to use to write the assertion status
 *
 * @returns {Boolean} a boolean indicating whether the assertion was correct
 *
 * @protected
 */
export function Assert(
  assertFunction,
  shouldMsg,
  status,
  testLogger = undefined
) {
  status.totalAssertions++
  let result = false
  try {
    assertFunction()
    result = true
  } catch (AssertionError) {
    status.failedAssertions++
  }
  if (testLogger) testLogger.WriteTestResult(result, shouldMsg)
  return result
}
