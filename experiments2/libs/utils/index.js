"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smootherstep = exports.smoothstep = exports.lerp = exports.clamp = exports.mix = exports.shuffle = exports.pick = exports.pickWithWeights = exports.randomInt = exports.randomGaussian = exports.random = void 0;
const random = (min, max) => {
    if (min === undefined) {
        return Math.random();
    }
    if (max === undefined) {
        return Math.random() * min;
    }
    return Math.random() * (max - min + 1) + min;
};
exports.random = random;
const randomGaussian = (a, b, l = 5) => {
    let r = 0;
    for (let i = 0; i < l; i++) {
        r += (0, exports.random)();
    }
    r /= l;
    if (a === undefined) {
        return r;
    }
    if (b === undefined) {
        return r * a;
    }
    return a + (b - a) * r;
};
exports.randomGaussian = randomGaussian;
const randomInt = (a, b) => {
    return Math.floor((0, exports.random)(a, b));
};
exports.randomInt = randomInt;
const pickWithWeights = (elms, weights) => {
    let total = 0;
    weights.forEach((w) => {
        total += w;
    });
    let r = (0, exports.random)(total);
    let i = 0;
    while (r > 0) {
        r -= weights[i];
        i++;
    }
    return elms[i - 1];
};
exports.pickWithWeights = pickWithWeights;
const pick = (elms, weights) => {
    if (weights === undefined) {
        return elms[(0, exports.randomInt)(elms.length)];
    }
    return (0, exports.pickWithWeights)(elms, weights);
};
exports.pick = pick;
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor((0, exports.random)() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
exports.shuffle = shuffle;
const mix = (a, b, p) => {
    return a * (1 - p) + b * p;
};
exports.mix = mix;
const clamp = (v, min, max) => {
    return Math.max(min, Math.min(v, max));
};
exports.clamp = clamp;
const lerp = (a, b, p) => {
    return a * (1 - p) + b * p;
};
exports.lerp = lerp;
const smoothstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};
exports.smoothstep = smoothstep;
const smootherstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * x * (x * (x * 6 - 15) + 10);
};
exports.smootherstep = smootherstep;
//# sourceMappingURL=index.js.map