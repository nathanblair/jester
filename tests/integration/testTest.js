import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'
export const name = 'JesterTest'

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
}
