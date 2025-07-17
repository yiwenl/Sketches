import { loadImage } from "./image-loader";
import {
  loadTextWithFetch,
  loadJSONWithFetch,
  loadBinaryTextWithFetch,
} from "./text-loader";

export type Asset = {
  id: string;
  type: string;
  url: string;
};

export type AssetsList = Asset[];

export type LoadedAsset = {
  id: string;
  type: string;
  source: any;
};

export class AssetManager {
  private static cache = new Map<string, any>();
  private static loadingAssets = new Set<string>();

  static async load(assets: AssetsList): Promise<LoadedAsset[]> {
    const results = await Promise.all(
      assets.map(async (asset) => {
        const data = await this.loadAsset(asset);
        return {
          id: asset.id,
          type: asset.type,
          source: data,
        };
      })
    );
    return results;
  }

  private static async loadAsset(asset: Asset) {
    switch (asset.type) {
      case "image":
        return this.loadImage(asset.url, asset.id);
      case "text":
        return this.loadText(asset.url, asset.id);
      case "json":
        return this.loadJSON(asset.url, asset.id);
      case "binary-text":
        return this.loadBinaryText(asset.url, asset.id);
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }
  }

  private static async loadImage(url: string, id: string) {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    // Prevent duplicate loading
    if (this.loadingAssets.has(id)) {
      return this.waitForAsset(id);
    }

    this.loadingAssets.add(id);

    try {
      const image = await loadImage(url);
      this.cache.set(id, image);
      return image;
    } finally {
      this.loadingAssets.delete(id);
    }
  }

  private static async loadText(url: string, id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    if (this.loadingAssets.has(id)) {
      return this.waitForAsset(id);
    }

    this.loadingAssets.add(id);

    try {
      const text = await loadTextWithFetch(url);
      this.cache.set(id, text);
      return text;
    } finally {
      this.loadingAssets.delete(id);
    }
  }

  private static async loadJSON(url: string, id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    if (this.loadingAssets.has(id)) {
      return this.waitForAsset(id);
    }

    this.loadingAssets.add(id);

    try {
      const json = await loadJSONWithFetch(url);
      this.cache.set(id, json);
      return json;
    } finally {
      this.loadingAssets.delete(id);
    }
  }

  private static async loadBinaryText(url: string, id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    if (this.loadingAssets.has(id)) {
      return this.waitForAsset(id);
    }

    this.loadingAssets.add(id);

    try {
      const text = await loadBinaryTextWithFetch(url);
      this.cache.set(id, text);
      return text;
    } finally {
      this.loadingAssets.delete(id);
    }
  }

  private static waitForAsset(id: string) {
    return new Promise((resolve) => {
      const checkCache = () => {
        if (this.cache.has(id)) {
          resolve(this.cache.get(id));
        } else {
          setTimeout(checkCache, 10);
        }
      };
      checkCache();
    });
  }

  static getAsset(id: string) {
    return this.cache.get(id);
  }

  static clearCache() {
    this.cache.clear();
  }

  static isLoaded(id: string) {
    return this.cache.has(id);
  }
}

// Export individual loaders for direct use
export { loadImage } from "./image-loader";
export {
  loadTextWithFetch,
  loadJSONWithFetch,
  loadBinaryTextWithFetch,
} from "./text-loader";

// Export the default AssetManager
export default AssetManager;
