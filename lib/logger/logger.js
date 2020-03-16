/**
 * An interface for logging
 */
export class Logger {
  static Channels = {
    ERROR: 1,
    WARN: 2,
    INFO: 4,
    DEBUG: 8,
  }

  enabledChannels =
    Logger.Channels.ERROR | Logger.Channels.WARN | Logger.Channels.INFO

  /**
   * @param {String} _message the string message to log
   * @param {Number} _channels bitmask of the channels to send the message
   */
  Log(_message = '', _channels) {}

  /**
   * @param {String} message
   */
  Error(message = '') {
    this.Log(message, Logger.Channels.ERROR)
  }

  /**
   * @param {String} message
   */
  Warn(message = '') {
    this.Log(message, Logger.Channels.WARN)
  }

  /**
   * @param {String} message
   */
  Info(message = '') {
    this.Log(message, Logger.Channels.INFO)
  }

  /**
   * @param {String} message
   */
  Debug(message = '') {
    this.Log(message, Logger.Channels.DEBUG)
  }
}
