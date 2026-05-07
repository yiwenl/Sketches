"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBinaryTextWithFetch = exports.loadJSONWithFetch = exports.loadTextWithFetch = exports.loadImage = exports.AssetManager = void 0;
const image_loader_1 = require("./image-loader");
const text_loader_1 = require("./text-loader");
class AssetManager {
    static async load(assets) {
        const results = await Promise.all(assets.map(async (asset) => {
            const data = await this.loadAsset(asset);
            return {
                id: asset.id,
                type: asset.type,
                source: data,
            };
        }));
        return results;
    }
    static async loadAsset(asset) {
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
    static async loadImage(url, id) {
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
            const image = await (0, image_loader_1.loadImage)(url);
            this.cache.set(id, image);
            return image;
        }
        finally {
            this.loadingAssets.delete(id);
        }
    }
    static async loadText(url, id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        if (this.loadingAssets.has(id)) {
            return this.waitForAsset(id);
        }
        this.loadingAssets.add(id);
        try {
            const text = await (0, text_loader_1.loadTextWithFetch)(url);
            this.cache.set(id, text);
            return text;
        }
        finally {
            this.loadingAssets.delete(id);
        }
    }
    static async loadJSON(url, id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        if (this.loadingAssets.has(id)) {
            return this.waitForAsset(id);
        }
        this.loadingAssets.add(id);
        try {
            const json = await (0, text_loader_1.loadJSONWithFetch)(url);
            this.cache.set(id, json);
            return json;
        }
        finally {
            this.loadingAssets.delete(id);
        }
    }
    static async loadBinaryText(url, id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        if (this.loadingAssets.has(id)) {
            return this.waitForAsset(id);
        }
        this.loadingAssets.add(id);
        try {
            const text = await (0, text_loader_1.loadBinaryTextWithFetch)(url);
            this.cache.set(id, text);
            return text;
        }
        finally {
            this.loadingAssets.delete(id);
        }
    }
    static waitForAsset(id) {
        return new Promise((resolve) => {
            const checkCache = () => {
                if (this.cache.has(id)) {
                    resolve(this.cache.get(id));
                }
                else {
                    setTimeout(checkCache, 10);
                }
            };
            checkCache();
        });
    }
    static getAsset(id) {
        return this.cache.get(id);
    }
    static clearCache() {
        this.cache.clear();
    }
    static isLoaded(id) {
        return this.cache.has(id);
    }
}
exports.AssetManager = AssetManager;
AssetManager.cache = new Map();
AssetManager.loadingAssets = new Set();
// Export individual loaders for direct use
var image_loader_2 = require("./image-loader");
Object.defineProperty(exports, "loadImage", { enumerable: true, get: function () { return image_loader_2.loadImage; } });
var text_loader_2 = require("./text-loader");
Object.defineProperty(exports, "loadTextWithFetch", { enumerable: true, get: function () { return text_loader_2.loadTextWithFetch; } });
Object.defineProperty(exports, "loadJSONWithFetch", { enumerable: true, get: function () { return text_loader_2.loadJSONWithFetch; } });
Object.defineProperty(exports, "loadBinaryTextWithFetch", { enumerable: true, get: function () { return text_loader_2.loadBinaryTextWithFetch; } });
// Export the default AssetManager
exports.default = AssetManager;
//# sourceMappingURL=index.js.map