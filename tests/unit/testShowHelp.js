import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'
import {showHelp} from '../../bin/jester.js'

export const name = 'Show Help Test'

/**
 * @param {import('../../lib/status').Status} status
 * @param {import('../../lib/logger').TestLogger} logger
 */
export async function Run(status, logger) {
  // Assert(
  //   () => assert.doesNotThrow(() => showHelp() ),
  //   'Should be able to show help',
  //   status,
  //   logger
  // )
}
