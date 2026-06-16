import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createParticleShadowRadius } from "./shadowBounds.js";

describe("createParticleShadowRadius", () => {
  it("uses the simulation overshoot radius for particles", () => {
    assert.equal(
      createParticleShadowRadius({
        maxRadius: 9,
        overshootMultiplier: 1.35,
        billboardPadding: 0.75,
      }),
      12.9
    );
  });
});
