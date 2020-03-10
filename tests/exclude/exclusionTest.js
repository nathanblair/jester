import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'

export const id = 'Exclusion Test'

/**
 * @param {import('../../lib/status').Status} status
 * @param {import('../../lib/logger/testLogger.js').TestLogger} logger
 */
export async function Run(status, logger) {
  Assert(
    () => assert.fail(),
    "Should not be executing tests in an excluded directory",
    status,
    logger
  )
}
