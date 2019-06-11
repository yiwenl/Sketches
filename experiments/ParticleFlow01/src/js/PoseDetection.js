// PoseDetection.js

import EventDispatcher from 'events';
import * as posenet from '@tensorflow-models/posenet';
import { drawKeypoints, drawSkeleton, drawPoint } from './utils';
import Config from './Config';

const defaultQuantBytes = 2;
const scale = 1;
const videoWidth = 600 * scale;
const videoHeight = 480 * scale;

const defaultMobileNetMultiplier = 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 513;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
// const defaultResNetInputResolution = 257;
const defaultResNetInputResolution = Config.ResNetInputResolution;

 // 161,193,257,289,321,353,385,417,449,481,513,801 

const guiState = {
	algorithm: 'multi-pose',
	input: {
		architecture: 'ResNet50',
		outputStride: defaultResNetStride,
		inputResolution: defaultResNetInputResolution,
		multiplier: defaultResNetMultiplier,
		quantBytes: defaultQuantBytes
	},
	singlePoseDetection: {
		minPoseConfidence: 0.1,
		minPartConfidence: 0.5,
	},
	multiPoseDetection: {
		maxPoseDetections: 5,
		minPoseConfidence: 0.15,
		minPartConfidence: 0.1,
		nmsRadius: 30.0,
	},
	output: {
		showVideo: true,
		showSkeleton: true,
		showPoints: true,
		showBoundingBox: false,
	},
	net: null,
};

const logError = (e) => {
	console.warn('Error', e);
}

const logOutput = (o) => {
	console.log('Output :', o);
}

class PoseDetection extends EventDispatcher {
	constructor() {
		super();

		setTimeout(()=> {
			this._setupCamera()
			.then(this._loadPoseNet)
			.then(({video, net}) => {
				this.net = net;
				this._setupCanvas();
				this.resize();
				this.poseDetectionFrame();
			});
		}, 500);
	}


	_loadPoseNet(video) {
		console.log('Load pose net', video);
		return new Promise((resolve, reject) => {
			posenet.load({
				architecture: guiState.input.architecture,
				outputStride: guiState.input.outputStride,
				inputResolution: guiState.input.inputResolution,
				multiplier: guiState.input.multiplier,
				quantBytes: guiState.input.quantBytes
			}).then((net)=> {
				resolve({
					net,
					video
				});
			}, (o) => {
				reject(o);
			});
		});
	}


	_setupCamera() {
		return new Promise((resolve, reject) => {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				reject('no camera');
			}


			const video = document.getElementById('video');
			video.width = videoWidth;
			video.height = videoHeight;

			const onStreamFetched = (mediaStream) => {
				video.srcObject = mediaStream;
				video.play();
				console.log('Stream fetched :', video.width, video.height, video.videoWidth, video.videoHeight);

				this.video = video;
				window.video = video;
				resolve(video);
			}

			let deviceId = '';
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
				const webcams = devices.filter( device => device.kind === 'videoinput');
				console.log('webcams', webcams.length);
				console.table(webcams);

				//	overwrite settings

				if(webcams.length === 1) {
					deviceId = webcams[0].deviceId;
				} else {
					let logitech = webcams.filter( webcam => webcam.label.indexOf('C920') > -1)[0];
					deviceId = logitech ? logitech.deviceId : webcams[0].deviceId;
				}

				// deviceId = webcams[1].deviceId;
				// rotation = 0;

				window.navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: 30, deviceId} })
		      	.then(onStreamFetched).catch(function () { alert("No camera available."); });
			})
			.catch(function(err) {
			  console.log(err.name + ": " + err.message);
			});

		});
	}

	resize() {
		if(!this.canvas) {
			return;
		}

		const { innerWidth, innerHeight } = window;
		const sx = innerWidth / videoWidth;
		const sy = innerHeight / videoHeight;
		const scale = Math.max(sx, sy);
		const w = videoWidth * scale;
		const h = videoHeight * scale;
		const x = ( innerWidth - w ) * 0.5;
		const y = ( innerHeight - h ) * 0.5;

		this._scale = scale;
		this._x = x;
		this._y = y;

		const applyStyle = (elm) => {
			elm.style.width = `${w}px`;
			elm.style.height = `${h}px`;
			elm.style.top = `${y}px`;
			elm.style.left = `${x}px`;
		}


		applyStyle(this.video);
		applyStyle(this.canvas);
	}


	_setupCanvas() {

		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = videoWidth;
		this.canvas.height = videoHeight;
		this.canvas.className = 'webcam-canvas';

		this.ctx = this.canvas.getContext('2d');
		this.ctx.fillStyle = 'rgba(255, 0, 0, .5)';
		this.ctx.fillRect(0, 0, videoWidth, videoHeight);

		// this.canvasDebug = document.createElement("canvas");
		// document.body.appendChild(this.canvasDebug);
		// this.canvasDebug.width = window.innerWidth;
		// this.canvasDebug.height = window.innerHeight;
		// this.canvasDebug.className = 'debug-canvas';

		// this.ctxDebug = this.canvasDebug.getContext('2d');

		console.log('setup canvas', this.canvas);
	}


	poseDetectionFrame() {
		const { ctx } = this;
		const flipPoseHorizontal = true;

		this.net.estimatePoses(video, {
			flipHorizontal: flipPoseHorizontal,
			decodingMethod: 'multi-person',
			maxDetections: guiState.multiPoseDetection.maxPoseDetections,
			scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
			nmsRadius: guiState.multiPoseDetection.nmsRadius
		}).then((allPoses)=> {
			ctx.clearRect(0, 0, videoWidth, videoHeight);

			let minPoseConfidence;
      		let minPartConfidence;
      		minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
			minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;

			const hands = []

			allPoses.forEach(({score, keypoints}) => {
				if (score >= minPoseConfidence) {
					if (guiState.output.showPoints) {
						drawKeypoints(keypoints, minPartConfidence, ctx);

						let keypoint = keypoints[10];
						drawPoint(ctx, keypoint.position.y, keypoint.position.x, 5, 'red');
						let left = {
							x:keypoint.position.x * this._scale + this._x,
							y:keypoint.position.y * this._scale + this._y
						}

						keypoint = keypoints[9];
						drawPoint(ctx, keypoint.position.y, keypoint.position.x, 5, 'red');

						let right = {
							x:keypoint.position.x * this._scale + this._x,
							y:keypoint.position.y * this._scale + this._y
						}

						hands.push({
							left, right
						})
					}
					if (guiState.output.showSkeleton) {
						drawSkeleton(keypoints, minPartConfidence, ctx);
					}
					if (guiState.output.showBoundingBox) {
						drawBoundingBox(keypoints, ctx);
					}
				}
			});

			this.emit('poses', hands);

			// this.ctxDebug.clearRect(0, 0, window.innerWidth, window.innerHeight);
			// this.ctxDebug.fillStyle = 'rgba(255, 200, 50, 1)';
			// const r = 10;
			// hands.forEach( ({left, right}) => {
			// 	// console.log(left);
			// 	this.ctxDebug.beginPath();
			// 	this.ctxDebug.arc(left.x, left.y, r, 0, Math.PI * 2);	
			// 	this.ctxDebug.fill();

			// 	this.ctxDebug.beginPath();
			// 	this.ctxDebug.arc(right.x, right.y, r, 0, Math.PI * 2);	
			// 	this.ctxDebug.fill();
			// })
			


			requestAnimationFrame(()=>this.poseDetectionFrame());
		})
	}


	_onPose() {

	}


}

const _instance = new PoseDetection();

export default _instance;