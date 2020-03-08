import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'

export const id = 'Assert Test'

/**
 * @param {import('../../lib/status').Status} status
 * @param {import('../../lib/logger').TestLogger} logger
 */
export async function Run(status, logger) {
  Assert(
    () => assert.strictEqual(
      Assert(
        () => assert.strictEqual(2, 2),
        '2 should be equal to 2',
        {failedAssertions: 0, totalAssertions: 0}
      ),
      true),
    'Should be able to pass correct assertions',
    status,
    logger
  )

  Assert(
    () => assert.strictEqual(
      Assert(
        () => assert.strictEqual(4, 2),
        '4 should be equal to 2',
        {failedAssertions: 0, totalAssertions: 0}
      ),
      false),
    'Should be able to fail incorrect assertions',
    status,
    logger
  )

  const dummy = 2
  Assert(
    () => assert.strictEqual(dummy, 2),
    'Should be able to assert on module variables',
    status,
    logger
  )
}
