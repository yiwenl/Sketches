// preload.js
import assets from "../asset-list";
import Assets from "../Assets";
import AssetsLoader from "assets-loader";

const loadAssets = (gl) =>
  new Promise((resolve, reject) => {
    const loader = document.body.querySelector(".Loading-Bar");
    console.log("Load Assets", assets);
    if (assets.length > 0) {
      document.body.classList.add("isLoading");

      new AssetsLoader({
        assets: assets,
      })
        .on("error", (error) => {
          console.log("Error :", error);
        })
        .on("progress", (p) => {
          if (loader) loader.style.width = `${p * 100}%`;
        })
        .on("complete", (o) => {
          if (loader) loader.style.width = `100%`;
          Assets.init(o);
          setTimeout(() => {
            document.body.classList.remove("isLoading");
            resolve(gl);
          }, 500);
        })
        .start();
    } else {
      resolve(gl);
    }
  });

export default loadAssets;
