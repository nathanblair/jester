import { strict as assert } from 'assert'

export const id = 'Exclusion Test'

export const assertions = {
  'Should not be executing tests in an excluded directory': {
    function: () => assert.fail(),
  }
}
