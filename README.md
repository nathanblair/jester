# jester

[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=test)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=coverage)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=publish)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=document)](https://github.com/sonicoriginalsoftware/jester/actions)

© 2020 Nathan Blair

An async javascript test runner - using V8 code coverage, profiling, and ES6 Modules support

It should be noted that the API is mostly solidified at this point. However, don't count on the API being fully consistent until a v1.0.0 release. That being said, there should be no reason for huge sweeping changes to occur from here on out, short of functionality-breaking bugs.

- `jester` walks your `tests` folder (change using the `-d` flag) asynchronously to round up all your test modules then executes them all asynchronously

- `performance` from `perf_hooks` to time the execution of all test executions

- [Node Inspector](https://nodejs.org/api/inspector.html#inspector_class_inspector_session) and [Session Profiler](https://chromedevtools.github.io/devtools-protocol/v8/Profiler) to generate code coverage in json format

# Dependencies

- None!

Jester doesn't believe in dependencies. Not because 'dependencies are evil' or from 'Not invented here' syndrome. But because there is a time and place for dependencies to exist. Like, native GUI libraries, or unit testing frameworks. There is no need to use 3rd party dependencies to get color-output for terminals. We just bake that stuff right in. Its like...20 lines of code or something.

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
    - value: `{function: /* function that performs an assertion */ () => {}, skip: Boolean}`
  - The `skip` parameter (defaults to `false`) is used to skip assertions (not executed but still counted in module summary - result will be set to `true`)
  - Add more key/value pairs for each assertion you'd like to make
- Optionally, implement `export function setUp() {}` and/or `export function tearDown() {}` to execute code before and after each assertion

```javascript
// test/jestertest.js
import { strict as assert } from 'assert'

export const id = 'Jester Test' // Optional - will default to file name if not present

export function setUp() {
  console.log('I run before each assertion')
}

export function tearDown() {
  console.log('I run after each assertion')
}

export const assertions = {
  '2 should be equal to 2': {
    function: () => assert.deepStrictEqual(2, 2),
  },
  '2 should not be equal to 4': {
    function: () => assert.notDeepStrictEqual(2, 4),
    skip: false,
  },
  'This test should be skipped': {
    function: () => assert.throws(() => {}),
    skip: true,
  },
}
```

# Running

- `npx -n "--harmony [experimental flags]" jester`
  - On node < 13.2.0 (maybe <13.0.0?), need to use the `--experimental-modules` flag
  - All node versions (up to 13.9 so far) need to run with the `--experimental-json-modules` flag
  - The "--harmony" flag is necessary until node supports ECMA null chaining operator (`?.`) (v14.0.0?)

# Help/Configuration

- Pass the `-h` flag to `jester` for help on configuring

# FAQ

> **Why can't `setUp` and `tearDown` methods be marked as async?**

If you're using something like the following:

```javascript
// tests/jester_test.js

let semaphore = [4]

export async function setUp() {
  await new Promise(resolve => resolve(semaphore.splice(0))
}

export const assertions = {
  'Should be able to modify a global': {
    function: () => {
      semaphore.push(4)
      assert.deepStrictEqual(semaphore, [4])
    },
  },
  'Should be able to set up': {
    function: () => {
      assert.deepStrictEqual(semaphore, [])
    },
  },
}
```

And noticing failures on 'Should be able to set up', its because of the nature of `await`ing in javascript. Jester essentially works like this (code shown is roughly what is executed for each of your test modules):

```javascript
eachTestModule.setUp()
await eachTestModule.assertions[eachAssertionId].function()
eachTestModule.tearDown()
```

If Jester supported `async setUp`, and used instead `await eachTestModule.setUp()`, the module `setUp` method would be fired twice in a row, before either of the assertion functions are called. As such, by the time 'Should be able to set up' is called, `semaphore` is already populated with `[4]`; the `setUp` method has been called before this point and so `semaphore` is not cleared out.

Unfortunately there's no way to get around this behavior. If you ask the javascript engine to `await`, it will defer execution to the next asynchronous branch, and will only catch up once there are no more branches to fall back to. That means that the `setUp` method will be called `n` times in a row for the `n` assertions you are making. This completely negates the purpose of a `setUp` method, so `async` support and behavior of the `setUp` method has been removed.

Consider rethinking the state of your module variables at test execution, your test flow, and other opportunities to reset module state before assertions without relying on an `async` method. If you're convinced you still need an `async` method to clear your state, you can always brute force it in the assertion (not in the `setUp` or `tearDown`):

```javascript
// tests/jester_test.js

let semaphore = [4]

async function runAsyncBeforeAssertion() {
  await new Promise(resolve => resolve(semaphore.splice(0))
}

export const assertions = {
  'Should be able to modify a global': {
    function: async () => {
      await runAsyncBeforeAssertion()
      semaphore.push(4)
      assert.deepStrictEqual(semaphore, [4])
    },
  },
  'Should be able to set up': {
    function: async () => {
      await runAsyncBeforeAssertion()
      assert.deepStrictEqual(semaphore, [])
    },
  },
}
```
