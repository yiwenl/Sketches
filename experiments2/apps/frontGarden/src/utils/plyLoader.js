/**
 * Utility for loading and parsing PLY files with progress tracking
 */

/**
 * Formats bytes into human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "2.5 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Loads a PLY file with progress tracking
 * @param {string} url - URL of the PLY file to load
 * @param {Object} options - Loading options
 * @param {Function} options.onProgress - Callback for progress updates (progress: number, loaded: number, total: number)
 * @param {Function} options.onComplete - Callback when file is loaded (data: string)
 * @param {Function} options.onError - Callback for errors (error: Error)
 * @returns {Promise<string>} Promise that resolves with the file data
 */
export function loadPLYFile(url, options = {}) {
  const { onProgress, onComplete, onError } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track download progress
    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (onProgress) {
          onProgress(percent, event.loaded, event.total);
        } else {
          // Default logging if no callback provided
          console.log(
            `Loading PLY file: ${percent}% (${formatBytes(
              event.loaded
            )} / ${formatBytes(event.total)})`
          );
        }
      } else {
        // If total size is unknown, just show loaded bytes
        if (onProgress) {
          onProgress(null, event.loaded, null);
        } else {
          console.log(`Loading PLY file: ${formatBytes(event.loaded)} loaded`);
        }
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        console.log("PLY file loaded successfully!");
        if (onComplete) {
          onComplete(xhr.responseText);
        }
        resolve(xhr.responseText);
      } else {
        const error = new Error(
          `Failed to load PLY file: ${xhr.status} ${xhr.statusText}`
        );
        console.error(error.message);
        if (onError) {
          onError(error);
        }
        reject(error);
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      const error = new Error("Error loading PLY file");
      console.error(error.message);
      if (onError) {
        onError(error);
      }
      reject(error);
    });

    // Start the request
    xhr.open("GET", url);
    xhr.send();
  });
}

/**
 * PLY Loader class for more object-oriented usage
 */
export class PLYLoader {
  constructor() {
    this.progress = 0;
    this.loaded = 0;
    this.total = 0;
  }

  /**
   * Load a PLY file
   * @param {string} url - URL of the PLY file to load
   * @returns {Promise<string>} Promise that resolves with the file data
   */
  async load(url) {
    return loadPLYFile(url, {
      onProgress: (percent, loaded, total) => {
        this.progress = percent;
        this.loaded = loaded;
        this.total = total;
      },
    });
  }

  /**
   * Get formatted progress string
   * @returns {string} Formatted progress string
   */
  getProgressString() {
    if (this.total) {
      return `${this.progress}% (${formatBytes(this.loaded)} / ${formatBytes(
        this.total
      )})`;
    }
    return `${formatBytes(this.loaded)} loaded`;
  }
}

/**
 * Parses a PLY file string and extracts vertex positions and colors (if available)
 * @param {string} plyData - The PLY file content as a string
 * @param {Object} options - Parsing options
 * @param {number} options.precision - Number of decimal places to keep (default: undefined, keeps all precision)
 * @param {boolean} options.normalizeColors - Normalize colors from 0-255 to 0-1 range (default: false)
 * @returns {Object} Object with positions array and optional colors array: { positions: [[x,y,z], ...], colors?: [[r,g,b], ...] }
 */
export function parsePLY(plyData, options = {}) {
  const { precision, normalizeColors = false } = options;

  // Split into lines and remove empty lines
  const lines = plyData
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Find header end
  let headerEndIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "end_header") {
      headerEndIndex = i;
      break;
    }
  }

  if (headerEndIndex === -1) {
    throw new Error("Invalid PLY file: 'end_header' not found");
  }

  // Parse header to get vertex count and property indices
  let vertexCount = 0;
  let xIndex = -1;
  let yIndex = -1;
  let zIndex = -1;
  let rIndex = -1;
  let gIndex = -1;
  let bIndex = -1;
  let propertyIndex = 0;

  for (let i = 0; i <= headerEndIndex; i++) {
    const line = lines[i];
    const parts = line.split(/\s+/);

    if (parts[0] === "element" && parts[1] === "vertex") {
      vertexCount = parseInt(parts[2], 10);
      if (isNaN(vertexCount)) {
        throw new Error(`Invalid vertex count: ${parts[2]}`);
      }
    }

    if (parts[0] === "property") {
      const propertyName = parts[2]?.toLowerCase();

      // Position properties
      if (propertyName === "x") {
        xIndex = propertyIndex;
      } else if (propertyName === "y") {
        yIndex = propertyIndex;
      } else if (propertyName === "z") {
        zIndex = propertyIndex;
      }
      // Color properties (support both "red/green/blue" and "r/g/b")
      else if (propertyName === "red" || propertyName === "r") {
        rIndex = propertyIndex;
      } else if (propertyName === "green" || propertyName === "g") {
        gIndex = propertyIndex;
      } else if (propertyName === "blue" || propertyName === "b") {
        bIndex = propertyIndex;
      }

      propertyIndex++;
    }
  }

  if (vertexCount === 0) {
    throw new Error("Invalid PLY file: vertex count not found");
  }

  if (xIndex === -1 || yIndex === -1 || zIndex === -1) {
    throw new Error(
      "Invalid PLY file: x, y, or z properties not found in header"
    );
  }

  // Check if colors are available
  const hasColors = rIndex !== -1 && gIndex !== -1 && bIndex !== -1;

  // Extract vertex data (lines after header)
  const positions = [];
  const colors = hasColors ? [] : undefined;
  const dataStartIndex = headerEndIndex + 1;

  // Helper function to round to precision
  const roundValue = (value) => {
    if (precision === undefined) {
      return value;
    }
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  };

  for (
    let i = dataStartIndex;
    i < lines.length && positions.length < vertexCount;
    i++
  ) {
    const line = lines[i];
    if (!line || line.length === 0) continue;

    const values = line.trim().split(/\s+/).map(parseFloat);

    // Validate that we have enough values
    const maxIndex = Math.max(
      xIndex,
      yIndex,
      zIndex,
      hasColors ? Math.max(rIndex, gIndex, bIndex) : -1
    );
    if (values.length < maxIndex + 1) {
      console.warn(`Skipping invalid line ${i + 1}: insufficient values`);
      continue;
    }

    const x = roundValue(values[xIndex]);
    const y = roundValue(values[yIndex]);
    const z = roundValue(values[zIndex]);

    // Check for NaN values in positions
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      console.warn(`Skipping line ${i + 1}: contains NaN values`);
      continue;
    }

    positions.push([x, y, z]);

    // Extract colors if available
    if (hasColors) {
      let r = values[rIndex];
      let g = values[gIndex];
      let b = values[bIndex];

      // Check for NaN values in colors
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        // Use default color if NaN
        r = g = b = normalizeColors ? 1.0 : 255;
      } else {
        // Normalize colors if requested
        if (normalizeColors) {
          r = r / 255.0;
          g = g / 255.0;
          b = b / 255.0;
        }
      }

      colors.push([r, g, b]);
    }
  }

  if (positions.length !== vertexCount) {
    console.warn(
      `Expected ${vertexCount} vertices, but parsed ${positions.length}`
    );
  }

  // Return object with positions and optional colors
  const result = { positions };
  if (hasColors) {
    result.colors = colors;
  }

  return result;
}
