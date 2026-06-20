import Config from "./Config";

const CONFIG_QUERY_KEY = "config";

export default class Settings {
  static init(): void {
    const params = new URLSearchParams(window.location.search);
    const configStr = params.get(CONFIG_QUERY_KEY);

    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        if (config && typeof config === "object") {
          for (const key of Object.keys(Config) as Array<keyof typeof Config>) {
            if (key in config) {
              Object.assign(Config, { [key]: config[key] });
            }
          }
        }
      } catch (error) {
        console.warn("Failed to parse URL config", error);
      }
    }

    this.refresh();
  }

  static refresh(): void {
    const params = new URLSearchParams(window.location.search);
    params.set(CONFIG_QUERY_KEY, JSON.stringify(Config));

    window.history.replaceState(
      "experiment",
      document.title,
      `${window.location.pathname}?${params.toString()}${window.location.hash}`
    );
  }

  static reload() {
    window.location.href =
      window.location.origin +
      window.location.pathname +
      "?config=" +
      JSON.stringify(Config);
  }

  static reset(): void {
    window.location.href = window.location.pathname;
  }
}
