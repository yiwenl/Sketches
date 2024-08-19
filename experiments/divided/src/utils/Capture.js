// Capture.js

const dataURLtoBlob = (dataurl) => {
  var arr = dataurl.split(",");
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const saveImage = (canvas, filename) => {
  var link = document.createElement("a");
  var imgData = canvas.toDataURL({
    format: "png",
    multiplier: 4,
  });
  // var strDataURI = imgData.substr(22, imgData.length);
  var blob = dataURLtoBlob(imgData);
  var objurl = URL.createObjectURL(blob);

  link.download = `${filename}.png`;

  link.href = objurl;

  link.click();
};

const getDateString = () => {
  const date = new Date();
  const strDate =
    `${date.getFullYear()}.` +
    `${date.getMonth() + 1}.` +
    `${date.getDate()}-` +
    `${date.getHours()}.` +
    `${date.getMinutes()}.` +
    `${date.getSeconds()}`;

  return strDate;
};

String.prototype.replaceAll = function replaceAll(search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

const capture = () => {
  window.addEventListener("keydown", (e) => {
    if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const strDate = getDateString();
      const canvas = document.querySelector("#main-canvas");
      saveImage(canvas, strDate);
    }
  });
};

export default capture();
