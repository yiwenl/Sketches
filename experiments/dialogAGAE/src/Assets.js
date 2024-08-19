let _assets;
import { GLTexture, parseObj } from "alfrid";

const init = (mAssets) => {
  _assets = mAssets.map(({ id, file, type }) => {
    const source = file;
    let _file;
    switch (type) {
      case "jpg":
      case "png":
        _file = new GLTexture(file);
        break;
      case "text":
        _file = parseObj(file);
        break;
    }

    return {
      id,
      source,
      type,
      file: _file,
    };
  });
  console.table(_assets);
};

const get = (mName) => {
  const asset = _assets.find((o) => o.id === mName);
  if (!asset) {
    return null;
  }

  return asset.file;
};

const Assets = {
  init,
  get,
};

export default Assets;
