// isDirectory.js
import fs from "fs";

export default function isDirectory(mPath) {
  try {
    return fs.lstatSync(mPath).isDirectory();
  } catch (e) {
    return false;
  }
}
