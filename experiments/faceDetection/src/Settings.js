// Settings.js

import Config from "./Config";
import parse from "url-parse";

let enabled = true;

const reload = () => {
  if (!enabled) {
    return;
  }
  window.location.href =
    window.location.origin +
    window.location.pathname +
    "?config=" +
    JSON.stringify(Config);
};

const refresh = () => {
  if (!enabled) {
    return;
  }
  window.history.pushState(
    "experiment",
    "Title",
    window.location.origin +
      window.location.pathname +
      "?config=" +
      JSON.stringify(Config)
  );
};

const reset = () => {
  window.location.href = window.location.origin + window.location.pathname;
};

let delayIndex = -1;

const delayReload = () => {
  if (!enabled) {
    return;
  }
  window.clearTimeout(delayIndex);

  delayIndex = window.setTimeout(() => {
    window.location.href =
      window.location.origin +
      window.location.pathname +
      "?config=" +
      JSON.stringify(Config);
  }, 500);
};

const init = (mEnabled = true) => {
  enabled = mEnabled;
  const parsed = parse(window.location.search, true);
  let parsedJson = {};
  if (parsed.query.config) {
    parsedJson = JSON.parse(parsed.query.config);
  }

  Object.assign(Config, parsedJson);
  refresh();
};

export default {
  enabled,
  reload,
  reset,
  refresh,
  delayReload,
  init,
};
