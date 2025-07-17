export const random = (min, max) => {
    if (min === undefined) {
        return Math.random();
    }
    if (max === undefined) {
        return Math.random() * min;
    }
    return Math.random() * (max - min + 1) + min;
};
export const randomGaussian = (a, b, l = 5) => {
    let r = 0;
    for (let i = 0; i < l; i++) {
        r += random();
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
export const randomInt = (a, b) => {
    return Math.floor(random(a, b));
};
export const pickWithWeights = (elms, weights) => {
    let total = 0;
    weights.forEach((w) => {
        total += w;
    });
    let r = random(total);
    let i = 0;
    while (r > 0) {
        r -= weights[i];
        i++;
    }
    return elms[i - 1];
};
export const pick = (elms, weights) => {
    if (weights === undefined) {
        return elms[randomInt(elms.length)];
    }
    return pickWithWeights(elms, weights);
};
export const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
export const mix = (a, b, p) => {
    return a * (1 - p) + b * p;
};
export const clamp = (v, min, max) => {
    return Math.max(min, Math.min(v, max));
};
export const lerp = (a, b, p) => {
    return a * (1 - p) + b * p;
};
export const smoothstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};
export const smootherstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * x * (x * (x * 6 - 15) + 10);
};
//# sourceMappingURL=index.js.map