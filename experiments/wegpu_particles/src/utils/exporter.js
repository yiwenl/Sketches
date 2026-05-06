export class Exporter {
  static saveCanvas(canvas, fileName = 'screenshot.jpg') {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  }
}
