# Contributing Guide
Contributions are always welcome, no matter how big or small. Since this is an
earlier project, we strive for forwards compatibility, however, if changes are
merited, they will be made. Before contributing, please read the [code of conduct.](CODE_OF_CONDUCT.md)

## Questions
If you have a question that does not appear to be an issue with the repository
(e.g. not sure how to set up or use). Please reach out our Gitter chatroom.
You can always find it in the README as the [![Gitter chat](https://badges.gitter.im/unipkg/gitter.svg)](https://gitter.im/unipkg/Lobby) button.

## Unit tests
After cloning the repository and installing the `devDependencies`, unit tests
can be run with the command `npm run test` or `npm test`. This will execute unit
tests with Jest (`npm run test-only`) as well as lint the repository following the [Prettier](https://github.com/prettier/prettier)
code formatter (`npm run lint`).

If you want to run code coverage tests, they can be run through Jest by issuing
the `npm run test-only` command. This will perform the standard unit tests as
well as perform a code coverage test.

If you want to run the linter in a "fix" mode, you can execute `npm run lint-fix`,
which will attempt to automatically fix and save any basic errors in the code, as
well as fix formatting. **NOTE:** I believe this will save over your files, so use
at your own risk.

## Pull Requests
Pull requests are always welcomed. Before submitting a pull request, however,
please make sure you have done the following things:
1. Fork the repo and create your branch from `master`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the available documentation.
4. Ensure that all tests run and code coverage has not decreased signifigantly
from before.
5. Make sure your code lints.
