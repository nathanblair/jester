import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'

export const id = 'Assert Test'

/**
 * @param {import('../../lib/status').Status} status
 * @param {import('../../lib/logger/logger.js').Logger} logger
 */
export async function Run(status, logger) {
  Assert(
    () => assert.doesNotThrow(() =>
      Assert(
        () => null,
        'Dummy message isn\'t printed because there\'s no logger',
        {failedAssertions: 0, totalAssertions: 0}
      ),
    ),
    'Should be able to assert without a logger',
    status,
    logger
  )

  Assert(
    () => assert.doesNotThrow(() =>
      Assert(
        () => null,
        'Dummy message isn\'t printed because there\'s no logger',
        {failedAssertions: 0, totalAssertions: 0},
        undefined
      ),
    ),
    'Should be able to assert with an undefined logger',
    status,
    logger
  )

  Assert(
    () => assert.strictEqual(
      Assert(
        () => assert.strictEqual(2, 2),
        '2 should be equal to 2',
        {failedAssertions: 0, totalAssertions: 0},
        undefined
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
        {failedAssertions: 0, totalAssertions: 0},
        undefined
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
