const dpkg = require("../src/scan");
const fs = require("fs-extra");

process.chdir(`${__dirname}/fixtures/`);
test("generates standard Packages file", async () => {
  expect.assertions(1);
  return dpkg
    .scan(`${__dirname}/fixtures/fake_package`)
    .then(() => {
      const file = fs.readFileSync("Packages").toString();
      const approx = `Package: rolldice
    Source: rolldice (1.16-1)
    Version: 1.16-1+b2
    Architecture: amd64
    Maintainer: Thomas Ross <thomasross@thomasross.io>
    Installed-Size: 34
    Depends: libc6 (>= 2.7), libreadline7 (>= 6.0)
    Section: games
    Priority: optional
    Homepage: https://github.com/sstrickl/rolldice
    Description: virtual dice roller
     rolldice is a virtual dice roller that takes a string on the command
     line in the format  of some fantasy role playing games like Advanced
     Dungeons & Dragons [1] and returns the result of the dice rolls.
     .
     [1] Advanced Dungeons & Dragons is a registered trademark of TSR, Inc.
    MD5sum: 5fa919894c5be25e744731b245036152
    SHA1: 30f71d3b911c8739cacea94862d7c4123e071ba4
    SHA256: 0127e1142add31a84422fab6ad668f795c31512c0d132e46fad6640edfdaf184`.replace(
        /\s/g,
        ""
      );

      expect(file.replace(/\s/g, "")).toBe(approx);
    })
    .then(() => fs.unlink("Packages"));
});
