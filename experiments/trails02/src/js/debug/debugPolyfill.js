// debugPolyfill.js

window.gui = {
  add: () => {
    return { onFinishChange: () => {} };
  },
  addFolder: () => {
    return { onFinishChange: () => {} };
  },
  addColor: () => {
    return { onFinishChange: () => {} };
  },
};
