import parse from "parse-dds";

const DDSD_MIPMAPCOUNT = 0x20000;
const OFF_MIPMAPCOUNT = 7;
const headerLengthInt = 31;

const parseDds = function(mArrayBuffer) {
  //	CHECKING MIP MAP LEVELS
  const ddsInfos = parse(mArrayBuffer);
  const { flags } = ddsInfos;
  const header = new Int32Array(mArrayBuffer, 0, headerLengthInt);
  let mipmapCount = 1;
  if (flags & DDSD_MIPMAPCOUNT) {
    mipmapCount = Math.max(1, header[OFF_MIPMAPCOUNT]);
  }
  const sources = ddsInfos.images.map((img) => {
    const faceData = new Float32Array(
      mArrayBuffer.slice(img.offset, img.offset + img.length)
    );
    return {
      data: faceData,
      shape: img.shape,
      mipmapCount,
    };
  });

  return sources;
};

export { parseDds };
