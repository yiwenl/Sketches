import { loadBinary } from "./loadBinary";
import { parseObj } from "../utils/parseObj";

const loadObj = (mUrl) =>
  new Promise((resolve, reject) => {
    loadBinary(mUrl, false).then(
      (o) => {
        resolve(parseObj(o));
      },
      (err) => {
        reject(err);
      }
    );
  });

export { loadObj };
