const fs = require("fs-extra");
const tmp = require("tmp");
const tar = require("tar");
const path = require("path");
const klaw = require("klaw");
const crypto = require("crypto");

// http://www.sosst.sk/doc/debian-policy/policy.html/ch-controlfields.html
const requiredFields = [
  "Package",
  "Version",
  "Architecture",
  "Maintainer",
  "Description"
];

const controlFiles = new Set([
  "conffiles",
  "postinst",
  "postrm",
  "preinst",
  "prerm"
]);

class Debian {
  static async build(inDir, outPath, envReplacement = true) {
    inDir = path.resolve(inDir);
    if (!fs.existsSync(inDir)) {
      let err = new Error(`Directory ${inDir} not found.`);
      err.code = 2;

      throw err;
    }

    const dpkgDir = inDir + "/DEBIAN";
    if (!fs.existsSync(dpkgDir)) {
      let err = new Error(
        `DEBIAN directory not found. Are you sure you've selected the correct directory?`
      );
      err.code = 2;

      throw err;
    }

    const ctrlPath = dpkgDir + "/control";
    if (!fs.existsSync(ctrlPath)) {
      let err = new Error("control file not found in DEBIAN directory.");
      err.code = 2;

      throw err;
    }

    let control;
    if (envReplacement) {
      control = await Debian.substvars(ctrlPath).catch(err => {
        throw err;
      });
    } else {
      control = await Debian.parseControl(ctrlPath).catch(err => {
        throw err;
      });
    }

    // Start creating the package.
    const tmpDir = tmp.dirSync().name;
    const tarData = tmpDir + "/data.tar.gz";
    const tarCtrl = tmpDir + "/control.tar.gz";

    // Data directory – we have everything we need
    // console.log(`Creating ${tarData}`);
    const tarDataFile = tar.create(
      {
        file: tarData,
        gzip: true,
        portable: true,
        cwd: inDir,
        filter: tpath => {
          return (
            path.dirname(tpath).split(path.sep)[1] != "DEBIAN" &&
            tpath != "./DEBIAN"
          );
        }
      },
      ["."]
    );

    // Construct control directory.
    const ctrlDir = tmpDir + "/control";
    const tmpBin = tmpDir + "/debian-binary";
    const tmpCtrl = ctrlDir + "/control";
    const tmpMD5 = ctrlDir + "/md5sums";

    const files = await fs.mkdir(ctrlDir).then(() => {
      return fs.readdir(dpkgDir);
    });

    // copy user-generated files
    const promises = [];
    const relFiles = files.filter(x => controlFiles.has(x));

    relFiles.forEach(file => {
      let promise = fs
        .copy(`${dpkgDir}/${file}`, `${ctrlDir}/${file}`)
        .then(() => {
          let code = file != "conffiles" ? 0o755 : 0o644;
          return fs.chmod(`${ctrlDir}/${file}`, code);
        });
      promises.push(promise);
    });

    // walk data to get size and MD5 sums
    const md5Stream = fs.createWriteStream(tmpMD5, { autoClose: false });
    let pkgSize = 0;
    const klawOpts = {
      filter: tpath => {
        return (
          path.dirname(tpath).split(path.sep)[1] != "DEBIAN" &&
          tpath != "./DEBIAN"
        );
      }
    };

    const md5Promise = [];

    promises.push(
      new Promise(rel => {
        klaw(inDir, klawOpts)
          .on("data", item => {
            if (item.stats.isFile()) {
              pkgSize += item.stats.size;
              let task = fs.readFile(item.path).then(data => {
                const md5 = crypto
                  .createHash("md5")
                  .update(data)
                  .digest("hex");

                md5Stream.write(`${md5} ${path.relative(inDir, item.path)}\n`);
              });

              md5Promise.push(task);
            }
          })
          .on("end", () => {
            Promise.all(md5Promise).then(_ => {
              md5Stream.end();
              if (!("Installed-Size" in control)) {
                control["Installed-Size"] = Math.floor(
                  pkgSize / 1024
                ).toString();
              }
              Debian.writeControl(tmpCtrl, control).then(() => rel());
            });
          });
      })
    );

    await Promise.all(promises);

    const tarCtrlFile = tar.create(
      {
        file: tarCtrl,
        gzip: true,
        portable: true,
        cwd: ctrlDir
      },
      ["."]
    );

    const binFile = fs.writeFile(tmpBin, "2.0\n");

    // Combine everything
    // https://www.debian.org/doc/manuals/maint-guide/index.en.html
    await Promise.all([tarDataFile, tarCtrlFile, binFile]).catch(err => {
      throw err;
    });

    if (!outPath) {
      outPath = `${control["Package"]}_${control["Version"]}_${
        control["Architecture"]
      }.deb`;
    }

    const outStream = fs.createWriteStream(outPath, {
      encoding: "binary",
      autoClose: false
    });

    outStream.write(`!<arch>${String.fromCharCode(0x0a)}`);

    [tmpBin, tarCtrl, tarData].forEach(filename => {
      const fileContents = fs.readFileSync(filename);
      const stats = fs.lstatSync(filename);

      outStream.write(Debian.rightPad(16, path.basename(filename)));
      outStream.write(
        Debian.rightPad(12, Math.floor(stats.mtime / 1000).toString())
      );
      outStream.write(Debian.rightPad(6, "0"));
      outStream.write(Debian.rightPad(6, "0"));
      outStream.write(Debian.rightPad(8, "100644"));
      outStream.write(Debian.rightPad(10, stats.size.toString()));
      outStream.write(String.fromCharCode(0x60) + String.fromCharCode(0x0a));
      outStream.write(fileContents);

      if (stats.size % 2 === 1) {
        outStream.write(String.fromCharCode(0x0a));
      }
    });

    return new Promise(res => {
      outStream.end(() => res(outPath));
    });
  }

