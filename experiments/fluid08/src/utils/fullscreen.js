// fullscreen
let canvas;

// Function to toggle fullscreen mode
function toggleFullScreen() {
  if (!!canvas) {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

export default function () {
  canvas = document.querySelector("#main-canvas");
  // Add event listener for keydown event on the whole document
  document.addEventListener("keydown", function (event) {
    if (event.key === "f") {
      toggleFullScreen();
    }
  });
}
