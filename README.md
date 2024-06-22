# unipkg
[![npm](https://img.shields.io/npm/v/unipkg.svg)](https://www.npmjs.com/package/unipkg)


Multi-platform implementation of dpkg (in Javascript) with a programming and
command-line interface.

## Requirements
This project has been tested (via our Jest tests) on Node v18.20.3 and v20.15.0.

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
The command line usage is as follows:
```bash
Usage: unipkg [options] [command]

Options:

  -V, --version                output the version number
  -h, --help                   output usage information

Commands:

  scan|s <directory>
      Implementation of the dpkg-scanpackages -m command.
  <directory> is the directory to be scanned for Debian packages (.deb files).
  these will be added to a Packages index file which will be output in the current
  directory.

  build|b <directory> [<out>]
      Implementation of the dpkg-deb -b command.
  <directory> is the well structured package folder which should
  contain both the DEBIAN folder and the data of the package.
  [<deb>] is the optional output filename and path of the resulting Debian
  format archive. It defaults to outputting a deb file in the current working
  directory using the standard Debian name scheme.
```

The following is boilerplate code for the Node.js interface. The Node.js interface
has the same usage and parameters as the CLI. Each function will return a Promise.
```node
const dpkg = require("unipkg");
const pkg = "path/to/repo/deb/root";
const repo = "path/to/repo"

dpkg.build(pkg).then(
  path => {
    console.log(`The Debian package ${path} has been successfully written.`);
  },
  err => {
    console.error(`Error: ${err}`);
  }
);

dpkg.scan(repo).then(
  path => {
    console.log(`Your repository has been successfully created.`);
  },
  err => {
    console.error(`Error: ${err}`);
  }
)
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