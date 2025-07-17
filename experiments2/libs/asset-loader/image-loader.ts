export function loadImage(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function (e) {
      console.error(e);
      reject(e);
    };
    img.src = url;
  });
}
