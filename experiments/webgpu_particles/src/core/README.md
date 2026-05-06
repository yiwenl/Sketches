# Core

WebGPU bootstrap, camera, input, and small GPU helpers used by this project. **Copy this entire folder** into another repo if you want to reuse the same foundation; documentation lives here so it travels with the code.

## Documentation

- [Renderer (WebGPU host)](./renderer.md) — `renderer.js`

## Coupling note

`renderer.js` imports layout settings from `../constants.js` (`Constants.pixelRatio`, `useTargetDimension`, `targetDimension`). When you reuse `core` elsewhere, either keep a compatible `constants` module on that path or change the import to your own config.
