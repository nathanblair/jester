/**
 * Provides an assertion for a test case
 *
 * @param {function():Promise<void>} assertFunction the assert function to call
 * @param {String} assertMessage a message to pass to the test logger when it writes the assertion result
 * @param {import('./status.js').Status} status forwarded parameter from the `Run` method
 * @param {Boolean} skip whether to skip this assertion (doesn't run or count against total or failed assertions)
 *
 * @example
 * ```javascript
 * const dummy = 2
 * Assert(
 *   () => assert.strictEqual(dummy, 2),
 *   '2 should equal 2',
 *   status
 * )
 * ```
 *
 * @returns {Promise<Boolean>} a boolean indicating whether the assertion was correct
 */
export async function Assert(
  assertFunction,
  assertMessage,
  status,
  skip = false
) {
  /** @type {Boolean} */
  let result = skip || true

  if (!skip) {
    try {
      await assertFunction()
    } catch (AssertionError) {
      result = false
    }
  }
  status.assertions.push({
    message: assertMessage,
    result: result,
    skipped: skip,
  })
  return result
}
