/** SH degree-0 constant: 1 / (2 * sqrt(pi)) */
const SH_C0 = 0.28209479177387814;

const TYPE_SIZE = {
  double: 8,
  int: 4,
  uint: 4,
  float: 4,
  short: 2,
  ushort: 2,
  uchar: 1,
};

/**
 * @typedef {Object} GaussianSplatData
 * @property {number} count
 * @property {Float32Array} positions - xyz, length count * 3
 * @property {Float32Array} scales - exp(log-scale), length count * 3
 * @property {Float32Array} rotations - quaternion [w, x, y, z], length count * 4
 * @property {Float32Array} colors - rgb in 0–1 from SH f_dc, length count * 3
 * @property {Float32Array} opacity - sigmoid(opacity), length count
 * @property {Float32Array|null} shRest - f_rest coefficients, length count * 45
 */

/**
 * Fetch a binary PLY file as ArrayBuffer with optional progress.
 * @param {string} url
 * @param {(loaded: number, total: number|null) => void} [onProgress]
 * @returns {Promise<ArrayBuffer>}
 */
export function fetchPlyBuffer(url, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";

    xhr.addEventListener("progress", (event) => {
      onProgress?.(event.loaded, event.lengthComputable ? event.total : null);
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
        return;
      }
      reject(new Error(`Failed to load PLY: ${xhr.status} ${xhr.statusText}`));
    });

    xhr.addEventListener("error", () => {
      reject(new Error(`Failed to load PLY: ${url}`));
    });

    xhr.open("GET", url);
    xhr.send();
  });
}

/**
 * Parse a 3D Gaussian Splatting binary PLY buffer (INRIA / standard format).
 * Supports scale_*, f_dc_*, opacity, rot_*, and optional f_rest_* SH coefficients.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {GaussianSplatData}
 */
export function parseGaussianPly(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const headerText = new TextDecoder().decode(bytes.slice(0, 16_384));
  const headerEndToken = "end_header\n";
  const headerEndIndex = headerText.indexOf(headerEndToken);

  if (headerEndIndex < 0) {
    throw new Error("Invalid PLY: end_header not found");
  }

  const headerLines = headerText.slice(0, headerEndIndex).split("\n");
  let vertexCount = 0;
  const properties = [];
  let rowOffset = 0;

  for (const line of headerLines) {
    const parts = line.trim().split(/\s+/);

    if (parts[0] === "element" && parts[1] === "vertex") {
      vertexCount = parseInt(parts[2], 10);
    }

    if (parts[0] === "property") {
      const type = parts[1];
      const name = parts[2];
      const size = TYPE_SIZE[type];

      if (!size) {
        throw new Error(`Unsupported PLY property type: ${type}`);
      }

      properties.push({ name, type, offset: rowOffset });
      rowOffset += size;
    }
  }

  if (!vertexCount) {
    throw new Error("Invalid PLY: vertex count not found");
  }

  const dataOffset = headerEndIndex + headerEndToken.length;
  const dataView = new DataView(arrayBuffer, dataOffset);

  const positions = new Float32Array(vertexCount * 3);
  const scales = new Float32Array(vertexCount * 3);
  const rotations = new Float32Array(vertexCount * 4);
  const colors = new Float32Array(vertexCount * 3);
  const opacity = new Float32Array(vertexCount);

  const shRestNames = properties
    .map((p) => p.name)
    .filter((name) => name.startsWith("f_rest_"));
  const shRest = shRestNames.length
    ? new Float32Array(vertexCount * shRestNames.length)
    : null;

  const readValue = (property, index) => {
    const byteOffset = property.offset + index * rowOffset;

    switch (property.type) {
      case "float":
        return dataView.getFloat32(byteOffset, true);
      case "double":
        return dataView.getFloat64(byteOffset, true);
      case "int":
        return dataView.getInt32(byteOffset, true);
      case "uint":
        return dataView.getUint32(byteOffset, true);
      case "short":
        return dataView.getInt16(byteOffset, true);
      case "ushort":
        return dataView.getUint16(byteOffset, true);
      case "uchar":
        return dataView.getUint8(byteOffset);
      default:
        throw new Error(`Unsupported PLY property type: ${property.type}`);
    }
  };

  for (let i = 0; i < vertexCount; i++) {
    let r0 = 1;
    let r1 = 0;
    let r2 = 0;
    let r3 = 0;
    const pi = i * 3;
    const ri = i * 4;

    for (const property of properties) {
      const value = readValue(property, i);

      switch (property.name) {
        case "x":
          positions[pi] = value;
          break;
        case "y":
          positions[pi + 1] = value;
          break;
        case "z":
          positions[pi + 2] = value;
          break;
        case "scale_0":
        case "scaling_0":
          scales[pi] = Math.exp(value);
          break;
        case "scale_1":
        case "scaling_1":
          scales[pi + 1] = Math.exp(value);
          break;
        case "scale_2":
        case "scaling_2":
          scales[pi + 2] = Math.exp(value);
          break;
        case "f_dc_0":
        case "features_0":
          colors[pi] = 0.5 + SH_C0 * value;
          break;
        case "f_dc_1":
        case "features_1":
          colors[pi + 1] = 0.5 + SH_C0 * value;
          break;
        case "f_dc_2":
        case "features_2":
          colors[pi + 2] = 0.5 + SH_C0 * value;
          break;
        case "opacity":
        case "opacity_0":
          opacity[i] = 1 / (1 + Math.exp(-value));
          break;
        case "rot_0":
        case "rotation_0":
          r0 = value;
          break;
        case "rot_1":
        case "rotation_1":
          r1 = value;
          break;
        case "rot_2":
        case "rotation_2":
          r2 = value;
          break;
        case "rot_3":
        case "rotation_3":
          r3 = value;
          break;
        default: {
          if (property.name.startsWith("f_rest_") && shRest) {
            const restIndex = parseInt(property.name.slice(7), 10);
            shRest[i * shRestNames.length + restIndex] = value;
          }
          break;
        }
      }
    }

    const len = Math.hypot(r0, r1, r2, r3) || 1;
    rotations[ri] = r0 / len;
    rotations[ri + 1] = r1 / len;
    rotations[ri + 2] = r2 / len;
    rotations[ri + 3] = r3 / len;
  }

  return {
    count: vertexCount,
    positions,
    scales,
    rotations,
    colors,
    opacity,
    shRest,
  };
}

/**
 * Load and parse a Gaussian splat PLY file.
 * @param {string} url
 * @param {(loaded: number, total: number|null) => void} [onProgress]
 * @returns {Promise<GaussianSplatData>}
 */
export async function loadGaussianPly(url, onProgress) {
  const buffer = await fetchPlyBuffer(url, onProgress);
  return parseGaussianPly(buffer);
}
