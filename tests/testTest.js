import {strict as assert} from 'assert'
import {Test} from '../lib/test.js'
import {Assert} from '../lib/assert.js'
import {TestLogger} from '../lib/logger.js'
import {Status} from '../lib/status.js'

export class TestTest extends Test {
  static testClassFriendlyName = 'JesterTest'

  /** @param {Status} status @param {TestLogger} logger */
  static async Run(status, logger) {
    Assert(
      () => assert.throws(() => new Test()),
      'Should not be able to instantiate the base Test class',
      status,
      logger
    )

    Assert(
      () => assert.strictEqual(
        Assert(
          () => assert.strictEqual(2, 2),
          '2 should be equal to 2',
          {failedAssertions: 0, totalAssertions: 0}
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
          {failedAssertions: 0, totalAssertions: 0}
        ),
        false),
      'Should be able to fail incorrect assertions',
      status,
      logger
    )
  }
}
