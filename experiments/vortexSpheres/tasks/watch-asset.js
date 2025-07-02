// watch-asset.js

"use strict";

const fs = require("fs-extra");
const watcher = require("./watch");
const getExtension = require("./getExtension");
const getFileName = require("./getFileName");

const ASSETS_PATH = ["./public/assets"];

const OUTPUT_PATH = "./src/asset-list.js";
const TEMPLATE_PATH = "./tasks/asset-template.js";
let assets = [];
let needUpdate = true;

function replace(str, pattern, strToReplace) {
  return str.replace(new RegExp(pattern, "g"), strToReplace);
}

function saveFile(str) {
  fs.writeFile(OUTPUT_PATH, str, (err, data) => {
    if (err) {
      console.log("Error Writing File");
    } else {
      console.log("asset-list.js updated");
    }
  });
}

function isDir(mPath) {
  return fs.lstatSync(mPath).isDirectory();
}

function getAssetsInDir(mSourceDir, mCallback) {
  fs.readdir(mSourceDir, (err, files) => {
    console.log("source", mSourceDir);
    const assetPath = mSourceDir.replace("./public/", "");
    console.log("Dir path :", mSourceDir, assetPath);

    //	ERROR GETTING FOLDER
    if (err) {
      console.log("Error :", err);
      return;
    }

    let assets = files.filter((f) => {
      return f.indexOf("DS_Store") === -1 && f.indexOf(".mtl") === -1;
    });

    // console.log('Assets in ', mSourceDir, assets);

    for (let i = 0; i < assets.length; i++) {
      let a = assets[i];
      // console.log('is dir ? ', a, fs.lstatSync(`${mSourceDir}/${a}`).isDirectory());
    }

    const folders = assets.filter((a) => {
      return isDir(`${mSourceDir}/${a}`);
    });

    assets = assets.filter((a) => {
      return !isDir(`${mSourceDir}/${a}`);
    });

    assets = assets.map((f) => {
      return `${assetPath}/${f}`;
    });

    console.log("Folders:", assets);

    if (folders.length == 0) {
      mCallback(assets);
    } else {
      let count = 0;
      const onAssets = (a) => {
        assets = assets.concat(a);
        count++;
        if (count === folders.length) {
          mCallback(assets);
        }
      };

      for (let i = 0; i < folders.length; i++) {
        let a = folders[i];
        getAssetsInDir(`${mSourceDir}/${a}`, onAssets);
      }
    }
  });
}

function getAssets() {
  assets = [];
  let count = 0;

  const onFolder = (files) => {
    assets = assets.concat(files);
    count++;

    if (count == ASSETS_PATH.length) {
      generateAssetList();
    }
  };

  for (let i = 0; i < ASSETS_PATH.length; i++) {
    let dir = ASSETS_PATH[i];
    getAssetsInDir(dir, onFolder);
  }
}

function getAssetType(mExt) {
  switch (mExt) {
    case "jpg":
      return "jpg";
    case "png":
      return "png";
    case "obj":
      return "text";
    case "dds":
      return "binary";
    case "hdr":
      return "binary";
  }
}

function generateAssetList() {
  const list = assets.map((file) => {
    const id = getFileName(file);
    const url = file;
    const ext = getExtension(file);
    const type = getAssetType(ext);

    return {
      id,
      url,
      type,
    };
  });

  let strList = JSON.stringify(list);
  strList = strList.replace("[", "[\n\t");
  strList = strList.replace("]", "\n]");
  strList = strList.split("},{").join("},\n\t{");
  console.log(strList);

  fs.readFile(TEMPLATE_PATH, "utf8", (err, str) => {
    if (err) {
      console.log("Error Loading file !");
    } else {
      str = replace(str, "{{ASSETS}}", strList);
      saveFile(str);
    }
  });
}

// getAssets();

function loop() {
  if (needUpdate) {
    console.log("Update Assets");
    getAssets();
    needUpdate = false;
  }
}

const dirPaths = ASSETS_PATH.concat();
dirPaths.reduce((sequence, dirPath) => {
  return sequence
    .then(() => {
      console.log("dirPath", dirPath);
      return fs.ensureDir(dirPath);
    })
    .then(() => {
      startWatch();
    })
    .catch((err) => {
      console.log("Error :", err);
    });
}, Promise.resolve());

const startWatch = () => {
  setInterval(loop, 500);
  const watcherAssets = watcher([ASSETS_PATH]);

  watcherAssets.on("all", (event, file) => {
    console.log("Event:", event);
    if (file.indexOf(".DS_Store") > -1) return;
    needUpdate = true;
  });
};
