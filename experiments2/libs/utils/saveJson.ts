export const saveJson = (obj: any, mName = "data", mPretty = true) => {
  var str = mPretty ? JSON.stringify(obj, null, 4) : JSON.stringify(obj);
  var data = encode(str);

  var blob = new Blob([data], {
    type: "application/octet-stream",
  });

  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${mName}.json`);
  var event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  link.dispatchEvent(event);
};

const encode = (s: string) => {
  var out = [];
  for (var i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i);
  }
  return new Uint8Array(out);
};
