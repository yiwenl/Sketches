// getExtension.js

export default function (mFile) {
  const ary = mFile.split(".");
  return ary[ary.length - 1];
}
