const textOrg = `北冥有魚，其名為鯤。鯤之大，不知其幾千里也。化而為鳥，其名為鵬。鵬之背，不知其幾千里也；怒而飛，其翼若垂天之雲。是鳥也，海運則將徙於南冥。南冥者，天池也。齊諧者，志怪者也。諧之言曰：「鵬之徙於南冥也，水擊三千里，摶扶搖而上者九萬里，去以六月息者也。」野馬也，塵埃也，生物之以息相吹也。天之蒼蒼，其正色邪？其遠而無所至極邪？其視下也亦若是，則已矣。且夫水之積也不厚，則負大舟也無力。覆杯水於坳堂之上，則芥為之舟，置杯焉則膠，水淺而舟大也。風之積也不厚，則其負大翼也無力。故九萬里則風斯在下矣，而後乃今培風；背負青天而莫之夭閼者，而後乃今將圖南。蜩與學鳩笑之曰：「我決起而飛，槍榆、枋，時則不至而控於地而已矣，奚以之九萬里而南為？」適莽蒼者三而反，腹猶果然；適百里者宿舂糧；適千里者三月聚糧。之二蟲又何知！小知不及大知，小年不及大年。奚以知其然也？朝菌不知晦朔，蟪蛄不知春秋，此小年也。楚之南有冥靈者，以五百歲為春，五百歲為秋；上古有大椿者，以八千歲為春，八千歲為秋。而彭祖乃今以久特聞，眾人匹之，不亦悲乎！`;
import { shuffle } from "./utils";

export const getText = () => {
  const allChars = [];
  for (let i = 0; i < textOrg.length; i++) {
    const char = textOrg[i];
    const charCode = textOrg.charCodeAt(i);
    if (charCode > 13000 && charCode < 50000) {
      // console.log(char, textOrg.charCodeAt(i));
      if (allChars.indexOf(char) === -1) {
        allChars.push(char);
      }
    }
  }

  return shuffle(allChars);
};
