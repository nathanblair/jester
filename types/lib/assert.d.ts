/**
 * Provides an assertion for a test case
 *
 * @param {function():Promise<void>} assertFunction the assert function to call
 * @param {Boolean} skip whether to skip this assertion (doesn't run or count against total or failed assertions)
 *
 * @returns {Promise<Boolean>} a boolean indicating whether the assertion was correct
 */
export function Assert(assertFunction: () => Promise<void>, skip: boolean): Promise<boolean>;
