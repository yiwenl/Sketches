import { loadBinary } from "./loadBinary";
import { parseDds } from "../utils/parseDds";

const loadDds = (mUrl) =>
  new Promise((resolve, reject) => {
    loadBinary(mUrl, true).then(
      (o) => {
        resolve(parseDds(o));
      },
      (err) => {
        reject(err);
      }
    );
  });

export { loadDds };
