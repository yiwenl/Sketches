// index.js
import * as posenet from '@tensorflow-models/posenet';
export { saveImage } from './saveImage'
export { hitTest } from './hitTest'

const color = 'aqua';
const boundingBoxColor = 'red';
const lineWidth = 2;

function toTuple({y, x}) {
	return [y, x];
}


export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}



/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}



/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
	const adjacentKeyPoints =posenet.getAdjacentKeyPoints(keypoints, minConfidence);

	adjacentKeyPoints.forEach((keypoints) => {
		drawSegment(
			toTuple(keypoints[0].position), toTuple(keypoints[1].position), 
			color,
        	scale, 
        	ctx
        );
	});
}

export function checkBounds(point) {
  let outOfBound = false;
  const videoWidth = 640;
  const videoHeight = 480;

  const { x, y } = point;

  if(x < 0) outOfBound = true;
  else if(x > videoWidth) outOfBound = true;

  if(y < 0) outOfBound = true;
  else if(y > videoHeight) outOfBound = true;

  return outOfBound;
}

