// saveJson.js

const saveJson = (obj, mName = "data", mPretty = true) => {
  var str = mPretty ? JSON.stringify(obj, null, 4) : JSON.stringify(obj);
  var data = encode(str);

  var blob = new Blob([data], {
    type: "application/octet-stream",
  });

  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${mName}.json`);
  var event = document.createEvent("MouseEvents");
  event.initMouseEvent(
    "click",
    true,
    true,
    window,
    1,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  link.dispatchEvent(event);
};

const encode = (s) => {
  var out = [];
  for (var i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i);
  }
  return new Uint8Array(out);
};

export { saveJson };
