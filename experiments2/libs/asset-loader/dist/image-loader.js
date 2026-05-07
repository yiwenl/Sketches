"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadImage = loadImage;
exports.loadImageWithXHR = loadImageWithXHR;
exports.loadImageWithFetch = loadImageWithFetch;
function loadImage(url) {
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
// Alternative: Using XMLHttpRequest
function loadImageWithXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(e);
                    img.src = URL.createObjectURL(xhr.response);
                }
                else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send();
    });
}
// Alternative: Using Fetch
function loadImageWithFetch(url) {
    return fetch(url)
        .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
        .then((blob) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = URL.createObjectURL(blob);
        });
    });
}
//# sourceMappingURL=image-loader.js.map