import { GLTexture, parseObj } from "@experiments2/alfrid";
import AssetManager from "@experiments2/asset-loader";
import assetsList from "./assets-list";

export class Assets {
  static _loadedAssets = [];

  static async load() {
    this._loadedAssets = await AssetManager.load(assetsList);

    this._loadedAssets.forEach((asset) => {
      const { type, source } = asset;
      switch (type) {
        case "image":
          asset.data = new GLTexture(source);
          break;
        case "text":
          asset.data = parseObj(source);
          break;
      }
    });

    return this._loadedAssets;
  }

  static get loadedAssets() {
    return this._loadedAssets;
  }

  static get(id) {
    const asset = this._loadedAssets.find((asset) => asset.id === id);
    if (!asset) {
      throw new Error(`Asset ${id} not found`);
    }
    return asset.data;
  }
}
