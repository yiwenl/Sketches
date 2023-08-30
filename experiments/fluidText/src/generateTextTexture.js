import { GLTexture } from "alfrid";
import { createCanvas } from "./utils/setupProject2D";

const texts =
  "銀河北冥有魚其名為鯤鯤之大不知其幾千里也化而為鳥其名為鵬鵬之背不知其幾千里也怒而飛其翼若垂天之雲是鳥也海運則將徙於南冥南冥者天池也齊諧者志怪者也諧之言曰鵬之徙於南冥也水擊三千里摶扶搖而上者九萬里去以六月息者也野馬也塵埃也生物之以息相吹也天之蒼蒼其正色邪其遠而無所至極邪其視下也亦若是則已矣且夫水之積也不厚則負大舟也無力覆杯水於坳堂之上則芥為之舟置杯焉則膠水淺而舟大也風之積也不厚則其負大翼也無力故九萬里則風斯在下矣而後乃今培風背負青天而莫之夭閼者而後乃今將圖南蜩與學鳩笑之曰我決起而飛槍榆枋時則不至而控於地而已矣奚以之九萬里而南為適莽蒼者三而反腹猶果然適百里者宿舂糧適千里者三月聚糧之二蟲又何知小知不及大知小年不及大年奚以知其然也朝菌不知晦朔蟪蛄不知春秋此小年也楚之南有冥靈者以五百歲為春五百歲為秋上古有大椿者以八千歲為春八千歲為秋而彭祖乃今以久特聞眾人匹之不亦悲乎";

export default function generateTextTexture() {
  const size = 2048;

  const { canvas, ctx } = createCanvas(size, size);
  const num = 16;
  const fontSize = size / num;
  console.log("fontSize", fontSize);
  ctx.textBaseline = "top";
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${fontSize}px Noto Serif TC`;
  let count = 0;
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const x = i * fontSize;
      const y = j * fontSize;
      const char = texts.substring(count, count + 1);
      ctx.fillText(char, x, y);
      count++;
    }
  }
  return new GLTexture(canvas);
}
