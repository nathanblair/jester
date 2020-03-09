/**
 * An interface for logging
 *
 * @abstract
 */
export class Logger {
  static Levels = {
    OVERALL: 1,
    MODULE: 2,
    ASSERTION: 4,
    GENERAL: 8,
    1: 'OVERALL',
    2: 'MODULE',
    4: 'ASSERTION',
    8: 'GENERAL',
  }

  static Channels = {
    ERROR: 1,
    WARN: 2,
    INFO: 4,
    DEBUG: 8,
    1: 'ERROR',
    2: 'WARN',
    4: 'INFO',
    8: 'DEBUG',
  }

  /** @typedef {1 | 2 | 4 | 8} Level flag of log printing */
  /** @typedef {1 | 2 | 4 | 8} Channel channel to write to */

  /** @type {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} */
  enabledLevel = 0b1111
  /** @type {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} */
  enabledChannel = 0b1111

  /**
   * @abstract
   */
  constructor() {
    if (new.target === Logger)
      throw new TypeError("Can't instantiate an abstract class")
  }

  /**
   * @param {String} _message the string message to log
   * @param {Level} _level
   * @param {Channel} _channel
   */
  Log(_message = '', _level, _channel) {}

  /**
   * @param {String} message
   */
  Error(message = '') {
    this.Log(message, Logger.Levels.GENERAL, Logger.Channels.ERROR)
  }

  /**
   * @param {String} message
   */
  Warn(message = '') {
    this.Log(message, Logger.Levels.GENERAL, Logger.Channels.WARN)
  }

  /**
   * @param {String} message
   */
  Info(message = '') {
    this.Log(message, Logger.Levels.GENERAL, Logger.Channels.INFO)
  }

  /**
   * @param {String} message
   */
  Debug(message = '') {
    this.Log(message, Logger.Levels.GENERAL, Logger.Channels.DEBUG)
  }

  /**
   * Write the start of the testing results
   *
   * @param {String} _id the identifier of the test module
   *
   * @abstract
   */
  WriteTestHead(_id) {}

  /**
   * @param {Boolean} _result the number of failed assertions
   * @param {String} _shouldMsg statement of what it means if the tests `passes` or `fails`
   *
   * @abstract
   */
  WriteAssertionResult(_result, _shouldMsg) {}

  /**
   * Write the end of the testing results
   *
   * @param {String} _id the identifier of the test module
   * @param {import('./status').Status} _status
   *
   * @abstract
   */
  WriteModuleSummary(_id, _status) {}

  /**
   * Show test time and test overall results
   *
   * @param {Number} _testingTime
   * @param {Number} _failedTests
   * @param {number} _totalTests
   *
   * @abstract
   */
  WriteTestingSummary(_testingTime, _failedTests, _totalTests) {}
}
