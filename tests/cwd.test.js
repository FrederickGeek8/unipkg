const dpkg = require("../src/scan");
const fs = require("fs-extra");

// process.chdir(`${__dirname}/fixtures/`);
test("test CWD scan feature", async () => {
  expect.assertions(1);
  return fs.mkdirp(`${__dirname}/fixtures/fake_package/test`).then(() =>
    dpkg
      .scan(
        `${__dirname}/fixtures/fake_package`,
        `${__dirname}/fixtures/fake_package/test`
      )
      .then(() => {
        const file = fs
          .readFileSync(`${__dirname}/fixtures/fake_package/test/Packages`)
          .toString();
        const approx = `Package: rolldice
      Version: 1.16-1+b2
      Architecture: amd64
      Maintainer: Thomas Ross <thomasross@thomasross.io>
      Description: virtual dice roller
       rolldice is a virtual dice roller that takes a string on the command
       line in the format  of some fantasy role playing games like Advanced
       Dungeons & Dragons [1] and returns the result of the dice rolls.
       .
       [1] Advanced Dungeons & Dragons is a registered trademark of TSR, Inc.
      Source: rolldice (1.16-1)
      Installed-Size: 34
      Depends: libc6 (>= 2.7), libreadline7 (>= 6.0)
      Section: games
      Priority: optional
      Homepage: https://github.com/sstrickl/rolldice
      Filename: ../rolldice_1.16-1+b2_amd64.deb
      Size: 13018
      MD5sum: 248377a63b7b9283483216dd0fd092d5
      SHA1: 192269040e5b98ae4dd1cc91f7780db8d1c9b105
      SHA256: f21d95c10a6348a6b46c69f7290ecf064b14999c86572e3bbc700d517df05116`.replace(
          /\s/g,
          ""
        );

        expect(file.replace(/\s/g, "")).toBe(approx);
      })
      .then(() => fs.unlink(`${__dirname}/fixtures/fake_package/test/Packages`))
      .then(() => fs.remove(`${__dirname}/fixtures/fake_package/test`))
  );
});
