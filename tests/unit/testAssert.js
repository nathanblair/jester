import { strict as assert, AssertionError } from 'assert'

export const id = 'Assert Test'

const dummy = 2
let asyncValue = null
let setUpVar = 0
let tearDownVar = 0

export function setUp() {
  setUpVar = 8
}

export function tearDown() {
  tearDownVar = 10
}

export const assertions = {
  'Should be able to pass correct assertions': {
    function: () => assert.deepStrictEqual(2, 2),
  },
  'Should be able to pass correct assertions asynchronously': {
    function: async () => {
      asyncValue = await new Promise(resolve => resolve(2))
      assert.deepStrictEqual(asyncValue, 2)
    },
  },
  'Should be able to fail incorrect assertions': {
    function: async () =>
      assert.throws(() => assert.deepStrictEqual(2, 4), AssertionError),
  },
  'Should be able to fail incorrect assertions asynchronously': {
    function: async () => {
      asyncValue = await new Promise(resolve => resolve(2))
      assert.throws(() => assert.deepStrictEqual(asyncValue, 4), AssertionError)
    },
  },
  'Should be able to skip assertions': {
    function: () => assert.deepStrictEqual(2, 2),
    skip: true,
  },
  'Should be able to assert on module variables': {
    function: () => assert.deepStrictEqual(dummy, 2),
  },
  'Should be able to setUp': {
    function: () => assert.deepStrictEqual(setUpVar, 8)
  },
  'Should be able to tearDown': {
    function: () => assert.deepStrictEqual(tearDownVar, 10),
  },
}
