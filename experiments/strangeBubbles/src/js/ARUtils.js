// ARUtils.js

const ARUtils = Object.create(null);

//	reference from : 
//	https://github.com/google-ar/three.ar.js/tree/master/src

ARUtils.isTango = display =>
  display && display.displayName.toLowerCase().includes('tango');
export const isTango = ARUtils.isTango;

ARUtils.isARKit = display =>
  display && display.displayName.toLowerCase().includes('arkit');
export const isARKit = ARUtils.isARKit;

ARUtils.isARDisplay = display => isARKit(display) || isTango(display);
export const isARDisplay = ARUtils.isARDisplay;


ARUtils.getARDisplay = () => new Promise((resolve, reject) => {
  if (!navigator.getVRDisplays) {
    resolve(null);
    return;
  }

  navigator.getVRDisplays().then(displays => {
    if (!displays && displays.length === 0) {
      resolve(null);
      return;
    }

    for (let display of displays) {
      if (isARDisplay(display)) {
        resolve(display);
        return;
      }
    }
    resolve(null);
  });
});
export const getARDisplay = ARUtils.getARDisplay;


export default ARUtils;