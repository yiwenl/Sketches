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
export declare class AssetManager {
    private static cache;
    private static loadingAssets;
    static load(assets: AssetsList): Promise<LoadedAsset[]>;
    private static loadAsset;
    private static loadImage;
    private static loadText;
    private static loadJSON;
    private static loadBinaryText;
    private static waitForAsset;
    static getAsset(id: string): any;
    static clearCache(): void;
    static isLoaded(id: string): boolean;
}
export { loadImage } from "./image-loader";
export { loadTextWithFetch, loadJSONWithFetch, loadBinaryTextWithFetch, } from "./text-loader";
export default AssetManager;
//# sourceMappingURL=index.d.ts.map