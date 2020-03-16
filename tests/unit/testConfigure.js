import { strict as assert } from 'assert'
import { Configure } from '../../lib/configure.js'

export const id = 'Configure Test'

export const assertions = {
  'Should be create a Configure instance': {
    function: () => assert.doesNotThrow(() => new Configure()),
  }
}
