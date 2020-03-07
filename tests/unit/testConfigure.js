import {strict as assert} from 'assert'
import {Assert} from '../../lib/assert.js'
import {Configure} from '../../bin/jester.js'

export const name = 'Configure Test'

/**
 * @param {import('../../lib/status').Status} status
 * @param {import('../../lib/logger').TestLogger} logger
 */
export async function Run(status, logger) {
  /** @type {import('../../bin/jester').Config} */
  const config = { coverageDir: "coverage", format: "text", dryRun: false, testDir: "tests" }
  // Assert(
  //   () => assert.doesNotThrow(() => Configure(config) ),
  //   'Should be able to configure',
  //   status,
  //   logger
  // )
}
