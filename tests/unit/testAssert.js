import { strict as assert, AssertionError } from 'assert'
import { Assert } from '../../lib/assert.js'

export const id = 'Assert Test'

const dummy = 2
let setUpVar = 4
let setUpAsyncVar = 8
let tearDownVar = 0
let tearDownAsyncVar = 's'

export async function setUp() {
  setUpVar = 6
  setUpAsyncVar = 'y'
}

export async function tearDown() {
  tearDownVar = 10
  tearDownAsyncVar = 'off'
}

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
  },
  'Should be able to setUp': {
    function: () => assert.deepStrictEqual(setUpVar, 6)
  },
  'Should be able to setUp asynchronously': {
    function: async () => assert.deepStrictEqual(setUpAsyncVar, 'y')
  },
  'Should be able to tearDown': {
    function: () => assert.deepStrictEqual(tearDownVar, 10)
  },
  'Should be able to tearDown asynchronously': {
    function: async () => assert.deepStrictEqual(tearDownAsyncVar, 'off')
  },
}
