/**
 * Provides an assertion for a test case
 *
 * @param {function():Promise<void>} assertFunction the assert function to call
 * @param {Boolean} skip whether to skip this assertion (doesn't run or count against total or failed assertions)
 *
 * @returns {Promise<Boolean>} a boolean indicating whether the assertion was correct
 */
export async function Assert(assertFunction, skip) {
  let result = skip || true

  if (!skip) {
    try {
      await assertFunction()
    } catch (AssertionError) {
      result = false
    }
  }
  return result
}
