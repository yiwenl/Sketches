// alfrid.js

import GLM 					from 'gl-matrix';
import GLTool 				from './alfrid/GLTool';
import GLShader 			from './alfrid/GLShader';
import GLTexture 			from './alfrid/GLTexture';
import GLCubeTexture 		from './alfrid/GLCubeTexture';
import Mesh 				from './alfrid/Mesh';
import Geom					from './alfrid/Geom';
import Batch				from './alfrid/Batch';
import FrameBuffer			from './alfrid/FrameBuffer';
import CubeFrameBuffer		from './alfrid/CubeFrameBuffer';

//	WEBGL 2
import MultisampleFrameBuffer		from './alfrid/MultisampleFrameBuffer';
import TransformFeedbackObject from './alfrid/TransformFeedbackObject';

//	TOOLS
import Scheduler 			from 'scheduling';
import EventDispatcher 		from './alfrid/utils/EventDispatcher';
import EaseNumber 			from './alfrid/utils/EaseNumber';
import TweenNumber 			from './alfrid/utils/TweenNumber';
import OrbitalControl		from './alfrid/utils/OrbitalControl';
import QuatRotation			from './alfrid/utils/QuatRotation';

//	CAMERAS
import Camera 				from './alfrid/cameras/Camera';
import CameraOrtho 			from './alfrid/cameras/CameraOrtho';
import CameraPerspective	from './alfrid/cameras/CameraPerspective';
import CameraCube			from './alfrid/cameras/CameraCube';

//	MATH
import Ray 					from './alfrid/math/Ray';

//	OBJECT
import Object3D 			from './alfrid/objects/Object3D';

//	LOADERS
import BinaryLoader			from './alfrid/loaders/BinaryLoader';
import ObjLoader			from './alfrid/loaders/ObjLoader';
import HDRLoader			from './alfrid/loaders/HDRLoader';

//	HELPERS
import BatchCopy			from './alfrid/helpers/BatchCopy';
import BatchAxis			from './alfrid/helpers/BatchAxis';
import BatchBall			from './alfrid/helpers/BatchBall';
import BatchDotsPlane		from './alfrid/helpers/BatchDotsPlane';
import BatchLine 			from './alfrid/helpers/BatchLine';
import BatchSkybox			from './alfrid/helpers/BatchSkybox';
import BatchSky				from './alfrid/helpers/BatchSky';
import Scene				from './alfrid/helpers/Scene';
import View					from './alfrid/helpers/View';
import View3D				from './alfrid/helpers/View3D';
import ShaderUtils			from './alfrid/helpers/ShaderUtils';
import ShaderLibs			from './alfrid/utils/ShaderLibs';


const VERSION = '0.1.24';

class Alfrid {
	constructor() {
		this.glm               = GLM;
		this.GL                = GLTool;
		this.GLTool            = GLTool;
		this.GLShader          = GLShader;
		this.GLTexture         = GLTexture;
		this.GLCubeTexture     = GLCubeTexture;
		this.Mesh              = Mesh;
		this.Geom              = Geom;
		this.Batch             = Batch;
		this.FrameBuffer       = FrameBuffer;
		this.CubeFrameBuffer   = CubeFrameBuffer;
		this.Scheduler         = Scheduler;
		this.EventDispatcher   = EventDispatcher;
		this.EaseNumber        = EaseNumber;
		this.TweenNumber       = TweenNumber;
		this.Camera            = Camera;
		this.CameraOrtho       = CameraOrtho;
		this.CameraPerspective = CameraPerspective;
		this.Ray 			   = Ray;
		this.CameraCube        = CameraCube;
		this.OrbitalControl    = OrbitalControl;
		this.QuatRotation      = QuatRotation;
		this.BinaryLoader      = BinaryLoader;
		this.ObjLoader         = ObjLoader;
		this.HDRLoader         = HDRLoader;
		this.BatchCopy         = BatchCopy;
		this.BatchAxis         = BatchAxis;
		this.BatchBall         = BatchBall;
		this.BatchBall         = BatchBall;
		this.BatchLine         = BatchLine;
		this.BatchSkybox       = BatchSkybox;
		this.BatchSky          = BatchSky;
		this.BatchDotsPlane    = BatchDotsPlane;
		this.Scene             = Scene;
		this.View              = View;
		this.View3D            = View3D;
		this.Object3D          = Object3D;
		this.ShaderLibs        = ShaderLibs;
		this.ShaderUtils       = ShaderUtils;

		this.MultisampleFrameBuffer   = MultisampleFrameBuffer;
		this.TransformFeedbackObject   = TransformFeedbackObject;


		//	NOT SUPER SURE I'VE DONE THIS IS A GOOD WAY

		for(const s in GLM) {
			if(GLM[s]) {
				window[s] = GLM[s];
			}
		}
	}

	log() {
		if(navigator.userAgent.indexOf('Chrome') > -1) {
			console.log(`%clib alfrid : VERSION ${VERSION}`, 'background: #193441; color: #FCFFF5');
		} else {
			console.log('lib alfrid : VERSION ', VERSION);
		}
		console.log('%cClasses : ', 'color: #193441');

		for(const s in this) {
			if(this[s]) {
				console.log(`%c - ${s}`, 'color: #3E606F');
			}
		}
	}
}

const al = new Alfrid();

export default al;