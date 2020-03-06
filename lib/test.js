import {TestLogger} from './logger.js'
import {Status} from './status.js'

/**
  * The base test class to inherit from
  *
  * @example
  * // Execute below with `npx -n "[experimental-flags]" jester`
  *
  * // test/jestertest.js
  * import {strict as assert} from 'assert'
  * import {Test, Assert} from '@sonicoriginalsoftware/jester'
  *
  * export class JesterTest extends Test {
  *   static testClassFriendlyName = 'Jester Test'
  *
  *   static async Run(status, logger) {
  *     Assert(() => assert.strictEqual(2, 2), '2 should equal 2', status, logger)
  *
  *     Assert(() => assert.throws(() => new Test()), 'Should not be able to instantiate a new Test instance', status, logger)
  *   }
  * }
  *
  * @abstract
  */
export class Test {
  /** A friendly name to identify this test module */
  static testClassFriendlyName = 'Test'

  constructor() {throw new Error('NotImplementedException')}

  /**
    * Define your test module's assertions by overriding this method
    *
    * @param {Status} _status injected with the current module's failed and total assertions
    * no need for your test to manage this at all
    * just pass it along to your `Test.Assert` statements
    * @param {TestLogger} [_testLogger] the test logger that will write the assertion status
    * @abstract
    */
  static async Run(_status, _testLogger = undefined) {}
}

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
export function Assert(assertFunction, shouldMsg, status, testLogger = undefined) {
  status.totalAssertions++
  let result = false
  try {assertFunction(); result = true} catch (AssertionError) { status.failedAssertions++ }
  if (testLogger) testLogger.WriteTestResult(result, shouldMsg);
  return result
}
