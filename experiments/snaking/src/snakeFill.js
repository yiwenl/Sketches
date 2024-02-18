import { pick } from "./utils";

export default function (numXBlocks, numYBlocks) {
  // console.log("numXBlocks, numYBlocks", numXBlocks, numYBlocks);
  const blocks = [];
  const trails = [];
  let trail = [];
  let head;

  const total = numXBlocks * numYBlocks;
  for (let i = 0; i < total; i++) {
    blocks.push(0);
  }

  const getPossibleStart = () => {
    const starts = [];
    blocks.forEach((v, i) => {
      if (v === 0) {
        starts.push(i);
      }
    });
    return starts;
  };

  const mark = (mIndex) => {
    blocks[mIndex] = 1;
  };

  const startTrail = () => {
    trail = [];
    const starts = getPossibleStart();

    if (starts.length === 0) {
      // console.log("all blockes are marked");
      // allDone();
      return;
    }

    // line marching
    head = pick(starts);
    trail.push(head);
    mark(head);
    march();
  };

  const isMarked = (i, j) => {
    // out of bound
    if (i < 0) return true;
    if (i >= numXBlocks) return true;
    if (j < 0) return true;
    if (j >= numYBlocks) return true;

    const index = i + j * numXBlocks;
    return blocks[index] === 1;
  };

  const getIndex = (i, j) => {
    return i + j * numXBlocks;
  };

  const getPos = (index) => {
    let x = index % numXBlocks;
    let y = Math.floor(index / numXBlocks);
    return { x, y };
  };

  const march = () => {
    // console.log("march");
    const { x, y } = getPos(head);
    // const prevHead = head;

    const possibleDir = [];
    if (!isMarked(x + 1, y)) possibleDir.push(getIndex(x + 1, y));
    if (!isMarked(x - 1, y)) possibleDir.push(getIndex(x - 1, y));
    if (!isMarked(x, y + 1)) possibleDir.push(getIndex(x, y + 1));
    if (!isMarked(x, y - 1)) possibleDir.push(getIndex(x, y - 1));

    if (possibleDir.length === 0) {
      // console.log("no possible direction, start new trail");

      trails.push(trail.concat());
      startTrail();
      return;
    } else {
      head = pick(possibleDir);
      trail.push(head);
      mark(head);
      march();
      // console.log(prevHead, "->", head, getPos(prevHead), getPos(head));
    }
  };

  // march();
  startTrail();

  return {
    trails,
    blocks,
  };
}
