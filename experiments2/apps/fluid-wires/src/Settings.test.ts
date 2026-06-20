import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createSettingsDownloadFilename,
  createSettingsJson,
} from "./settingsDownload.js";

describe("Settings download helpers", () => {
  it("serializes config as stable pretty JSON", () => {
    assert.equal(
      createSettingsJson({ wireThicknessScale: 1.5, particleGridSize: 64 }),
      '{\n  "wireThicknessScale": 1.5,\n  "particleGridSize": 64\n}'
    );
  });

  it("creates a timestamped json filename", () => {
    assert.equal(
      createSettingsDownloadFilename(new Date("2026-06-18T20:15:30Z")),
      "fluid-wires-settings-2026-06-18-201530.json"
    );
  });
});
