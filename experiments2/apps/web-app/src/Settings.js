import Config from "./Config";
import { saveJson } from "@experiments2/utils";

export default class Settings {
  static init() {
    const params = new URLSearchParams(window.location.search);
    const configStr = params.get("config");
    if (configStr) {
      const config = JSON.parse(configStr);
      Object.assign(Config, config);
    }
    this.refresh();
  }

  static refresh() {
    window.history.pushState(
      "experiment",
      "Title",
      window.location.origin +
        window.location.pathname +
        "?config=" +
        JSON.stringify(Config)
    );
  }

  static reload() {
    window.location.href =
      window.location.origin +
      window.location.pathname +
      "?config=" +
      JSON.stringify(Config);
  }

  static reset() {
    window.location.href = window.location.origin + window.location.pathname;
  }

  static saveConfig() {
    saveJson(Config, "config");
  }
}
