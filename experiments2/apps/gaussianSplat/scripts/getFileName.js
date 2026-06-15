export default function getFileName(mPath) {
  const ary = mPath.split("/");
  let str = ary[ary.length - 1];
  const lastIndex = str.lastIndexOf(".");
  str = str.substring(0, lastIndex);
  return str;
}
