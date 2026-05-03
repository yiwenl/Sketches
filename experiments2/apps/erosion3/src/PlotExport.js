import { vec3 } from "gl-matrix";
import { worldToScreen } from "./utils";
import Config from "./Config";

const CIRCLE_RADIUS = 2.5;

// Create a key for point lookup (rounded to avoid floating point issues)
// Optimized: use integer-based key for faster Map lookups
function pointKey(p, tolerance = 0.1) {
  if (!p) return null;
  // Round to nearest tolerance unit and convert to integers for faster comparison
  const x = Math.round(p[0] / tolerance);
  const y = Math.round(p[1] / tolerance);
  // Use bit manipulation for fast integer key (handles negative numbers correctly)
  // Shift x by 16 bits and combine with y (both as 32-bit signed integers)
  return ((x & 0xffff) << 16) | (y & 0xffff);
}

// Connect line segments that share endpoints into continuous paths (async, incremental)
async function connectSegments(segments, onProgress) {
  if (segments.length === 0) return [];

  const TOLERANCE = 0.1;
  const connectedPaths = [];
  const used = new Set();

  // Build index: map endpoint keys to segments that have that endpoint
  // Optimized: use Map with direct array assignment
  const endpointIndex = new Map(); // key -> [{ segmentIndex, isP1 }]

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const key1 = pointKey(seg.p1, TOLERANCE);
    const key2 = pointKey(seg.p2, TOLERANCE);

    if (key1 !== null) {
      let arr = endpointIndex.get(key1);
      if (!arr) {
        arr = [];
        endpointIndex.set(key1, arr);
      }
      arr.push({ segmentIndex: i, isP1: true });
    }

    if (key2 !== null) {
      let arr = endpointIndex.get(key2);
      if (!arr) {
        arr = [];
        endpointIndex.set(key2, arr);
      }
      arr.push({ segmentIndex: i, isP1: false });
    }
  }

  // Helper to yield control back to the browser
  const yieldToBrowser = () => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
  };

  let processedCount = 0;
  const YIELD_INTERVAL = 100; // Yield every N segments processed

  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;

    // Update progress
    if (onProgress && processedCount % YIELD_INTERVAL === 0) {
      const percent = Math.min(
        100,
        Math.round(((i + 1) / segments.length) * 100)
      );
      onProgress(i + 1, segments.length);
      await yieldToBrowser();
    }
    processedCount++;

    // Start a new path with this segment
    const path = [segments[i]];
    used.add(i);
    let currentEnd = segments[i].p2;
    let foundConnection = true;

    // Try to extend the path forward
    while (foundConnection) {
      foundConnection = false;
      const endKey = pointKey(currentEnd, TOLERANCE);

      if (endKey && endpointIndex.has(endKey)) {
        const candidates = endpointIndex.get(endKey);

        for (const candidate of candidates) {
          const j = candidate.segmentIndex;
          if (used.has(j)) continue;

          const seg = segments[j];

          // Optimized: Since we found via index key, points should match
          // Only verify if candidate flag matches (skip redundant pointsEqual for exact matches)
          if (candidate.isP1) {
            // Segment starts at this endpoint
            path.push(seg);
            used.add(j);
            currentEnd = seg.p2;
            foundConnection = true;
            break;
          } else {
            // Segment ends at this endpoint, reverse it
            path.push({ p1: seg.p2, p2: seg.p1 });
            used.add(j);
            currentEnd = seg.p1;
            foundConnection = true;
            break;
          }
        }
      }
    }

    // Try to extend the path backward
    let currentStart = segments[i].p1;
    foundConnection = true;
    while (foundConnection) {
      foundConnection = false;
      const startKey = pointKey(currentStart, TOLERANCE);

      if (startKey && endpointIndex.has(startKey)) {
        const candidates = endpointIndex.get(startKey);

        for (const candidate of candidates) {
          const j = candidate.segmentIndex;
          if (used.has(j)) continue;

          const seg = segments[j];

          // Optimized: Since we found via index key, points should match
          // Only verify if candidate flag matches (skip redundant pointsEqual for exact matches)
          if (!candidate.isP1) {
            // Segment ends at this endpoint
            path.unshift(seg);
            used.add(j);
            currentStart = seg.p1;
            foundConnection = true;
            break;
          } else {
            // Segment starts at this endpoint, reverse it
            path.unshift({ p1: seg.p2, p2: seg.p1 });
            used.add(j);
            currentStart = seg.p2;
            foundConnection = true;
            break;
          }
        }
      }
    }

    connectedPaths.push(path);
  }

  // Final progress update
  if (onProgress) {
    onProgress(segments.length, segments.length);
  }

  return connectedPaths;
}

