"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTextWithImage = loadTextWithImage;
exports.loadTextWithXHR = loadTextWithXHR;
exports.loadTextWithFetch = loadTextWithFetch;
exports.loadJSONWithFetch = loadJSONWithFetch;
exports.loadBinaryTextWithFetch = loadBinaryTextWithFetch;
// Text loader using Image constructor (NOT recommended for text files)
function loadTextWithImage(url) {
    // This is just for demonstration - DON'T use this for text files!
    // Image constructor is only for image files
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve("This won't work for text files");
        img.onerror = () => reject(new Error("Image loading failed"));
        img.src = url;
    });
}
// Text loader using XMLHttpRequest
function loadTextWithXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "text";
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
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
// Text loader using Fetch (recommended)
function loadTextWithFetch(url) {
    return fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    });
}
// JSON loader using Fetch
function loadJSONWithFetch(url) {
    return fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}
// Binary text loader (for files like .obj, .mtl, etc.)
function loadBinaryTextWithFetch(url) {
    return fetch(url)
        .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.arrayBuffer();
    })
        .then((buffer) => {
        // Convert ArrayBuffer to string
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(buffer);
    });
}
//# sourceMappingURL=text-loader.js.map