/**
 * An interface for logging
 */
export class Logger {
    static Channels: {
        ERROR: number;
        WARN: number;
        INFO: number;
        DEBUG: number;
    };
    enabledChannels: number;
    /**
     * @param {String} _message the string message to log
     * @param {Number} _channels bitmask of the channels to send the message
     */
    Log(_message: string | undefined, _channels: number): void;
    /**
     * @param {String} message
     */
    Error(message?: string): void;
    /**
     * @param {String} message
     */
    Warn(message?: string): void;
    /**
     * @param {String} message
     */
    Info(message?: string): void;
    /**
     * @param {String} message
     */
    Debug(message?: string): void;
}
