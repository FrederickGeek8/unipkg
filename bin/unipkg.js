#!/usr/bin/env node

if (process.argv.length < 3 || process.argv.find(arg => arg === "--help")) {
  console.log(
    `Usage: unipkg <directory> [<deb>]
    
    Implementation of the dpkg-deb -b command. 

    <directory> is the well structured package folder which should
    contain both the DEBIAN folder and the data of the package.
    [<deb>] is the optional output filename and path of the resulting Debian 
    format archive. It defaults to outputting a deb file in the current working
    directory using the standard Debian name scheme.
    `
  );

  process.exit(0);
}

const dpkg = require("../src/index.js");

dpkg.build(process.argv[2], process.argv[3]).then(
  path => {
    console.log(`The Debian package ${path} has been successfully written.`);
    process.exit(0);
  },
  err => {
    console.error(`Error: ${err}`);
    process.exit(1);
  }
);
