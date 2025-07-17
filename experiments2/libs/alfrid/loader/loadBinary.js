const loadBinary = (mUrl, mIsArrayBuffer = false) =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", (o) => {
      resolve(req.response);
    });
    if (mIsArrayBuffer) {
      req.responseType = "arraybuffer";
    }

    req.open("GET", mUrl);
    req.send();
  });

export { loadBinary };
