# unipkg
[![Gitter chat](https://badges.gitter.im/unipkg/gitter.svg)](https://gitter.im/unipkg/Lobby)
[![Build Status](https://travis-ci.com/FrederickGeek8/unipkg.svg?token=hQpyUwvb4S1UztNVqWsQ&branch=master)](https://travis-ci.com/FrederickGeek8/unipkg)

Multi-platform implementation of dpkg (in Javascript) with a programming and
command-line interface. Currently only the functional equvalence of `dpkg-deb -b`
has been developed.

## Requirements
All that is assumed that you are running a Node.js version that
[has not been marked as end-of-life.](https://github.com/nodejs/Release#release-schedule)

The project depends on `fs-extra`, `klaw`, `tmp`, `tar`, all of which should be
installed by NPM or Yarn when installing the package. This should *in theory* run
on Windows, macOS, and Linux.

## Installation
`unipkg` can be installed by either NPM or Yarn, however, for the average user
`unipkg` can be globally installed (meaning the `unipkg` binaries and libraries
are in your path) by running
```bash
npm install -g unipkg
```
or, of course, locally by running
```bash
npm install unipkg
```

## Usage
`unipkg` has both a interface for Node.js as well as a command-line interface.
The command line interface can be used as follows:
```bash
unipkg <directory> [<deb>]
```
Where `<directory>` is the path to the root of the Debian package you want to
build, and `[<deb>]` is the optional output file path parameter. By default
`unipkg` will generate the output deb file in your current working directory
using the standard Debian naming scheme.

The following is boilerplate code for the Node.js interface. `build` can take two
parameters, where the first parameter is the input directory, and the second
(optional) parameter is the output deb path. It will return a Promise.
```node
const dpkg = require("unipkg");
const pkg = "path/to/project/root";

dpkg.build(pkg).then(
  path => {
    console.log(`The Debian package ${path} has been successfully written.`);
    process.exit(0);
  },
  err => {
    console.error(`Error: ${err}`);
    process.exit(1);
  }
);
```

## Contributing
Feel free to submit issues or pull requests to the repository. Before contributing,
please read our [Contributing Guide](CONTRIBUTING.md).

## Related Readings
* [Overview of `control` file fields](http://www.sosst.sk/doc/debian-policy/policy.html/ch-controlfields.html)
* [Debian Maintainer's Guide](https://www.debian.org/doc/manuals/maint-guide/index.en.html)
* [Environment Variable Definition](http://pubs.opengroup.org/onlinepubs/000095399/basedefs/xbd_chap08.html)
* [`ar` File Format](https://en.wikipedia.org/wiki/Ar_%28Unix%29#File_format_details)

## Related Software
Despite my best efforts to initially find alternative software before beginning
development of this project, before publishing I found several alterative to this
package. Honestly, if I had found these before probably would not have persued
writing my own library for this.

1. [debpkg](https://github.com/xor-gate/debpkg) by xor-gate is a is a pure Go
library to create Debian packages. It has zero dependencies to Debian. It is
able to generate packages from Mac OS X, *BSD and Windows.
2. [dpkg-build](https://github.com/wr1241/dpkg-build) by wr1241 seems to be a
largely non-active repository, however, it provides much of the same functionality
of this library's API (sans CLI).