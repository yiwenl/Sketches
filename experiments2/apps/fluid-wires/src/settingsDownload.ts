export type SettingsConfig = Record<string, unknown>;

export function createSettingsJson(config: SettingsConfig): string {
  return JSON.stringify(config, null, 2);
}

export function createSettingsDownloadFilename(date = new Date()): string {
  const stamp = date
    .toISOString()
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "-")
    .replaceAll(":", "");

  return `fluid-wires-settings-${stamp}.json`;
}
