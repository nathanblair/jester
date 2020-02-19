# jester
[![](https://github.com/sonicoriginalsoftware/jester/workflows/test/badge.svg)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/coverage/badge.svg)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/publish/badge.svg)](https://github.com/sonicoriginalsoftware/jester/actions)
[![](https://github.com/sonicoriginalsoftware/jester/workflows/document/badge.svg)](https://github.com/sonicoriginalsoftware/jester/actions)

© 2020 Nathan Blair

An async JS test runner - using V8 code coverage and ES6 Modules

# Dependencies
- None!

# Running
- `npx [experimental flags] jester`
  - On node < 13.8.0, need to use the `--experimental-modules` flag
  - All node versions need to run with the `--experimental-json-modules` flag
- Once ES6 modules are supported without the `--experimental-modules` and `--experimental-json-modules` flags, you can just run `npx jester` (or `jester` if installed globally)
- `jester` walks your `tests` folder (change using the `-d` flag) asynchronously to round up all your Test classes (see [Test Documentation](https://sonicoriginalsoftware.github.io/jester/Test.html)), then executes them all asynchronously
- It uses `performance` from `perf_hooks` to time the execution of all test executions

# Help
- Run with the `-h` flag for help on configuring

# Documentation
See https://sonicoriginalsoftware.github.io/jester/

