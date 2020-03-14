/**
 * A test logger interface
 *
 * @interface
 */
export class TestLogger extends Logger {
    static Channels: {
        OVERALL: number;
        MODULE: number;
        ASSERTION: number;
        ERROR: number;
        WARN: number;
        INFO: number;
        DEBUG: number;
    };
    /**
     * Write the start of the testing results
     *
     * @param {String} _id the identifier of the test module
     *
     * @abstract
     */
    WriteModuleHead(_id: string): void;
    /**
     * @param {Boolean} _result the number of failed assertions
     * @param {String} _shouldMsg statement of what it means if the tests `passes` or `fails`
     * @param {Boolean} _skipped whether the assertion was skipped
     *
     * @abstract
     */
    WriteAssertionResult(_result: boolean, _shouldMsg: string, _skipped: boolean): void;
    /**
     * Write the end of the testing results
     *
     * @param {String} _id the identifier of the test module
     * @param {Number} _totalAssertions
     * @param {Number} _failedAssertions
     *
     * @abstract
     */
    WriteModuleSummary(_id: string, _totalAssertions: number, _failedAssertions: number): void;
    /**
     * Show test time and test overall results
     *
     * @param {Number} _testingTime
     * @param {Number} _failedTests
     * @param {number} _totalTests
     *
     * @abstract
     */
    WriteTestingSummary(_testingTime: number, _failedTests: number, _totalTests: number): void;
}
import { Logger } from "./logger.js";
