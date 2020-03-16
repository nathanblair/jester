import { strict as assert } from 'assert'
import { Assert } from '../../lib/assert.js'

export const id = 'Assert Test'

export const assertions = {
  'Should be able to pass correct assertions': {
    function: async () => assert.deepStrictEqual(2, 2),
    skip: false,
  },
  'Should be able to fail incorrect assertions': {
    function: async () => assert.deepStrictEqual(2, 4),
    skip: false,
  },
  'Should be able to skip assertions': {
    function: async () => assert.deepStrictEqual(2, 2),
    skip: true,
  },
}

/**
 * @param {import('../../lib/status').Status} status
 */
export async function Run(status) {
  await Assert(
    async () =>
      assert.deepStrictEqual(
        await Assert(
          () => assert.deepStrictEqual(2, 2),
          '2 should be equal to 2',
          {}
        ),
        true
      ),
    'Should be able to pass correct assertions',
    status
  )

  await Assert(
    async () =>
      assert.strictEqual(
        await Assert(
          () => assert.strictEqual(4, 2),
          '4 should be equal to 2',
          {}
        ),
        false
      ),
    'Should be able to fail incorrect assertions',
    status
  )

  await Assert(
    () => assert.strictEqual(dummy, 2),
    'Should be able to skip an assertion',
    status,
    true
  )

  const dummy = 2
  await Assert(
    () => assert.strictEqual(dummy, 2),
    'Should be able to assert on module variables',
    status
  )
}