// Check if a point is within bounds
function pointInBounds(p, minX, minY, maxX, maxY) {
  return p[0] >= minX && p[0] <= maxX && p[1] >= minY && p[1] <= maxY;
}

// Check if a line segment intersects or is within the bounds
function segmentInBounds(p1, p2, minX, minY, maxX, maxY) {
  // If both points are inside, segment is inside
  if (
    pointInBounds(p1, minX, minY, maxX, maxY) &&
    pointInBounds(p2, minX, minY, maxX, maxY)
  ) {
    return true;
  }

  // If both points are outside on the same side, segment is outside
  if (
    (p1[0] < minX && p2[0] < minX) ||
    (p1[0] > maxX && p2[0] > maxX) ||
    (p1[1] < minY && p2[1] < minY) ||
    (p1[1] > maxY && p2[1] > maxY)
  ) {
    return false;
  }

  // Check if segment intersects the bounding rectangle using Liang-Barsky algorithm
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];

  let t0 = 0;
  let t1 = 1;

  // Check each edge
  const p = [-dx, dx, -dy, dy];
  const q = [p1[0] - minX, maxX - p1[0], p1[1] - minY, maxY - p1[1]];

  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-10) {
      // Line is parallel to this edge
      if (q[i] < 0) return false; // Outside
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }

  // If t0 < t1, the segment intersects the bounds
  return t0 < t1;
}

// Filter paths to only include segments within the mask bounds
function filterPathsByBounds(paths, mWidth, mHeight) {
  const minX = 0;
  const minY = 0;
  const maxX = mWidth;
  const maxY = mHeight;

  if (Array.isArray(paths) && paths.length > 0 && Array.isArray(paths[0])) {
    // Connected paths (array of path arrays)
    return paths
      .map((path) => {
        return path
          .filter((segment) => {
            return segmentInBounds(
              segment.p1,
              segment.p2,
              minX,
              minY,
              maxX,
              maxY
            );
          })
          .filter((segment) => segment.p1 && segment.p2); // Remove empty segments
      })
      .filter((path) => path.length > 0); // Remove empty paths
  } else {
    // Individual segments
    return paths.filter((segment) => {
      return segmentInBounds(segment.p1, segment.p2, minX, minY, maxX, maxY);
    });
  }
}

