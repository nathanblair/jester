# jester
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=test)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=coverage)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=publish)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=document)](https://github.com/sonicoriginalsoftware/jester/actions)

© 2020 Nathan Blair

An async javascript test runner - using V8 code coverage and ES6 Modules

* `jester` walks your `tests` folder (change using the `-d` flag) asynchronously to round up all your test modules then executes them all asynchronously
* `performance` from `perf_hooks` to time the execution of all test executions
* [Node Inspector](https://nodejs.org/api/inspector.html#inspector_class_inspector_session) and [Session Profiler](https://chromedevtools.github.io/devtools-protocol/v8/Profiler) to generate code coverage in json format

# Dependencies
- None!

# Usage/Boilerplate
Jester has minimal boilerplate for creating test modules/suites
- Create a directory for your tests
- Create a test file/module
- Optionally, `export const id` and set it to an identifier for your test module
    - e.g. `export const id = 'Jester Test'`
    - If none is provided, `jester` will refer to this module by its file name
- Implement `export const assertions = {}`
    - Object signature looks like:
        - key: String - The message your assertion will be given (shown with the logger)
        - value: `{function: /* function that performs an assertion */ () => {assert.deepStrictEqual(2, 2)}, skip: false}`
    - Add more key/value pairs for each assertion you'd like to make
    - The `skip` parameter is used to skip assertions (not executed but still counted in module summary - result will be set to `true`)

```javascript
// test/jestertest.js
import {strict as assert} from 'assert'

export const id = 'Jester Test' // Optional - will default to file name if not present

export const assertions = {
  '2 should be equal to 2': {function: () => assert.deepStrictEqual(2, 2), skip: false},
  '2 should not be equal to 4': {function: () => assert.notDeepStrictEqual(2, 4), skip: false}
}
```

# Running
- `npx -n "--harmony [experimental flags]" jester`
  - On node < 13.2.0 (maybe <13.0.0?), need to use the `--experimental-modules` flag
  - All node versions (up to 13.9 so far) need to run with the `--experimental-json-modules` flag
  - The "--harmony" flag is necessary until node supports ECMA null chaining operator (`?.`) (v14.0.0?)

# Help/Configuration
- Pass the `-h` flag to `jester` for help on configuring

# [Documentation](https://sonicoriginalsoftware.github.io/jester/)
