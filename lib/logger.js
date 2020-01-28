export class TestLogger {
  static Reset = "\x1b[0m"
  static Bright = "\x1b[1m"
  static Dim = "\x1b[2m"
  static Underscore = "\x1b[4m"
  static Blink = "\x1b[5m"
  static Reverse = "\x1b[7m"
  static Hidden = "\x1b[8m"

  static FgBlack = "\x1b[30m"
  static FgRed = "\x1b[31m"
  static FgGreen = "\x1b[32m"
  static FgYellow = "\x1b[33m"
  static FgBlue = "\x1b[34m"
  static FgMagenta = "\x1b[35m"
  static FgCyan = "\x1b[36m"
  static FgWhite = "\x1b[37m"

  static BgBlack = "\x1b[40m"
  static BgRed = "\x1b[41m"
  static BgGreen = "\x1b[42m"
  static BgYellow = "\x1b[43m"
  static BgBlue = "\x1b[44m"
  static BgMagenta = "\x1b[45m"
  static BgCyan = "\x1b[46m"
  static BgWhite = "\x1b[47m"

  /**
   * @param {"text" | "md"} format - "text" or "md" depending on desired output format
   */
  constructor(format) {
    this.format = format
  }

  /**
   * @param {Boolean} status the number of failed assertions
   * @param {String} shouldBeMsg statement of what it means if the tests `passes` or `fails`
   */
  WriteTestStatus(status, shouldBeMsg) {
    switch (this.format) {
      case "text":
        console.warn(` - ${shouldBeMsg} : ${status ? `${TestLogger.FgGreen}PASS` : `${TestLogger.FgRed}FAIL`}${TestLogger.Reset}`)
        break
      case "md":
        console.warn(` - [${status ? "X" : " "}] ${shouldBeMsg}`)
        break
    }
  }

  /**
   * @param {String} testClassName the name of the test class
   */
  WriteTestHead(testClassName) {
    switch (this.format) {
      case "text":
        console.warn(testClassName)
        break
      case "md":
        console.warn(
`
<details>
<summary>${testClassName}</summary>
`
        )
        break
    }
  }

  /**
   * @param {String} testName
   * @param {Number} failedAssertions
   * @param {Number} totalAssertions
   */
  WriteTestFoot(testName, failedAssertions, totalAssertions) {
    switch (this.format) {
      case "text":
        const color = failedAssertions === 0 ? TestLogger.FgGreen : TestLogger.FgRed
        console.warn(` // ${testName} Summary (passed/total): ${color}${(totalAssertions - failedAssertions)}/${totalAssertions}${TestLogger.Reset}`)
        break
      case "md":
        console.warn(`</details>`)
        break
    }
  }

  /**
   * @param {Number} testingTime
   * @param {Number} failedTests
   * @param {number} totalTests
   */
  WriteTestSummary(testingTime, failedTests, totalTests) {
    console.log('')
    console.log(`Testing took ${testingTime.toFixed(1)} ms`)
    console.log('')
    switch (this.format) {
      case "text":
        const color = failedTests === 0 ? TestLogger.FgGreen : TestLogger.FgRed
        console.log(`Testing summary (passed/total): ${color}${(totalTests - failedTests)}/${totalTests}${TestLogger.Reset}`)
        break
      case "md":
        console.log(`Testing summary (passed/total): ${(totalTests - failedTests)}/${totalTests} ${failedTests === 0 ? "✓" : "✗"}`)
        break
    }
  }
}
