# jester
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=test)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=coverage)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=publish)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/deploy/badge.svg?job=document)](https://github.com/sonicoriginalsoftware/jester/actions)

© 2020 Nathan Blair

An async javascript test runner - using V8 code coverage and ES6 Modules

# Dependencies
- None!

# Usage
```javascript
  // test/jestertest.js
  import {strict as assert} from 'assert'
  import {Assert} from '@sonicoriginalsoftware/jester'
  
  export class JesterTest extends Test {
    static testClassFriendlyName = 'Jester Test'
  
    static async Run(status, logger) {
      Assert(() => assert.strictEqual(2, 2), '2 should equal 2', status, logger)
  
      Assert(() => assert.throws(() => new Test()), 'Should not be able to instantiate a new Test instance', status, logger)
    }
  }
```

# Running
- `npx -n "[experimental flags]" jester`
  - On node < 13.8.0, need to use the `--experimental-modules` flag
  - All node versions need to run with the `--experimental-json-modules` flag
- Once ES6 modules are supported without the `--experimental-modules` and `--experimental-json-modules` flags, you can just run `npx jester` (or `jester` if installed globally)
- `jester` walks your `tests` folder (change using the `-d` flag) asynchronously to round up all your Test classes (see [Test Documentation](https://sonicoriginalsoftware.github.io/jester/Test.html)), then executes them all asynchronously
- It uses `performance` from `perf_hooks` to time the execution of all test executions

# Help
- Run with the `-h` flag for help on configuring

# Documentation
See https://sonicoriginalsoftware.github.io/jester/

