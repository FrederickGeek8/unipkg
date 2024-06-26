const fs = require("fs-extra");
const tmp = require("tmp");
const ar = require("ar");
const tar = require("tar");
const crypto = require("crypto");
const Duplex = require("stream").Duplex;
const path = require("path");

class Scan {
  // Generate Packages file
  static async scan(dir, opts = {}) {
    const files = fs.readdirSync(dir).filter(file => file.match(/.*\.deb/));
    return Scan.scanFiles(files.map(e => `${dir}/${e}`), opts);
  }

  // Generate Packages from Array
  static async scanFiles(files, opts = {}) {
    const tmpDir = tmp.dirSync().name;
    var packages = "";

    if (typeof opts == "string") {
      opts = { cwd: opts };
    } else {
      opts.cwd = opts.cwd ? opts.cwd : "";
    }

    for (let i = 0; i < files.length; i++) {
      let archive = new ar.Archive(fs.readFileSync(files[i]));
      let control = archive
        .getFiles()
        .filter(f => f.name() == "control.tar.gz")[0];

      await new Promise((res, rej) => {
        let stream = new Duplex();
        stream.push(control.fileData());
        stream.push(null);
        stream
          .pipe(
            tar.x({
              cwd: tmpDir
            })
          )
          .on("entry", entry => {
            if (entry.header.path == "./control") {
              const controlData = entry.read().toString();
              packages += controlData;
              control = {}; //recycle variable
              // parse control
              for (let dataLine of controlData.split("\n")) {
                const data = dataLine.split(":");
                if (data.length == 2) {
                  control[data[0]] = data[1].trim();
                }
              }
            }
          })
          .on("end", _ => {
            res();
          });
      });

      // Generate hashes of DEB file
      var md5 = crypto.createHash("md5");
      var sha1 = crypto.createHash("sha1");
      var sha256 = crypto.createHash("sha256");

      await fs.readFile(files[i]).then(data => {
        md5 = md5.update(data).digest("hex");
        sha1 = sha1.update(data).digest("hex");
        sha256 = sha256.update(data).digest("hex");
      });

      const stats = fs.statSync(files[i]);
      const relPath = path.relative(opts.cwd, files[i]);

      if (typeof opts.filename == "function") {
        opts.filename = await opts.filename(control);
      } else {
        opts.filename = relPath;
      }

      packages += `Filename: ${opts.filename}\n`;
      packages += `Size: ${stats.size}\n`;
      packages += `MD5sum: ${md5}\n`;
      packages += `SHA1: ${sha1}\n`;
      packages += `SHA256: ${sha256}\n`;
      packages += "\n";
    }

    return fs.writeFile(path.join(opts.cwd, "Packages"), packages);
  }
}

module.exports = Scan;
