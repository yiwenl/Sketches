const dataURLtoBlob = (dataurl: string) => {
  var arr = dataurl.split(",");
  var mime = arr[0].match(/:(.*?);/)?.[1];
  if (!mime) return;
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const saveImage = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement("a");
  const imgData = canvas.toDataURL("image/png", 1);
  const blob = dataURLtoBlob(imgData);
  if (!blob) return;
  const objurl = URL.createObjectURL(blob);

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

const isMac = () => {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

export const addCapture = (id: string = "main-canvas") => {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  if (!canvas) return;

  window.addEventListener("keydown", (e) => {
    if (e.key === "s" && (isMac() ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      const strDate = getDateString();
      saveImage(canvas, strDate);
    }
  });
};
