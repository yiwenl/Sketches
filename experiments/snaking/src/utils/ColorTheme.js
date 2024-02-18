// ColorThemes.js

import { randomInt, shuffle } from "./";
import COLOR_THEMES from "./colors.json";
import hexRgb from "hex-rgb";

export const getColorTheme = () => {
  const index = randomInt(COLOR_THEMES.length);
  const colorTheme = shuffle(COLOR_THEMES[index]);
  const colors = colorTheme.map((c) => {
    const { red, green, blue } = hexRgb(c);
    return [red, green, blue];
  });

  return colors;
};
