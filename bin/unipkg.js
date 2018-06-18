#!/usr/bin/env node

const prm = require("commander");
const dpkg = require("../src/index.js");

prm.version("0.0.3");

prm
  .command("scan <directory>")
  .alias("s")
  .description(
    `
    Implementation of the dpkg-scanpackages -m command.
<directory> is the directory to be scanned for Debian packages (.deb files).
these will be added to a Packages index file which will be output in the current
directory.
`
  )
  .action(dir => {
    dpkg.scan(dir).then(
      _ => {
        console.log(`The Packages file was written successfully.`);
      },
      err => {
        console.error(`Error: ${err}`);
      }
    );
  });

prm
  .command("build <directory> [<out>]", { isDefault: true })
  .alias("b")
  .description(
    `
    Implementation of the dpkg-deb -b command. 
<directory> is the well structured package folder which should
contain both the DEBIAN folder and the data of the package.
[<deb>] is the optional output filename and path of the resulting Debian 
format archive. It defaults to outputting a deb file in the current working
directory using the standard Debian name scheme.
`
  )
  .action((dir, out) => {
    dpkg.build(dir, out).then(
      path => {
        console.log(
          `The Debian package ${path} has been successfully written.`
        );
        process.exit(0);
      },
      err => {
        console.error(`Error: ${err}`);
        process.exit(1);
      }
    );
  });

prm.parse(process.argv);

if (prm.args.length === 0) {
  prm.help();
}
