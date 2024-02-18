import { loadBinary } from "./loadBinary";
import { parseHdr } from "../utils/parseHdr";

const loadHdr = (mUrl) =>
  new Promise((resolve, reject) => {
    loadBinary(mUrl, true).then(
      (o) => {
        resolve(parseHdr(o));
      },
      (err) => {
        reject(err);
      }
    );
  });

export { loadHdr };
