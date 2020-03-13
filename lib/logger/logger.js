import { performance } from 'perf_hooks'

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
   * @param {String} message the string message to log
   * @param {Number} channels bitmask of the channels to send the message
   */
  Log(message = '', channels) {
    if (!(channels & this.enabledChannels)) {
      process.stdout.write('') // This is a BS add but JS doesn't perform correctly if its not included
      return
    }

    const inErrorChannel = channels & Logger.Channels.ERROR
    const inWarnChannel = channels & Logger.Channels.WARN
    const inInfoChannel = channels & Logger.Channels.INFO
    const inDebugChannel = channels & Logger.Channels.DEBUG

    /** @type {String[]} */
    const channelNames = []
    inErrorChannel && channelNames.push('ERROR')
    inWarnChannel && channelNames.push('WARN')
    inInfoChannel && channelNames.push('INFO')
    inDebugChannel && channelNames.push('DEBUG')

    const stream = inErrorChannel ? process.stderr : process.stdout
    const prefix =
      inErrorChannel | inWarnChannel | inInfoChannel | inDebugChannel
        ? `${new Date().toLocaleTimeString()} [${channelNames}] `
        : ''
    const formattedMessage = `${prefix}${message}\n`
    stream.write(formattedMessage)
  }

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
