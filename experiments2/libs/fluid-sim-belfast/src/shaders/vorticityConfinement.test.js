import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const shaderSource = readFileSync(
  fileURLToPath(new URL("./vorticityConfinement.ts", import.meta.url)),
  "utf8",
);

describe("vorticityConfinement shader", () => {
  it("uses grid-scaled curl derivatives for visible confinement strength", () => {
    assert.match(
      shaderSource,
      /let\s+curlScale\s*=\s*0\.5\s*\*\s*(?:params\.gridSize|gs)/,
    );
  });

  it("applies confinement force in cell-width units", () => {
    assert.match(
      shaderSource,
      /let\s+force\s*=\s*params\.curl\s*\*\s*cross\(N,\s*omega\)\s*\*\s*texelSize/,
    );
  });
});
