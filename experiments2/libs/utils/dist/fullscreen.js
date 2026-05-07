"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFullscreenToggle = void 0;
const addFullscreenToggle = (id = "main-canvas") => {
    const canvas = document.getElementById(id);
    if (!canvas)
        return;
    function toggleFullScreen() {
        if (!!canvas) {
            if (!document.fullscreenElement) {
                canvas.requestFullscreen();
            }
            else {
                document.exitFullscreen();
            }
        }
    }
    document.addEventListener("keydown", function (event) {
        if (event.key === "f") {
            toggleFullScreen();
        }
    });
};
exports.addFullscreenToggle = addFullscreenToggle;
//# sourceMappingURL=fullscreen.js.map