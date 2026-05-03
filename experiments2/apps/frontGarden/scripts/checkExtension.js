// checkExtension.js

import path from "path";

export default function checkExtension(mFile, mExtensions) {
  if (mExtensions.length == 0) {
    return true;
  }

  let extensions;

  if (!mExtensions.concat) {
    extensions = [mExtensions];
  } else {
    extensions = mExtensions.concat();
  }

  const ext = path.extname(mFile).replace(".", "");
  return mExtensions.indexOf(ext) > -1;
}
