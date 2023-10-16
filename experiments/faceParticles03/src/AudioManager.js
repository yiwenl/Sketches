import sono from "./sono/sono.min.js";
// console.log(sono);

const sound0 = sono.create("music.mp3");
const sound = sono.create({
  id: "music",
  url: ["music.mp3"],
  loop: true,
});

sound.play();
