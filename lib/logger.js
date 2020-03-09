/**
 * An interface for how to log tests
 *
 * @exports Level
 * @abstract
 */
export class TestLogger {
  static overallSummaryLevel = 0b001
  static moduleSummaryLevel = 0b010
  static assertionResultLevel = 0b100

  static errorChannel = 0b0001
  static warnChannel = 0b0010
  static infoChannel = 0b0100
  static debugChannel = 0b1000

  /**
   * @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} Level Bitmask flag of log printing
   *
   * 1 = 'Overall Summary'
   * 2 = 'Module Summary'
   * 4 = 'Assertion Result'
   * 8 = 'General'
   */

  /**
   * @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} Channel Bitmask channel to write to
   *
   * 1 = 'ERROR'
   * 2 = 'WARN'
   * 4 = 'INFO'
   * 8 = 'DEBUG'
   */

  /**
   * @param {Level} enabledLevel
   * @param {Channel} enabledChannel
   *
   * @abstract
   */
  constructor(enabledLevel, enabledChannel) {
    if (new.target === TestLogger)
      throw new TypeError("Can't instantiate an abstract class")
    this.enabledLevel = enabledLevel
    this.enabledChannel = enabledChannel
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
  Info(message = '') { this.Log(message, 0b1111, 0b0100) }

  /**
   * @param {String} message
   */
  Warn(message = '') { this.Log(message, 0b1111, 0b0010) }

  /**
   * @param {String} message
   */
  Error(message = '') { this.Log(message, 0b1111, 0b0001) }

  /**
   * @param {String} message
   */
  Debug(message = '') { this.Log(message, 0b1111, 0b1000) }

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
