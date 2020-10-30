// Capture.js

import { GL } from "alfrid";
import { saveImage } from "./";

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

const capture = () => {
  window.addEventListener("keydown", (e) => {
    let toCapture = false;
    if (window.navigator.userAgent.indexOf("Macintosh") > -1) {
      toCapture = e.keyCode === 83 && e.metaKey;
    } else {
      toCapture = e.keyCode === 83 && e.ctrlKey;
    }

    if (toCapture) {
      e.preventDefault();
      const date = new Date();
      let strDate =
        `${date.getFullYear()}.` +
        `${date.getMonth() + 1}.` +
        `${date.getDate()}-` +
        `${date.getHours()}.` +
        `${date.getMinutes()}.` +
        `${date.getSeconds()}`;

      saveImage(GL.canvas, strDate);
    }
  });
};

export default capture();
