import { strict as assert, AssertionError } from 'assert'
import { Assert } from '../../lib/assert.js'

export const id = 'Assert Test'

const dummy = 2

export const assertions = {
  'Should be able to pass correct assertions': {
    function: () => assert.deepStrictEqual(2, 2),
  },
  'Should be able to pass correct assertions asynchronously': {
    function: async () => {
      assert.deepStrictEqual(await Assert(() => assert.deepStrictEqual(2, 2), false), true)
    },
  },
  'Should be able to fail incorrect assertions': {
    function: async () => {
      assert.throws(() => assert.deepStrictEqual(2, 4), AssertionError)
    },
  },
  'Should be able to fail incorrect assertions asynchronously': {
    function: async () => {
      assert.deepStrictEqual(await Assert(() => assert.deepStrictEqual(2, 4), false), false)
    },
  },
  'Should be able to skip assertions': {
    function: () => assert.deepStrictEqual(2, 2),
    skip: true,
  },
  'Should be able to assert on module variables': {
    function: () => assert.strictEqual(dummy, 2),
  }
}
