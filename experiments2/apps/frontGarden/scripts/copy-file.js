// copy-file.js

"use strict";

import fs from "fs";

function copyFile(source, target, cb) {
  let cbCalled = false;

  const rd = fs.createReadStream(source);
  rd.on("error", function (err) {
    done(err);
  });
  const wr = fs.createWriteStream(target);
  wr.on("error", function (err) {
    done(err);
  });
  wr.on("close", function (ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

export default copyFile;
