	// FaceTracking.js

import Emitter from 'events';
import { 
	isWebAssemblySupported, 
	readWASMBinary, 
	addBRFScript, 
	getFaceVertexPosition, 
	logError, 
	logSuccess, 
	DEG, 
	RAD } from './utils';


const Config = {
	minTrackingScale:0.5,
	transform: {
		scale:1,
		x:0,
		y:0
	}
}


const fps = 15;
let imageDataCtx  = null;                                   // only fetch the context once
let brfv4         = null; // the library namespace
let brfManager    = null; // the API
let resolution    = null; // the video stream resolution (usually 640x480)
let timeoutId     = -1;
let imageData;
let webcam;
let rotation = 0;

const modelZ      = 200;

class FaceTracking extends Emitter {
	constructor() {
		super();
		this._isTracking = false;
		this._loseCount = 0;
		this._trackingStatus = '';

		this._loseCountSecret = 0;
	}
	

	init() {

		const _isWebAssemblySupported = isWebAssemblySupported();
		var brfv4Example = { stats: {} };
		var brfv4BaseURL = _isWebAssemblySupported ? "assets/js/libs/brf_wasm/" : "assets/js/libs/brf_asmjs/";
		var brfv4SDKName = "BRFv4_JS_TK210219_v4.2.0_trial"; // the currently available library
		var brfv4WASMBuffer = null;


		const initLib = () => new Promise((resolve, reject) => {
			console.log('_isWebAssemblySupported', _isWebAssemblySupported);

			readWASMBinary(brfv4BaseURL + brfv4SDKName + ".wasm",
			  function(r) {

			    brfv4WASMBuffer = r; // see function waitForSDK. The ArrayBuffer needs to be added to the module object.

			    addBRFScript(brfv4BaseURL, brfv4SDKName);
			    resolve({});
			  },
			  logError,
			  logSuccess
			);
		});

		const startCamera = () => new Promise( (resolve, reject) => {
			console.log('Start camera');
			webcam = document.body.querySelector('.webcam');
			imageData = document.body.querySelector('.imageData');


			const onStreamFetched = (mediaStream) => {
				webcam.srcObject = mediaStream;
				webcam.play();

				// Check whether we know the stream dimension yet, if so, start BRFv4.
				const onStreamDimensionsAvailable = () => {
					console.log("onStreamDimensionsAvailable: " + (webcam.videoWidth !== 0));

					if(webcam.videoWidth === 0) {

						setTimeout(onStreamDimensionsAvailable, 100);

					} else {

						console.log('Webcam Rotation', rotation);

						// Resize the canvas to match the webcam video size.
						if(rotation !== 0) {
							imageData.width = webcam.videoHeight;
							imageData.height = webcam.videoWidth;
						} else {
							imageData.width = webcam.videoWidth;
							imageData.height = webcam.videoHeight;	
						}
						
						imageDataCtx = imageData.getContext("2d");

						resolve();
					}


				}

				// imageDataCtx is not null if we restart the camera stream on iOS.

				onStreamDimensionsAvailable();
			}


			let deviceId = '';
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
				const webcams = devices.filter( device => device.kind === 'videoinput');
				let isProd = true;
				webcams.forEach( cam => {
					if(cam.label.indexOf('FaceTime') > -1) {
						isProd = false;
					}
				});

				console.table(webcams);
				window.isProd = isProd;

				console.log('Is PROD ? ', window.isProd);
				console.log('webcams[0]', webcams[0]);
				//	overwrite settings

				if(webcams.length === 1) {
					deviceId = webcams[0].deviceId;
					// if(webcams[0].label.indexOf('C920') > -1) {
					// 	rotation = 90;
					// }
				} else {
					let logitech = webcams.filter( webcam => webcam.label.indexOf('C920') > -1)[0];
					if(logitech) {
						deviceId = logitech.deviceId;
					} else {
						deviceId = webcams[0].deviceId;
					}
					
					// rotation = 90;
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

		const loadSDK = () => new Promise( (resolve, reject) => {
			console.log('Loading sdk');

			if(brfv4 === null && window.hasOwnProperty("initializeBRF")) {

				// Set up the namespace and initialize BRFv4.
				// locateFile tells the asm.js version where to find the .mem file.
				// wasmBinary gets the preloaded .wasm file.

				brfv4 = {
					locateFile: function(fileName) { return brfv4BaseURL + fileName; },
					wasmBinary: brfv4WASMBuffer // Add loaded WASM file to Module
				};

				initializeBRF(brfv4);
			}


			const checkSDKReady = () => {
				if(brfv4 && brfv4.sdkReady) {
					initSDK();
				} else {
					setTimeout(checkSDKReady, 250);
				}
			}

			const initSDK = () => {
				console.log('SDK ready');
				resolution = new brfv4.Rectangle(0, 0, imageData.width, imageData.height);	
				
				brfManager = new brfv4.BRFManager();
				brfManager.init(resolution, resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");

				brfManager.setNumFacesToTrack(1);
				const maxFaceSize = Math.max(resolution.width, resolution.height);
				const { minTrackingScale } = Config;
				console.log('minTrackingScale', minTrackingScale);
				const max = 0.25;
				brfManager.setFaceDetectionParams(		maxFaceSize * max * minTrackingScale, maxFaceSize, 12, 8);
				brfManager.setFaceTrackingStartParams(	maxFaceSize * max * minTrackingScale, maxFaceSize, 32, 35, 32);
				brfManager.setFaceTrackingResetParams(	maxFaceSize * 0.15 * minTrackingScale, maxFaceSize, 40, 55, 32);


				// onInitBRFv4(brfManager, resolution);

				resolve({brfManager, resolution});
			}

			checkSDKReady();
		});

		return new Promise((resolve, reject) => {

			initLib()
			.then( startCamera )
			.then( loadSDK )
			.then( ()=> {
				gui.add(this, '_trackingStatus').name('Tracking Status').listen();
				gui.add(this, '_loseCountSecret').name('Inner Lost coud').listen();
				this.start();
				setInterval(()=>this.trackFaces(), 1000/fps);
				resolve();
			})
			.catch(e => {
				reject(e);
			})
			
		});
	}


	trackFaces() {
		// if(!this._isTracking) {	return;	}

		if(Math.random() > .95) {
			console.log('Track faces')	
		}
		

		imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // A virtual mirror should be... mirrored

		if(rotation === 0) {
			imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);	
		} else {
			const {x, y, scale} = Config.transform;
			imageDataCtx.save();
			imageDataCtx.translate(resolution.width, 0);
			imageDataCtx.rotate(Math.PI/2);

			imageDataCtx.translate(-y, x);
			imageDataCtx.scale(scale, scale);
			

			imageDataCtx.drawImage(webcam, 0, 0);	
			imageDataCtx.restore();

		}
	    
	    imageDataCtx.setTransform( 1.0, 0, 0, 1, 0, 0); // unmirrored for drawing the results
	    

	    brfManager.update(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);

	    const faces = brfManager.getFaces();
	    const face = faces[0];
	    this._trackingStatus = face.state;
	    if(face.state === 'state_face_detection') {
	    	return;
	    }


	    const DEG = 180 / Math.PI;
		const RAD = Math.PI / 180;

		let rx = -face.rotationX * DEG; 
		let ry = -face.rotationY * DEG; 
		let rz =  face.rotationZ * DEG; 

		let s   =  (face.scale / 180);
		const {x, y, z} = getFaceVertexPosition(face, face.points[27], 0);

		rx      = rx -  4 * (Math.abs(ry) / 45.0);
		rz      = rz - ry * 0.066 * (Math.abs(rx) / 20.0);
		ry      *= 0.9;

		rx *= RAD;
		ry *= RAD;
		rz *= RAD;

		const tx = x;
		const ty = y;

	    this.emit('onFace', {
			brfv4, 
			face,
			rx,
			ry,
			rz,
			x:tx, 
			y:ty,
			scale:s
		});
	}


	start() {
		this._isTracking = true;
	}


	pause() {
		this._isTracking = false;
	}

}


const _instance = new FaceTracking();


export default _instance;