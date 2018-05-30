const dpkg = require("../src/index.js");
const fs = require("fs-extra");
const tar = require("tar");
const epsilon = 100;

process.chdir(__dirname);
test("generates standard deb file", async () => {
  expect.assertions(2);
  return dpkg
    .build(`${__dirname}/fixtures/working_package`)
    .then(file => {
      const stats = fs.statSync("rolldice_1.16-1+b2_amd64.deb");
      expect(file).toBe("rolldice_1.16-1+b2_amd64.deb");
      expect(Math.abs(stats.size - 13198)).toBeLessThan(epsilon);
    })
    .then(() => fs.unlink("rolldice_1.16-1+b2_amd64.deb"));
});

test("invalid inDir", async () => {
  expect.assertions(1);
  const inDir = `${__dirname}/fixtures/not_found`;
  return dpkg
    .build(inDir)
    .catch(e => expect(e.message).toMatch(`Directory ${inDir} not found.`));
});

test("missing DEBIAN", async () => {
  expect.assertions(1);
  return dpkg
    .build(`${__dirname}/fixtures/missing_debian`)
    .catch(e =>
      expect(e.message).toMatch(
        `DEBIAN directory not found. Are you sure you've selected the correct directory?`
      )
    );
});

test("missing control fields", async () => {
  expect.assertions(1);
  const item = "Package";
  return dpkg
    .build(`${__dirname}/fixtures/control_fields`)
    .catch(e =>
      expect(e.message).toMatch(
        `The field ${item} is missing from the control file.`
      )
    );
});

test("environment variables", async () => {
  expect.assertions(1);

  return dpkg
    .substvars({
      Package: "${HOME}"
    })
    .then(data => {
      expect(data["Package"]).toBe(process.env["HOME"]);
    });
});