function exportToSVG(
  mLines,
  mWidth,
  mHeight,
  mTargetSize,
  connectedPaths,
  circleInterval = 10
) {
  const round = (v) => Math.round(v);
  mLines.forEach((line) => {
    line.p1 = line.p1.map(round);
    line.p2 = line.p2.map(round);
  });

  // Calculate scale and offset to fit and center content
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let viewBoxWidth = mWidth;
  let viewBoxHeight = mHeight;

  if (mTargetSize) {
    // Calculate scale to maintain aspect ratio
    const scaleX = mTargetSize.width / mWidth;
    const scaleY = mTargetSize.height / mHeight;
    scale = Math.min(scaleX, scaleY);

    // Calculate scaled dimensions
    const scaledWidth = mWidth * scale;
    const scaledHeight = mHeight * scale;

    // Calculate offset to center
    offsetX = (mTargetSize.width - scaledWidth) / 2;
    offsetY = (mTargetSize.height - scaledHeight) / 2;

    // Update viewBox to match target size
    viewBoxWidth = mTargetSize.width;
    viewBoxHeight = mTargetSize.height;
  }

  // Create SVG element
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${mTargetSize ? mTargetSize.width : mWidth}mm" height="${mTargetSize ? mTargetSize.height : mHeight}mm" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">\n`;

  // Add mask definition to preserve mWidth/mHeight ratio
  svg += `  <defs>\n`;
  svg += `    <mask id="contentMask">\n`;
  if (mTargetSize) {
    // Mask rectangle matches the scaled and centered content area (in viewBox coordinates)
    svg += `      <rect x="${offsetX}" y="${offsetY}" width="${mWidth * scale}" height="${mHeight * scale}" fill="white"/>\n`;
  } else {
    // Mask rectangle matches the full viewBox when no target size
    svg += `      <rect x="0" y="0" width="${mWidth}" height="${mHeight}" fill="white"/>\n`;
  }
  svg += `    </mask>\n`;
  svg += `  </defs>\n`;

  // Wrap everything in a masked group (mask in viewBox coordinates)
  svg += `  <g mask="url(#contentMask)">\n`;

  // Filter paths to only include segments within the mask bounds (for plotter compatibility)
  let filteredPaths = null;
  let filteredLines = mLines;

  if (connectedPaths && connectedPaths.length > 0) {
    filteredPaths = filterPathsByBounds(connectedPaths, mWidth, mHeight);
  } else {
    filteredLines = filterPathsByBounds(mLines, mWidth, mHeight);
  }

  // Generate SVG paths for connected segments, or fallback to individual segments
  // Insert circles immediately after every n paths for pen plotting sequence
  let pathCount = 0;
  const circleY = viewBoxHeight - CIRCLE_RADIUS - 10;
  const circleX = viewBoxWidth / 2;

  // Add transform group to scale and center
  svg += `    <g stroke="black" stroke-width="${4 * (mTargetSize ? scale : 1)}" fill="none" transform="translate(${offsetX}, ${offsetY}) scale(${scale})">\n`;

  if (filteredPaths && filteredPaths.length > 0) {
    for (const path of filteredPaths) {
      if (path.length === 0) continue;

      // Build path data string using array for better performance
      const pathParts = [`M ${path[0].p1[0]} ${path[0].p1[1]}`];
      for (const segment of path) {
        pathParts.push(`L ${segment.p2[0]} ${segment.p2[1]}`);
      }
      svg += `    <path d="${pathParts.join(" ")}"/>\n`;

      // Track path count for circles - insert circle immediately after path for pen plotting
      pathCount++;
      if (pathCount % circleInterval === 0) {
        console.log("insert circle");
        // Close transform group, add circle (outside transform), reopen transform group
        svg += `    </g>\n`;
        svg += `    <circle cx="${circleX}" cy="${circleY}" r="${CIRCLE_RADIUS}" fill="none" stroke="black"/>\n`;
        svg += `    <g stroke="black" stroke-width="${4 * (mTargetSize ? scale : 1)}" fill="none" transform="translate(${offsetX}, ${offsetY}) scale(${scale})">\n`;
      }
    }
  } else {
    console.log("filteredLines", filteredLines);
    // Fallback: use individual segments
    for (const { p1, p2 } of filteredLines) {
      if (p1 && p2) {
        svg += `    <path d="M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}"/>\n`;

        // Track path count for circles - insert circle immediately after path for pen plotting
        pathCount++;
        if (pathCount % circleInterval === 0) {
          // Close transform group, add circle (outside transform), reopen transform group
          svg += `    </g>\n`;
          svg += `    <circle cx="${circleX}" cy="${circleY}" r="${CIRCLE_RADIUS}" fill="none" stroke="black"/>\n`;
          svg += `    <g stroke="black" stroke-width="${4 * (mTargetSize ? scale : 1)}" fill="none" transform="translate(${offsetX}, ${offsetY}) scale(${scale})">\n`;
        }
      }
    }
  }

  svg += `    </g>\n`;
  svg += `  </g>\n`;
  svg += `</svg>`;

  // Create a blob and download
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mountain-lines-${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function plotExport(
  mLines,
  mCamera,
  mWidth,
  mHeight,
  mTargetSize,
  mLight,
  circleInterval = 10
) {
  console.log("Export to plotter", mCamera.position, mTargetSize);

  // Calculate scale and offset for canvas preview
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  const ratio = 10;

  if (mTargetSize) {
    // Calculate scale to maintain aspect ratio
    const scaleX = mTargetSize.width / mWidth;
    const scaleY = mTargetSize.height / mHeight;
    scale = Math.min(scaleX, scaleY);

    // Calculate scaled dimensions
    const scaledWidth = mWidth * scale;
    const scaledHeight = mHeight * scale;

    // Calculate offset to center
    offsetX = (mTargetSize.width - scaledWidth) / 2;
    offsetY = (mTargetSize.height - scaledHeight) / 2;
  }

  // create a new canvas
  const canvas = document.createElement("canvas");
  canvas.width = mWidth;
  canvas.height = mHeight;
  const ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);
  canvas.style.cssText = `
    position: fixed; 
    top: 0; 
    left: 0; 
    height: 100%;
    z-index: 9999;
    `;

  ctx.fillStyle = "rgba(255, 255, 255, .05)";
  ctx.fillRect(0, 0, mWidth, mHeight);
  ctx.lineWidth = 3;

  // draw functions
  const dot = (pos, r, c = "white") => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], r, 0, 2 * Math.PI);
    ctx.fill();
  };

  const lineTo = (p1, p2, c = "white") => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  };

  const dirCam = vec3.normalize([0, 0, 0], mCamera.position);

  // Optimized: reuse arrays to reduce allocations
  const avgNormal = [0, 0, 0];
  const minSegmentLength = 0.1;
  const exportLines = [];

  const checkVertexVisible = (pointData) => {
    const { shade, index } = pointData;
    const numLevels = 8;
    let _index = (index % numLevels) / numLevels + 0.5 / numLevels;
    return _index < shade;
  };

  for (const line of mLines) {
    for (let i = 0; i < line.length - 1; i++) {
      const { point, normal, debug, depth } = line[i];
      const next = line[i + 1];
      if (!next) continue;

      const pointNext = next.point;
      const normalNext = next.normal;

      let dist = vec3.distance(point, pointNext);
      if (dist >= minSegmentLength) {
        continue;
      }

      // Reuse array instead of creating new one
      vec3.add(avgNormal, normal, normalNext);
      vec3.normalize(avgNormal, avgNormal);

      let d = vec3.dot(dirCam, avgNormal);
      let l = vec3.normalize([0, 0, 0], mLight);
      let ndotl = vec3.dot(avgNormal, l);
      ndotl = Math.max(0.0, ndotl);

      if (d > Config.linesThreshold) {
        const p1 = worldToScreen(point, mCamera, mWidth, mHeight);
        const p2 = worldToScreen(pointNext, mCamera, mWidth, mHeight);
        d = Math.pow(d, 2.0);
        let visibleP1 = checkVertexVisible(line[i]);
        let visibleP2 = checkVertexVisible(next);
        if (p1 && p2 && visibleP1 && visibleP2) {
          let c = Math.floor(d * 255);
          c = Math.floor(ndotl * 255);

          let debugColor = `rgb(${debug[0] * 255}, ${debug[1] * 255}, ${debug[2] * 255})`;
          // let _depth = Math.floor(depth * 255);
          // debugColor = `rgb(${_depth}, ${_depth}, ${_depth})`;
          c = debugColor;
          c = "white";
          lineTo(p1, p2, c);
          exportLines.push({
            p1,
            p2,
          });
        }
      }
    }
  }

  // Show progress indicator
  const progressDiv = document.createElement("div");
  progressDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 8px;
    z-index: 10000;
    font-family: monospace;
  `;
  progressDiv.textContent = "Connecting segments... 0%";
  document.body.appendChild(progressDiv);

  // Connect segments and draw optimized paths (async)
  connectSegments(exportLines, (processed, total) => {
    const percent = Math.round((processed / total) * 100);
    progressDiv.textContent = `Connecting segments... ${percent}%`;
  })
    .then((connectedPaths) => {
      // Remove progress indicator
      document.body.removeChild(progressDiv);

      // Export to SVG with connected paths
      exportToSVG(
        exportLines,
        mWidth,
        mHeight,
        mTargetSize,
        connectedPaths,
        circleInterval
      );
    })
    .catch((error) => {
      console.error("Error connecting segments:", error);
      document.body.removeChild(progressDiv);
      // Fallback: export without optimization
      exportToSVG(
        exportLines,
        mWidth,
        mHeight,
        mTargetSize,
        [],
        circleInterval
      );
    });
}
