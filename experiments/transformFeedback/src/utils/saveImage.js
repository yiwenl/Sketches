// saveImage.js
// import Config from "../Config";
// const MIME_TYPE = "image/png";

const saveImage = (canvas, filename, exportType = "png", quality = 0.95) => {
  const MIME_TYPE = exportType === "jpg" ? "image/jpeg" : "image/png";

  canvas.toBlob(
    (blob) => {
      var link = document.createElement("a");
      var objurl = URL.createObjectURL(blob);
      const fileExtension = MIME_TYPE === "image/jpeg" ? "jpg" : "png";

      link.download = `${filename}.${fileExtension}`;
      link.href = objurl;

      // Trigger the download
      link.click();

      // Release the object URL to free memory
      URL.revokeObjectURL(objurl);
    },
    MIME_TYPE,
    quality
  ); // Adjust quality parameter if needed
};

export { saveImage };
