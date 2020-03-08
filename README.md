# jester
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=test)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=coverage)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=publish)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=document)](https://github.com/sonicoriginalsoftware/jester/actions)

© 2020 Nathan Blair

An async javascript test runner - using V8 code coverage and ES6 Modules

* `jester` walks your `tests` folder (change using the `-d` flag) asynchronously to round up all your Test modules then executes them all asynchronously
* It uses `performance` from `perf_hooks` to time the execution of all test executions
* Logging-level configuration will be coming in a future release
* It also uses [Node Inspector](https://nodejs.org/api/inspector.html#inspector_class_inspector_session) and [Session Profiler](https://chromedevtools.github.io/devtools-protocol/v8/Profiler) to generate code coverage in json format (configurable in a future release)

# Dependencies
- None!

# Usage/Boilerplate
Jester has minimal boilerplate for creating test modules/suites
- Create a directory for your tests
- Create a test file/module
- Implement `export async function Run`
    - It will receive two parameters:
        - status: don't worry about this, just forward it to the `Assert` method
        - logger: the logger you've configured; again, you don't need to worry about this, just forward it to the `Assert` method
    - In the `Run` function, make as many `Assert` calls as needed to validate your code for this testing module
- Optionally, `export const id` and set it to an identifier for your test module
    - If none is provided, `jester` will refer to this module by its file name

```javascript
// test/jestertest.js
import {strict as assert} from 'assert'
import {Assert} from '@sonicoriginalsoftware/jester'

export const id = 'Jester Test' // Optional - will default to file name if not present

export async function Run(status, logger) {
  Assert(() => assert.strictEqual(2, 2), '2 should equal 2', status, logger)

  Assert(() => assert.throws(() => new Jester()), 'Should not be able to instantiate a new Jester instance', status, logger)
}
```

# Running
- `npx -n "--harmony [experimental flags]" jester`
  - On node < 13.2.0 (maybe <13.0.0?), need to use the `--experimental-modules` flag
  - All node versions (up to 13.8 so far) need to run with the `--experimental-json-modules` flag
  - The "--harmony" flag is necessary until node supports ECMA null chaining operator (`?.`) (v14.0.0?)

# Help/Configuration
- Pass the `-h` flag to `jester` for help on configuring

# [Documentation](https://sonicoriginalsoftware.github.io/jester/)

