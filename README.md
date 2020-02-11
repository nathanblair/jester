# jester
An async JS test runner - using V8 code coverage and ES6 Modules

# Dependencies
- None!

# Requires
- If running from Node.js, need to use the `--experimental-modules` flag
  - Hopefully with the LTS release of the next version coming up in the next few days (10/20ish), this won't be needed anymore!
  - ...apparently Node is taking their time with these flags. So...still need the flag as of the 12.13 LTS
  - You will also need to run with the `--experimental-json-modules` flag

# Running
- Once ES6 modules are supported without the `--experimental-modules` and `--experimental-json-modules` flags, you can just run `npx jester` (or `jester` if installed globally)
- Otherwise, you'll have to issue `node --experimental-modules --experimental-json-modules node_modules/jester/bin/jester.js`
- `jester` walks your `tests` folder (whatever folder you store your tests in) asynchronously to round up all your Test classes (see [How-to](#How-to), below), then executes them all asynchronously
- It uses `performance` from `perf_hooks` to time the execution of all test executions

# Documentation
See https://sonicoriginalsoftware.github.io/jester/