  static rightPad(n, string) {
    return (
      string + Array(n - string.length + 1).join(String.fromCharCode(0x20))
    );
  }

  static async substvars(input) {
    if (!(input instanceof Object)) {
      // input is a path string
      input = await Debian.parseControl(input);
    }

    // http://pubs.opengroup.org/onlinepubs/000095399/basedefs/xbd_chap08.html
    let regex = /\$\{([a-zA-Z_]+[a-zA-Z0-9_]*)\}/g;
    for (let key in input) {
      if (Array.isArray(input[key])) {
        for (let i = 0; i < input[key].length; i++) {
          input[key][i] = input[key][i].replace(regex, (match, result) => {
            if (result in process.env) {
              return process.env[result];
            }

            return "";
          });
        }
      } else {
        input[key] = input[key].replace(regex, (match, result) => {
          if (result in process.env) {
            return process.env[result];
          }

          return "";
        });
      }
    }

    return input;
  }

  static async parseControl(file) {
    return fs
      .readFile(file, { encoding: "utf8" })
      .then(data => {
        /*
          dataDict format
          {
            key: value,
            Description: [
              "whitespace trimmed description to be left-padded later"
            ]
          }
        */
        let dataDict = {
          Package: "",
          Version: "",
          Architecture: "",
          Maintainer: "",
          Description: []
        };

        /*
          We use this less than ideal regex here to deal with long
          descriptions that are present in some Debian packages.
          
          https://www.debian.org/doc/manuals/maint-guide/dreq.en.html#control
        */

        var result;
        var reg = /^(([^\s]*):)?(.+)/gm;
        while ((result = reg.exec(data))) {
          /*
            result[1] = Description:
            result[2] = Description
            result[3] = virtual dice roller
          */

          if (result[3]) {
            if (!result[2] || result[2] == "Description") {
              dataDict["Description"].push(result[3].trim());
            } else {
              dataDict[result[2]] = result[3].trim();
            }
          }
        }
        return dataDict;
      })
      .then(data => {
        requiredFields.forEach(item => {
          if (!(item in data) || data[item] == "" || data[item] == []) {
            let err = new Error(
              `The field ${item} is missing from the control file.`
            );
            err.code = 2;

            throw err;
          }
        });

        return data;
      });
  }

  static async writeControl(file, data) {
    const stream = fs.createWriteStream(file);

    for (let key in data) {
      if (Array.isArray(data[key])) {
        let joined = data[key].join("\n ");
        await stream.write(`${key}: ${joined}\n`);
      } else {
        await stream.write(`${key}: ${data[key]}\n`);
      }
    }

    stream.end();
  }
}

module.exports = Debian;
