# jester
An async JS test runner - using V8 code coverage and ES6 Modules

# Dependencies
- None!

# Requires
- If running from Node.js, need to use the `--experimental-modules` flag
  - Hopefully with the LTS release of the next version coming up in the next few days (10/20ish), this won't be needed anymore!

# Using
- Once ES6 modules are supported without the `--experimental-modules` flag, you can just run `npx jester` (or `jester` if installed globally)
- Otherwise, you'll have to issue `node --experimental-modules node_modules/jester/bin/jester.js`
- `jester` walks your `tests` folder (whatever folder you store your tests in) asynchronously to round up all your Test classes (see [How-to](#How-to), below), then executes them all asynchronously
- It uses `performance` from `perf_hooks` to time the execution of all test executions

# How-to
- Create a test script file in a `tests` (name not strict, but advised) folder (or subfolders) in your project hierarchy
- In that script file, make a class that extends Test (also `import { Test } from "@sonicoriginalsoftware/jester"`
- Override the static async method `Run` (it gets a `TestLogger` instance that is configured with your preference for output format)
- The following isn't strictly required, but advised
  - Initialize `failedAssertions` and `totalAssertions` to 0
  - Increment `failedAssertions` depending on the result of the `Test.Assert` method call
  - Increment `totalAssertions` after each `Test.Assert` method call
  - Return `[failedAssertions, totalAssertions]`
  
  # `Test.Assert`
  - arg1 is a function callback that will supply the assertion statement (`assert.strictEqual(1, 1)`)
  - arg2 is a "should-be" message that will be printed that gives information on what the passing or failing of the test means ("Able to make `1 === 1`")
  - arg3 is the testLogger that should print arg2 (usually the one received in the `Run` function arg
  - Returns whether the `assert` function callback was successful or not (Boolean)
  
  ** For more information, see the tests used to test jester! **

