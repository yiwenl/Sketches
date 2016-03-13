(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Ball.js

var random = function random(min, max) {
	return min + Math.random() * (max - min);
};

var Ball = function () {
	function Ball() {
		_classCallCheck(this, Ball);

		var range = 2;
		this.position = vec3.clone([random(-range, range), random(-range, range), random(-range, range)]);
		this.orgPosition = vec3.clone(this.position);
		this.scale = random(.25, 1);
		this.axis = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
		vec3.normalize(this.axis, this.axis);

		this.speed = random(-1, 1) * .01;
		this.angle = Math.random() * Math.PI;
		this.quat = quat.create();
	}

	_createClass(Ball, [{
		key: "update",
		value: function update() {
			this.angle += this.speed;

			quat.setAxisAngle(this.quat, this.axis, this.angle);
			vec3.transformQuat(this.position, this.orgPosition, this.quat);
		}
	}]);

	return Ball;
}();

exports.default = Ball;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // BeatDetector.js


window.Sono = require('./libs/sono.min.js');

var NUM_SAMPLES = 256;
var ON_BEAT = 'onBeat';

var BeatDetector = function (_alfrid$EventDispatch) {
	_inherits(BeatDetector, _alfrid$EventDispatch);

	function BeatDetector(url, beatCallback) {
		var isDebugging = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		_classCallCheck(this, BeatDetector);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BeatDetector).call(this));

		_this._url = url;
		_this._hasSoundLoaded = false;
		_this._loadSound();
		_this._sum = 0;
		_this._beatCallback = beatCallback;
		_this._easeSum = new _alfrid2.default.EaseNumber(0.0, .1);
		_this._isDebugging = isDebugging;
		_this.threshold = 100;

		//	DEBUG

		if (_this._isDebugging) {
			_this.canvas = document.createElement("canvas");
			_this.ctx = _this.canvas.getContext('2d');

			_this.canvas.width = 200;
			_this.canvas.height = 200;
			document.body.appendChild(_this.canvas);
			_this.canvas.style.position = 'absolute';
			_this.canvas.style.left = '0px';
			_this.canvas.style.top = '0px';
			_this.canvas.style.zIndex = '999';
		}

		return _this;
	}

	_createClass(BeatDetector, [{
		key: '_loadSound',
		value: function _loadSound() {
			var _this2 = this;

			this.sound = Sono.load({
				url: this._url,
				volume: 1.0,
				loop: true,
				onComplete: function onComplete(sound) {
					return _this2._onSoundLoaded(sound);
				}
			});
		}
	}, {
		key: '_onSoundLoaded',
		value: function _onSoundLoaded(sound) {
			var _this3 = this;

			this._hasSoundLoaded = true;
			this.analyser = this.sound.effect.analyser(NUM_SAMPLES);
			this.frequencies = this.analyser.getFrequencies();

			this.sound.play();

			_alfrid2.default.Scheduler.addEF(function () {
				return _this3._loop();
			});
		}
	}, {
		key: '_loop',
		value: function _loop() {
			var f = this.analyser.getFrequencies();

			var sum = 0;
			for (var i = 0; i < f.length; i++) {
				sum += f[i];
			}

			sum /= f.length;
			this._sum = sum / 128;
			this.frequencies = f;

			if (sum > this._easeSum.value + this.threshold) {
				this._easeSum.setTo(sum);
				this._easeSum.value = 0;

				if (this._beatCallback) {
					this._beatCallback(sum / 128);
				}
			}

			if (this._isDebugging) {
				this.ctx.clearRect(0, 0, 200, 200);
				var g = Math.floor(sum * 2.0);
				this.ctx.fillStyle = 'rgba(' + g + ', ' + g + ', ' + g + ', 255)';
				this.ctx.fillRect(0, 0, 100, 100);

				g = Math.floor(this._easeSum.value * 2.0);
				this.ctx.fillStyle = 'rgba(' + g + ', ' + g + ', ' + g + ', 255)';
				this.ctx.fillRect(0, 100, 100, 100);
			}
		}
	}, {
		key: 'amplitude',
		get: function get() {
			return this._sum;
		}
	}, {
		key: 'beatAmplitude',
		get: function get() {
			return this._easeSum.value / 128;
		}
	}, {
		key: 'hasSoundLoaded',
		get: function get() {
			return this._hasSoundLoaded;
		}
	}]);

	return BeatDetector;
}(_alfrid2.default.EventDispatcher);

BeatDetector.ON_BEAT = ON_BEAT;

exports.default = BeatDetector;

},{"./libs/alfrid.js":11,"./libs/sono.min.js":12}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

var _ViewCube = require('./ViewCube');

var _ViewCube2 = _interopRequireDefault(_ViewCube);

var _BeatDetector = require('./BeatDetector');

var _BeatDetector2 = _interopRequireDefault(_BeatDetector);

var _ViewSphere = require('./ViewSphere');

var _ViewSphere2 = _interopRequireDefault(_ViewSphere);

var _ViewBall = require('./ViewBall');

var _ViewBall2 = _interopRequireDefault(_ViewBall);

var _ViewPost = require('./ViewPost');

var _ViewPost2 = _interopRequireDefault(_ViewPost);

var _ViewBox = require('./ViewBox');

var _ViewBox2 = _interopRequireDefault(_ViewBox);

var _Ball = require('./Ball');

var _Ball2 = _interopRequireDefault(_Ball);

var _ViewSSAO = require('./ViewSSAO');

var _ViewSSAO2 = _interopRequireDefault(_ViewSSAO);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // SceneApp.js


var GL = _alfrid2.default.GL;

var SceneApp = function (_alfrid$Scene) {
	_inherits(SceneApp, _alfrid$Scene);

	function SceneApp() {
		_classCallCheck(this, SceneApp);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SceneApp).call(this));

		_this._initSound();
		_this._initBalls();
		_this._rotationY = new _alfrid2.default.EaseNumber(0.01, .05);
		_this._rotationX = new _alfrid2.default.EaseNumber(0.0, .005);

		_this.camera.setPerspective(Math.PI / 4, GL.aspectRatio, 1, 100);
		_this.cameraCube = new _alfrid2.default.CameraCube();
		_this.orbitalControl.lockZoom(true);

		return _this;
	}

	_createClass(SceneApp, [{
		key: '_initSound',
		value: function _initSound() {
			var _this2 = this;

			this._beatDetector = new _BeatDetector2.default('assets/02.mp3', function (sum) {
				return _this2._onBeat(sum);
			}, false);
		}
	}, {
		key: '_initBalls',
		value: function _initBalls() {
			var random = function random(min, max) {
				return min + Math.random() * (max - min);
			};

			this._balls = [];
			var range = 2;
			for (var i = 0; i < params.numBalls; i++) {
				// let b = {
				// 	position:[random(-range, range), random(-range, range), random(-range, range)],
				// 	scale:random(.5, 1)
				// }

				var b = new _Ball2.default();

				this._balls.push(b);
			}
		}
	}, {
		key: '_initTextures',
		value: function _initTextures() {
			console.log('Init textures');
			var fboSize = 512;
			this._cubeFbo = new _alfrid2.default.CubeFrameBuffer(fboSize);
			this._cubeBalls = new _alfrid2.default.CubeFrameBuffer(fboSize);
			this._textureLight = new _alfrid2.default.GLTexture(imgStudio);

			this._fboRender = new _alfrid2.default.FrameBuffer(GL.width, GL.height, { minFilter: GL.LINEAR, magFilter: GL.LINEAR });
			this._fboSSAO = new _alfrid2.default.FrameBuffer(GL.width, GL.height, { minFilter: GL.LINEAR, magFilter: GL.LINEAR });
		}
	}, {
		key: '_initViews',
		value: function _initViews() {
			console.log('Init Views');
			this._vCube = new _ViewCube2.default();
			this._bAxis = new _alfrid2.default.BatchAxis();
			this._bDotsPlane = new _alfrid2.default.BatchDotsPlane();
			this._bCopy = new _alfrid2.default.BatchCopy();
			this._vBall = new _ViewBall2.default();
			this._vBox = new _ViewBox2.default();
			this._vPost = new _ViewPost2.default();
			this._vSSAO = new _ViewSSAO2.default(this.camera.projection);

			this._vSphere = new _ViewSphere2.default();
		}
	}, {
		key: '_onBeat',
		value: function _onBeat(beatAmplitude) {
			this._rotationY.setTo(beatAmplitude * .2);
			this._rotationY.value = 0.01;

			// this._rotationX.setTo(beatAmplitude * .1);
			this._rotationX.value += beatAmplitude * 1.1;
		}
	}, {
		key: 'render',
		value: function render() {

			var frequencies = this._beatDetector.frequencies;
			// if(frequencies == undefined) return;

			this.orbitalControl._ry.value -= this._rotationY.value;
			// this.orbitalControl._rx.value = Math.sin(this._rotationX.value) * .7;

			GL.setMatrices(this.cameraCube);
			for (var i = 0; i < 6; i++) {
				this._cubeFbo.bind(i);
				GL.clear();
				this.cameraCube.face(i);
				this._vSphere.render(this._beatDetector.beatAmplitude);

				this._cubeFbo.unbind();
			}

			GL.setMatrices(this.camera);
			this._fboRender.bind();
			GL.clear(0, 0, 0, 0);
			this._vSphere.render(this._beatDetector.beatAmplitude);

			for (var _i = 0; _i < this._balls.length; _i++) {

				var b = this._balls[_i];
				b.update();
				if (_i < this._balls.length) {
					this._vBall.render(this._cubeFbo.getTexture(), this._textureLight, b.position, b.scale + this._beatDetector.beatAmplitude * .5, b.axis, b.angle);
				} else {
					this._vBox.render(this._cubeFbo.getTexture(), this._textureLight, b.position, b.scale + this._beatDetector.beatAmplitude * .5, b.axis, b.angle);
				}
			}
			this._fboRender.unbind();

			//	PREP FOR AO
			var m = this.camera.projection;
			var w = this._fboRender.width;
			var h = this._fboRender.height;
			var p = vec4.create();
			p[0] = -2 / (w * m[0]);
			p[1] = -2 / (h * m[5]);
			p[2] = 1.9 - m[2] / m[0];
			p[3] = 1.0 + m[6] / m[5];

			GL.setMatrices(this.cameraOrtho);

			this._fboSSAO.bind();
			GL.clear(0, 0, 0, 0);
			this._vSSAO.render(this._fboRender.getDepthTexture());
			this._fboSSAO.unbind();

			GL.clear(0, 0, 0, 0);
			this._vPost.render(this._fboRender.getTexture(), this._fboSSAO.getTexture());
		}
	}]);

	return SceneApp;
}(_alfrid2.default.Scene);

exports.default = SceneApp;

},{"./Ball":1,"./BeatDetector":2,"./ViewBall":4,"./ViewBox":5,"./ViewCube":6,"./ViewPost":7,"./ViewSSAO":8,"./ViewSphere":9,"./libs/alfrid.js":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ViewBall.js

var GL = _alfrid2.default.GL;


var ViewBall = function (_alfrid$View) {
	_inherits(ViewBall, _alfrid$View);

	function ViewBall() {
		_classCallCheck(this, ViewBall);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(ViewBall).call(this, "// reflection.vert\n\n#define SHADER_NAME REFLECTION_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform mat3 uNormalMatrix;\nuniform mat3 uModelViewMatrixInverse;\nuniform vec3 position;\nuniform vec3 scale;\n\nvarying vec2 vTextureCoord;\n\nvarying vec3 vNormalWorldSpace;\nvarying vec3 vEyeDirWorldSpace;\nvarying vec3 vNormal;\n\nvoid main(void) {\n\tvec3 pos               = aVertexPosition * scale + position;\n\tvec4 positionViewSpace = uViewMatrix * uModelMatrix * vec4(pos, 1.0);\n\tvec4 eyeDirViewSpace   = positionViewSpace - vec4( 0, 0, 0, 1 );\n\tvEyeDirWorldSpace      = vec3( uModelViewMatrixInverse * eyeDirViewSpace.rgb );\n\tvec3 normalViewSpace   = uNormalMatrix * aNormal;\n\tvNormalWorldSpace      = normalize( vec3( vec4( normalViewSpace, 0 ) * uViewMatrix ) );\t\t\n\t\n\tvTextureCoord          = aTextureCoord;\n\tgl_Position            = uProjectionMatrix * positionViewSpace;\n}\t\n", "// reflection.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\n#define GLSLIFY 1\nuniform samplerCube texture;\nuniform sampler2D textureLight;\nuniform mat3 uNormalMatrix;\n\nuniform vec3 axis;\nuniform float angle;\nuniform float showWires;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormalWorldSpace;\nvarying vec3 vEyeDirWorldSpace;\n\nconst float PI = 3.141592657;\nconst float TwoPI = PI * 2.0;\n\nfloat diffuse(vec3 N, vec3 L) {\n\treturn max(dot(N, normalize(L)), 0.0);\n}\n\nvec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {\n  float phi = acos(-wcNormal.y);\n  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;\n  return vec2(theta / TwoPI, phi / PI);\n}\n\nvec2 envMapEquirect(vec3 wcNormal) {\n    return envMapEquirect(wcNormal, -1.0);\n}\n\nconst vec3 light = vec3(1.0);\n\nvec4 quat_from_axis_angle(vec3 axis, float angle) { \n  vec4 qr;\n  float half_angle = (angle * 0.5) * 3.14159 / 180.0;\n  qr.x = axis.x * sin(half_angle);\n  qr.y = axis.y * sin(half_angle);\n  qr.z = axis.z * sin(half_angle);\n  qr.w = cos(half_angle);\n  return qr;\n}\n\nvec3 rotate_vertex_position(vec3 position, vec3 axis, float angle) { \n  vec4 q = quat_from_axis_angle(axis, angle);\n  vec3 v = position.xyz;\n  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvoid main(void) {\n    vec3 vN = rotate_vertex_position(vNormalWorldSpace, axis, angle);\n    // vec3 reflectedEyeWorldSpace = reflect( eye, normalize(vNormalWorldSpace) );\n    vec3 reflectedEyeWorldSpace = reflect( vEyeDirWorldSpace, normalize(vN) );\n    // reflectedEyeWorldSpace      = rotate_vertex_position(vEyeDirWorldSpace, axis, angle);\n    \n    vec3 N                      = uNormalMatrix*vNormalWorldSpace;\n    float _diffuse              = diffuse(N, light);\n    _diffuse                    = mix(_diffuse, 1.0, .2);\n    gl_FragColor                = textureCube(texture, reflectedEyeWorldSpace);\n    gl_FragColor.rgb            *= _diffuse;\n    \n    \n    vec2 envLightUV             = envMapEquirect(vNormalWorldSpace);\n    vec3 envLight               = texture2D(textureLight, envLightUV).rgb;\n    gl_FragColor.rgb            += envLight;\n\n    if(showWires > 0.0) {\n      gl_FragColor = vec4(1.0);\n    }\n}"));
	}

	_createClass(ViewBall, [{
		key: '_init',
		value: function _init() {
			this.mesh = _alfrid2.default.Geom.sphere(.85, 96, true);
			console.log(_alfrid2.default.Geom.sphere);
			this.meshWire = _alfrid2.default.Geom.sphere(.85, 96, true, false, GL.LINES);
		}
	}, {
		key: 'render',
		value: function render(texture, textureLight, position, scale, axis, angle) {
			this.shader.bind();
			this.shader.uniform("texture", "uniform1i", 0);
			texture.bind(0);
			this.shader.uniform("textureLight", "uniform1i", 1);
			textureLight.bind(1);
			this.shader.uniform("position", "uniform3fv", position);
			this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
			this.shader.uniform("axis", "uniform3fv", axis);
			this.shader.uniform("angle", "uniform1f", angle);
			this.shader.uniform("showWires", "uniform1f", params.wires ? 1.0 : 0.0);
			GL.draw(params.showWires ? this.meshWire : this.mesh);
		}
	}]);

	return ViewBall;
}(_alfrid2.default.View);

exports.default = ViewBall;

},{"./libs/alfrid.js":11}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ViewBoxes.js

var GL = _alfrid2.default.GL;


var ViewBox = function (_alfrid$View) {
	_inherits(ViewBox, _alfrid$View);

	function ViewBox() {
		_classCallCheck(this, ViewBox);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(ViewBox).call(this, "// reflection.vert\n\n#define SHADER_NAME REFLECTION_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform mat3 uNormalMatrix;\nuniform mat3 uModelViewMatrixInverse;\nuniform vec3 position;\nuniform vec3 scale;\n\nvarying vec2 vTextureCoord;\n\nvarying vec3 vNormalWorldSpace;\nvarying vec3 vEyeDirWorldSpace;\nvarying vec3 vNormal;\n\nvoid main(void) {\n\tvec3 pos               = aVertexPosition * scale + position;\n\tvec4 positionViewSpace = uViewMatrix * uModelMatrix * vec4(pos, 1.0);\n\tvec4 eyeDirViewSpace   = positionViewSpace - vec4( 0, 0, 0, 1 );\n\tvEyeDirWorldSpace      = vec3( uModelViewMatrixInverse * eyeDirViewSpace.rgb );\n\tvec3 normalViewSpace   = uNormalMatrix * aNormal;\n\tvNormalWorldSpace      = normalize( vec3( vec4( normalViewSpace, 0 ) * uViewMatrix ) );\t\t\n\t\n\tvTextureCoord          = aTextureCoord;\n\tgl_Position            = uProjectionMatrix * positionViewSpace;\n}\t\n", "// reflection.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\n#define GLSLIFY 1\nuniform samplerCube texture;\nuniform sampler2D textureLight;\nuniform mat3 uNormalMatrix;\n\nuniform vec3 axis;\nuniform float angle;\nuniform float showWires;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormalWorldSpace;\nvarying vec3 vEyeDirWorldSpace;\n\nconst float PI = 3.141592657;\nconst float TwoPI = PI * 2.0;\n\nfloat diffuse(vec3 N, vec3 L) {\n\treturn max(dot(N, normalize(L)), 0.0);\n}\n\nvec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {\n  float phi = acos(-wcNormal.y);\n  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;\n  return vec2(theta / TwoPI, phi / PI);\n}\n\nvec2 envMapEquirect(vec3 wcNormal) {\n    return envMapEquirect(wcNormal, -1.0);\n}\n\nconst vec3 light = vec3(1.0);\n\nvec4 quat_from_axis_angle(vec3 axis, float angle) { \n  vec4 qr;\n  float half_angle = (angle * 0.5) * 3.14159 / 180.0;\n  qr.x = axis.x * sin(half_angle);\n  qr.y = axis.y * sin(half_angle);\n  qr.z = axis.z * sin(half_angle);\n  qr.w = cos(half_angle);\n  return qr;\n}\n\nvec3 rotate_vertex_position(vec3 position, vec3 axis, float angle) { \n  vec4 q = quat_from_axis_angle(axis, angle);\n  vec3 v = position.xyz;\n  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvoid main(void) {\n    vec3 vN = rotate_vertex_position(vNormalWorldSpace, axis, angle);\n    // vec3 reflectedEyeWorldSpace = reflect( eye, normalize(vNormalWorldSpace) );\n    vec3 reflectedEyeWorldSpace = reflect( vEyeDirWorldSpace, normalize(vN) );\n    // reflectedEyeWorldSpace      = rotate_vertex_position(vEyeDirWorldSpace, axis, angle);\n    \n    vec3 N                      = uNormalMatrix*vNormalWorldSpace;\n    float _diffuse              = diffuse(N, light);\n    _diffuse                    = mix(_diffuse, 1.0, .2);\n    gl_FragColor                = textureCube(texture, reflectedEyeWorldSpace);\n    gl_FragColor.rgb            *= _diffuse;\n    \n    \n    vec2 envLightUV             = envMapEquirect(vNormalWorldSpace);\n    vec3 envLight               = texture2D(textureLight, envLightUV).rgb;\n    gl_FragColor.rgb            += envLight;\n\n    if(showWires > 0.0) {\n      gl_FragColor = vec4(1.0);\n    }\n}"));
	}

	_createClass(ViewBox, [{
		key: '_init',
		value: function _init() {
			this.mesh = _alfrid2.default.Geom.cube(.85, .85, .85, true);
		}
	}, {
		key: 'render',
		value: function render(texture, textureLight, position, scale, axis, angle) {
			this.shader.bind();
			this.shader.uniform("texture", "uniform1i", 0);
			texture.bind(0);
			this.shader.uniform("textureLight", "uniform1i", 1);
			textureLight.bind(1);
			this.shader.uniform("position", "uniform3fv", position);
			this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
			this.shader.uniform("axis", "uniform3fv", axis);
			this.shader.uniform("angle", "uniform1f", angle);
			GL.draw(this.mesh);
		}
	}]);

	return ViewBox;
}(_alfrid2.default.View);

exports.default = ViewBox;

},{"./libs/alfrid.js":11}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ViewCube.js


var GL = _alfrid2.default.GL;


var ViewCube = function (_alfrid$View) {
	_inherits(ViewCube, _alfrid$View);

	function ViewCube() {
		_classCallCheck(this, ViewCube);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ViewCube).call(this, "// basic.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform mat3 uNormalMatrix;\n\nuniform float time;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\nvarying vec3 vVertex;\n\nvoid main(void) {\n\tvec3 position = aVertexPosition;\n\tfloat scale = 1.0 + sin(time) * .5;\n\tposition *= scale;\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vNormal = normalize(uNormalMatrix * aNormal);\n    vVertex = aVertexPosition;\n}", "// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision highp float;\n#define GLSLIFY 1\nuniform samplerCube texture;\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\nvarying vec3 vVertex;\n\nconst vec3 light = vec3(1.0, 1.0, 1.0);\n\nfloat diffuse(vec3 N, vec3 L) {\n\treturn max(dot(N, normalize(L)), 0.0);\n}\n\nvoid main(void) {\n\t// vec4 color = texture2D(texture, vTextureCoord);\n\tvec4 color = textureCube(texture, vVertex);\n    float _diffuse = mix(diffuse(vNormal, light), 1.0, .2);\n    gl_FragColor = color * _diffuse;;\n}"));

		_this.time = 0;
		return _this;
	}

	_createClass(ViewCube, [{
		key: '_init',
		value: function _init() {
			var size = 1;
			this.mesh = _alfrid2.default.Geom.cube(size, size, size, true);
		}
	}, {
		key: 'render',
		value: function render(texture) {
			var scale = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

			this.shader.bind();
			this.shader.uniform("texture", "uniform1i", 0);
			texture.bind(0);
			this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
			GL.draw(this.mesh);
		}
	}]);

	return ViewCube;
}(_alfrid2.default.View);

exports.default = ViewCube;

},{"./libs/alfrid.js":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ViewPost.js

var GL = _alfrid2.default.GL;


var ViewPost = function (_alfrid$View) {
	_inherits(ViewPost, _alfrid$View);

	function ViewPost() {
		_classCallCheck(this, ViewPost);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ViewPost).call(this, _alfrid2.default.ShaderLibs.bigTriangleVert, "// post.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform sampler2D textureSSAO;\nuniform vec2 resolution;\nuniform float time;\nuniform float textureWidth;\nuniform float textureHeight;\n\nconst float PI = 3.141592657;\n\nfloat linterp( float t ) {\n\treturn clamp( 1.0 - abs( 2.0*t - 1.0 ), 0.0, 1.0 );\n}\n\nfloat remap( float t, float a, float b ) {\n\treturn clamp( (t - a) / (b - a), 0.0, 1.0 );\n}\nvec2 remap( vec2 t, vec2 a, vec2 b ) {\n\treturn clamp( (t - a) / (b - a), 0.0, 1.0 );\n}\n\nvec3 spectrum_offset_rgb( float t ) {\n\tvec3 ret;\n\tfloat lo = step(t,0.5);\n\tfloat hi = 1.0-lo;\n\tfloat w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );\n\tret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);\n\n\treturn pow( ret, vec3(1.0/2.2) );\n}\n\nconst float gamma = 2.2;\nvec3 lin2srgb( vec3 c )\n{\n    return pow( c, vec3(gamma) );\n}\nvec3 srgb2lin( vec3 c )\n{\n    return pow( c, vec3(1.0/gamma));\n}\n\nvec2 barrelDistortion( vec2 p, vec2 amt )\n{\n    p = 2.0 * p - 1.0;\n\n    const float maxBarrelPower = sqrt(5.0);\n    float radius = dot(p,p); //faster but doesn't match above accurately\n    p *= pow(vec2(radius), maxBarrelPower * amt);\n\t/* */\n\n    return p * 0.5 + 0.5;\n}\n\nvec2 brownConradyDistortion(vec2 uv, float dist)\n{\n    uv = uv * 2.0 - 1.0;\n    float barrelDistortion1 = 0.1 * dist; // K1 in text books\n    float barrelDistortion2 = -0.025 * dist; // K2 in text books\n\n    float r2 = dot(uv,uv);\n    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;\n    return uv * 0.5 + 0.5;\n}\n\nvec2 distort( vec2 uv, float t, vec2 min_distort, vec2 max_distort )\n{\n    vec2 dist = mix( min_distort, max_distort, t );\n    return brownConradyDistortion( uv, 75.0 * dist.x );\n}\n\n// ====\n\nvec3 spectrum_offset( float t )\n{\n    return spectrum_offset_rgb( t );\n}\n\n// ====\n\nfloat nrand( vec2 n )\n{\n\treturn fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);\n}\n\nvoid main(void) {\n\tvec2 uv                 = vTextureCoord;\n\t\n\tconst float MAX_DIST_PX = 20.0;\n\tfloat max_distort_px    = MAX_DIST_PX * .5;\n\tvec2 max_distort        = vec2(max_distort_px) / resolution.xy;\n\tvec2 min_distort        = 0.5 * max_distort;\n\t\n\tvec2 oversiz            = distort( vec2(1.0), 1.0, min_distort, max_distort );\n\tuv                      = remap( uv, 1.0-oversiz, oversiz );\n\t\n\tvec3 sumcol             = vec3(0.0);\n\tvec3 sumw               = vec3(0.0);\n\tfloat rnd               = nrand( uv + fract(time) );\n    const int num_iter = 6;\n\tfor ( int i=0; i<num_iter;++i ){\n\t\tfloat t = (float(i)+rnd) / float(num_iter-1);\n\t\tvec3 w = spectrum_offset( t );\n\t\tsumw += w;\n\t\tvec3 texel = texture2D( texture, distort(uv, t, min_distort, max_distort ) ).rgb;\n\t\tvec3 texelSSAO = texture2D( textureSSAO, distort(uv, t, min_distort, max_distort ) ).rgb;\n\n\t\t// texel = mix(texel, texelSSAO, .95);\n\t\ttexel *= texelSSAO;\n\n\t\tsumcol += w * srgb2lin(texel);\n\t}\n\n\tsumcol.rgb  /= sumw;\n\tvec3 outcol = lin2srgb(sumcol.rgb);\n\toutcol      += rnd/255.0;\n\n\t// float ao = texture2D(textureSSAO, vTextureCoord).r;\n\t// outcol *= ao;\n\n    gl_FragColor = vec4( outcol, 1.0);\n}"));

		_this.time = Math.random() * 1000;
		return _this;
	}

	_createClass(ViewPost, [{
		key: '_init',
		value: function _init() {
			this.mesh = _alfrid2.default.Geom.bigTriangle();
		}
	}, {
		key: 'render',
		value: function render(texture, textureSSAO) {

			this.shader.bind();
			this.shader.uniform("time", "uniform1f", this.time);
			this.shader.uniform("resolution", "uniform2fv", [GL.width, GL.height]);
			this.shader.uniform("texture", "uniform1i", 0);
			texture.bind(0);

			this.shader.uniform("textureSSAO", "uniform1i", 1);
			textureSSAO.bind(1);

			GL.draw(this.mesh);
		}
	}]);

	return ViewPost;
}(_alfrid2.default.View);

exports.default = ViewPost;

},{"./libs/alfrid.js":11}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ViewSSAO.js

var GL = _alfrid2.default.GL;


var ViewSSAO = function (_alfrid$View) {
	_inherits(ViewSSAO, _alfrid$View);

	function ViewSSAO() {
		_classCallCheck(this, ViewSSAO);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(ViewSSAO).call(this, _alfrid2.default.ShaderLibs.bigTriangleVert, "// ssao.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\n\nuniform float textureWidth;\nuniform float textureHeight;\n\nconst float near = 1.0;\nconst float far = 100.0;\nconst float PI = 3.141592657;\n\nconst int samples = 5; //samples on the first ring (4-8)\nconst int rings = 3; //ring count (3-6)\n\nvec2 rand(in vec2 coord) //generating random noise\n{\n\tfloat noiseX = (fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453));\n\tfloat noiseY = (fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453));\n\treturn vec2(noiseX,noiseY)*0.004;\n}\n\nfloat readDepth(in vec2 coord)\n{\n\treturn (2.0 * near) / (far + near - texture2D(texture, coord ).x * (far-near));        \n}\n\nfloat compareDepths( in float depth1, in float depth2 )\n{\n        float aoCap = 1.0;\n        float aoMultiplier = 100.0;\n        float depthTolerance = 0.0000;\n        float aorange = 60.0;// units in space the AO effect extends to (this gets divided by the camera far range\n        float diff = sqrt(clamp(1.0-(depth1-depth2) / (aorange/(far-near)),0.0,1.0));\n        float ao = min(aoCap,max(0.0,depth1-depth2-depthTolerance) * aoMultiplier) * diff;\n        return ao;\n}\n\nfloat ssao() {\n\n\tfloat depth = readDepth(vTextureCoord);\n\tfloat d;\n\tfloat aspect = textureWidth/textureHeight;\n\tvec2 noise = rand(vTextureCoord);\n\n\tfloat w = (1.0 / textureWidth)/clamp(depth,0.05,1.0)+(noise.x*(1.0-noise.x));\n    float h = (1.0 / textureHeight)/clamp(depth,0.05,1.0)+(noise.y*(1.0-noise.y));\n   \n    float pw;\n    float ph;\n\n    float ao;       \n    float s;\n    float fade = 4.0;\n\n    for (int i = 0 ; i < rings; i += 1) {\n    \tfade *= 0.5;\n        for (int j = 0 ; j < samples*rings; j += 1) {\n        \tif (j >= samples*i) break;\n            float step = PI*2.0 / (float(samples)*float(i));\n            pw = (cos(float(j)*step)*float(i));\n            ph = (sin(float(j)*step)*float(i))*aspect;\n            d = readDepth( vec2(vTextureCoord.s+pw*w,vTextureCoord.t+ph*h));\n            ao += compareDepths(depth,d)*fade;     \n            s += 1.0*fade;\n        }\n    }\n   \n    ao /= s;\n    ao = 1.0 - ao;\n    float offset = .5;\n    ao = offset + (1.0 - offset) * ao;\n    ao = pow(ao, 3.0);\n\n\treturn ao;\n}\n\nvoid main(void) {\n\tfloat ao = ssao();\n\t// ao = smoothstep(0.5, 1.0, ao);\n    gl_FragColor = vec4(vec3(ao), 1.0);\n    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n}"));
	}

	_createClass(ViewSSAO, [{
		key: '_init',
		value: function _init() {
			this.mesh = _alfrid2.default.Geom.bigTriangle();
		}
	}, {
		key: 'render',
		value: function render(texture) {
			this.shader.bind();
			this.shader.uniform("textureWidth", "uniform1f", GL.width);
			this.shader.uniform("textureHeight", "uniform1f", GL.height);
			this.shader.uniform("texture", "uniform1i", 0);
			texture.bind(0);
			GL.draw(this.mesh);
		}
	}]);

	return ViewSSAO;
}(_alfrid2.default.View);

exports.default = ViewSSAO;

},{"./libs/alfrid.js":11}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GL = _alfrid2.default.GL;


var ViewSphere = function (_alfrid$View) {
	_inherits(ViewSphere, _alfrid$View);

	function ViewSphere() {
		_classCallCheck(this, ViewSphere);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ViewSphere).call(this, "// sphere.vert\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n}", "// sphere.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform float showWires;\n// uniform sampler2D texture;\n\nvec4 permute(vec4 x) {  return mod(((x*34.0)+1.0)*x, 289.0);    }\nvec4 taylorInvSqrt(vec4 r) {    return 1.79284291400159 - 0.85373472095314 * r; }\n\nfloat snoise(vec3 v){\n    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n    \n    vec3 i  = floor(v + dot(v, C.yyy) );\n    vec3 x0 = v - i + dot(i, C.xxx) ;\n    \n    vec3 g = step(x0.yzx, x0.xyz);\n    vec3 l = 1.0 - g;\n    vec3 i1 = min( g.xyz, l.zxy );\n    vec3 i2 = max( g.xyz, l.zxy );\n    \n    vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n    vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n    vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n    \n    i = mod(i, 289.0 );\n    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n    \n    float n_ = 1.0/7.0;\n    vec3  ns = n_ * D.wyz - D.xzx;\n    \n    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);\n    \n    vec4 x_ = floor(j * ns.z);\n    vec4 y_ = floor(j - 7.0 * x_ );\n    \n    vec4 x = x_ *ns.x + ns.yyyy;\n    vec4 y = y_ *ns.x + ns.yyyy;\n    vec4 h = 1.0 - abs(x) - abs(y);\n    \n    vec4 b0 = vec4( x.xy, y.xy );\n    vec4 b1 = vec4( x.zw, y.zw );\n    \n    vec4 s0 = floor(b0)*2.0 + 1.0;\n    vec4 s1 = floor(b1)*2.0 + 1.0;\n    vec4 sh = -step(h, vec4(0.0));\n    \n    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n    \n    vec3 p0 = vec3(a0.xy,h.x);\n    vec3 p1 = vec3(a0.zw,h.y);\n    vec3 p2 = vec3(a1.xy,h.z);\n    vec3 p3 = vec3(a1.zw,h.w);\n    \n    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n    \n    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n    m = m * m;\n    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n}\n\nfloat snoise(float x, float y, float z){\n    return snoise(vec3(x, y, z));\n}\n\nuniform float time;\n\nvoid main(void) {\n    float y = vTextureCoord.y + snoise(vTextureCoord.y*10.0, 0.0, time*.25) * .1;\n    float g = fract(y * 10.0);\n    // float g = fract(y * .4);\n\t// float g = fract(y * 0.4);\n\tg = smoothstep(0.28, .3, abs(g-.5));\n\n\tgl_FragColor = vec4(g);\n\n    if(showWires > 0.0) {\n        gl_FragColor = vec4(1.0);\n    }\n}"));

		_this.time = Math.random();
		return _this;
	}

	_createClass(ViewSphere, [{
		key: '_init',
		value: function _init() {
			this.mesh = _alfrid2.default.Geom.sphere(10, 96, false, true);
			this.meshWire = _alfrid2.default.Geom.sphere(10, 96, false, true, GL.LINES);
		}
	}, {
		key: 'render',
		value: function render(beatValue) {
			this.time += .01 + beatValue * .1;
			this.shader.bind();
			this.shader.uniform("time", "uniform1f", this.time);
			this.shader.uniform("showWires", "uniform1f", params.wires ? 1.0 : 0.0);
			GL.draw(params.showWires ? this.meshWire : this.mesh);
		}
	}]);

	return ViewSphere;
}(_alfrid2.default.View);

exports.default = ViewSphere;

},{"./libs/alfrid.js":11}],10:[function(require,module,exports){
'use strict';

var _alfrid = require('./libs/alfrid.js');

var _alfrid2 = _interopRequireDefault(_alfrid);

var _SceneApp = require('./SceneApp');

var _SceneApp2 = _interopRequireDefault(_SceneApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



window.alfrid = _alfrid2.default;
window.params = {
	numBalls: 10,
	showWires: false
};

var hdrLoader = new _alfrid2.default.HDRLoader();
hdrLoader.load('assets/studio.hdr', function (img) {
	return _onImageLoaded(img);
});

function _onImageLoaded(img) {
	console.log('Image Loaded');
	window.imgStudio = img;

	if (document.body) {
		_init();
	} else {
		window.addEventListener('load', function () {
			return _init();
		});
	}
}

function _init() {
	//	CREATE CANVAS
	var canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	_alfrid2.default.GL.init(canvas);

	//	INIT SCENE
	var scene = new _SceneApp2.default();

	// window.addEventListener('click', ()=> {
	// 	params.showWires = !params.showWires;
	// })
}

function _loop() {
	GL.clear(0, 0, 0, 0);
	GL.setMatrices(camera);

	time += .02;
	shader.bind();
	shader.uniform('texture', 'uniform1i', 0);
	shader.uniform('time', 'uniform1f', time);
	texture.bind(0);

	batch.draw();
}

},{"./SceneApp":3,"./libs/alfrid.js":11}],11:[function(require,module,exports){
(function (global){
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else {var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else {g=this;}g.alfrid=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(_dereq_,module,exports){ /**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.3.0
 */ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */ // END HEADER
exports.glMatrix=_dereq_("./gl-matrix/common.js");exports.mat2=_dereq_("./gl-matrix/mat2.js");exports.mat2d=_dereq_("./gl-matrix/mat2d.js");exports.mat3=_dereq_("./gl-matrix/mat3.js");exports.mat4=_dereq_("./gl-matrix/mat4.js");exports.quat=_dereq_("./gl-matrix/quat.js");exports.vec2=_dereq_("./gl-matrix/vec2.js");exports.vec3=_dereq_("./gl-matrix/vec3.js");exports.vec4=_dereq_("./gl-matrix/vec4.js");},{"./gl-matrix/common.js":2,"./gl-matrix/mat2.js":3,"./gl-matrix/mat2d.js":4,"./gl-matrix/mat3.js":5,"./gl-matrix/mat4.js":6,"./gl-matrix/quat.js":7,"./gl-matrix/vec2.js":8,"./gl-matrix/vec3.js":9,"./gl-matrix/vec4.js":10}],2:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */ /**
 * @class Common utilities
 * @name glMatrix
 */var glMatrix={}; // Constants
glMatrix.EPSILON=0.000001;glMatrix.ARRAY_TYPE=typeof Float32Array!=='undefined'?Float32Array:Array;glMatrix.RANDOM=Math.random; /**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */glMatrix.setMatrixArrayType=function(type){GLMAT_ARRAY_TYPE=type;};var degree=Math.PI/180; /**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/glMatrix.toRadian=function(a){return a*degree;};module.exports=glMatrix;},{}],3:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 2x2 Matrix
 * @name mat2
 */var mat2={}; /**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */mat2.create=function(){var out=new glMatrix.ARRAY_TYPE(4);out[0]=1;out[1]=0;out[2]=0;out[3]=1;return out;}; /**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */mat2.clone=function(a){var out=new glMatrix.ARRAY_TYPE(4);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;}; /**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */mat2.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;}; /**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */mat2.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=1;return out;}; /**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */mat2.transpose=function(out,a){ // If we are transposing ourselves we can skip a few steps but have to cache some values
if(out===a){var a1=a[1];out[1]=a[2];out[2]=a1;}else {out[0]=a[0];out[1]=a[2];out[2]=a[1];out[3]=a[3];}return out;}; /**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */mat2.invert=function(out,a){var a0=a[0],a1=a[1],a2=a[2],a3=a[3], // Calculate the determinant
det=a0*a3-a2*a1;if(!det){return null;}det=1.0/det;out[0]=a3*det;out[1]=-a1*det;out[2]=-a2*det;out[3]=a0*det;return out;}; /**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */mat2.adjoint=function(out,a){ // Caching this value is nessecary if out == a
var a0=a[0];out[0]=a[3];out[1]=-a[1];out[2]=-a[2];out[3]=a0;return out;}; /**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */mat2.determinant=function(a){return a[0]*a[3]-a[2]*a[1];}; /**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */mat2.multiply=function(out,a,b){var a0=a[0],a1=a[1],a2=a[2],a3=a[3];var b0=b[0],b1=b[1],b2=b[2],b3=b[3];out[0]=a0*b0+a2*b1;out[1]=a1*b0+a3*b1;out[2]=a0*b2+a2*b3;out[3]=a1*b2+a3*b3;return out;}; /**
 * Alias for {@link mat2.multiply}
 * @function
 */mat2.mul=mat2.multiply; /**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */mat2.rotate=function(out,a,rad){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],s=Math.sin(rad),c=Math.cos(rad);out[0]=a0*c+a2*s;out[1]=a1*c+a3*s;out[2]=a0*-s+a2*c;out[3]=a1*-s+a3*c;return out;}; /**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/mat2.scale=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],v0=v[0],v1=v[1];out[0]=a0*v0;out[1]=a1*v0;out[2]=a2*v1;out[3]=a3*v1;return out;}; /**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */mat2.fromRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad);out[0]=c;out[1]=s;out[2]=-s;out[3]=c;return out;}; /**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2} out
 */mat2.fromScaling=function(out,v){out[0]=v[0];out[1]=0;out[2]=0;out[3]=v[1];return out;}; /**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */mat2.str=function(a){return 'mat2('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';}; /**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */mat2.frob=function(a){return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2));}; /**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */mat2.LDU=function(L,D,U,a){L[2]=a[2]/a[0];U[0]=a[0];U[1]=a[1];U[3]=a[3]-L[2]*U[1];return [L,D,U];};module.exports=mat2;},{"./common.js":2}],4:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */var mat2d={}; /**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */mat2d.create=function(){var out=new glMatrix.ARRAY_TYPE(6);out[0]=1;out[1]=0;out[2]=0;out[3]=1;out[4]=0;out[5]=0;return out;}; /**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */mat2d.clone=function(a){var out=new glMatrix.ARRAY_TYPE(6);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];return out;}; /**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */mat2d.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];return out;}; /**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */mat2d.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=1;out[4]=0;out[5]=0;return out;}; /**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */mat2d.invert=function(out,a){var aa=a[0],ab=a[1],ac=a[2],ad=a[3],atx=a[4],aty=a[5];var det=aa*ad-ab*ac;if(!det){return null;}det=1.0/det;out[0]=ad*det;out[1]=-ab*det;out[2]=-ac*det;out[3]=aa*det;out[4]=(ac*aty-ad*atx)*det;out[5]=(ab*atx-aa*aty)*det;return out;}; /**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */mat2d.determinant=function(a){return a[0]*a[3]-a[1]*a[2];}; /**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */mat2d.multiply=function(out,a,b){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],b0=b[0],b1=b[1],b2=b[2],b3=b[3],b4=b[4],b5=b[5];out[0]=a0*b0+a2*b1;out[1]=a1*b0+a3*b1;out[2]=a0*b2+a2*b3;out[3]=a1*b2+a3*b3;out[4]=a0*b4+a2*b5+a4;out[5]=a1*b4+a3*b5+a5;return out;}; /**
 * Alias for {@link mat2d.multiply}
 * @function
 */mat2d.mul=mat2d.multiply; /**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */mat2d.rotate=function(out,a,rad){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],s=Math.sin(rad),c=Math.cos(rad);out[0]=a0*c+a2*s;out[1]=a1*c+a3*s;out[2]=a0*-s+a2*c;out[3]=a1*-s+a3*c;out[4]=a4;out[5]=a5;return out;}; /**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/mat2d.scale=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],v0=v[0],v1=v[1];out[0]=a0*v0;out[1]=a1*v0;out[2]=a2*v1;out[3]=a3*v1;out[4]=a4;out[5]=a5;return out;}; /**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/mat2d.translate=function(out,a,v){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],a4=a[4],a5=a[5],v0=v[0],v1=v[1];out[0]=a0;out[1]=a1;out[2]=a2;out[3]=a3;out[4]=a0*v0+a2*v1+a4;out[5]=a1*v0+a3*v1+a5;return out;}; /**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */mat2d.fromRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad);out[0]=c;out[1]=s;out[2]=-s;out[3]=c;out[4]=0;out[5]=0;return out;}; /**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2d} out
 */mat2d.fromScaling=function(out,v){out[0]=v[0];out[1]=0;out[2]=0;out[3]=v[1];out[4]=0;out[5]=0;return out;}; /**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat2d} out
 */mat2d.fromTranslation=function(out,v){out[0]=1;out[1]=0;out[2]=0;out[3]=1;out[4]=v[0];out[5]=v[1];return out;}; /**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */mat2d.str=function(a){return 'mat2d('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+', '+a[4]+', '+a[5]+')';}; /**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */mat2d.frob=function(a){return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+1);};module.exports=mat2d;},{"./common.js":2}],5:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 3x3 Matrix
 * @name mat3
 */var mat3={}; /**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */mat3.create=function(){var out=new glMatrix.ARRAY_TYPE(9);out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;}; /**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */mat3.fromMat4=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[4];out[4]=a[5];out[5]=a[6];out[6]=a[8];out[7]=a[9];out[8]=a[10];return out;}; /**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */mat3.clone=function(a){var out=new glMatrix.ARRAY_TYPE(9);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;}; /**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */mat3.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;}; /**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */mat3.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;}; /**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */mat3.transpose=function(out,a){ // If we are transposing ourselves we can skip a few steps but have to cache some values
if(out===a){var a01=a[1],a02=a[2],a12=a[5];out[1]=a[3];out[2]=a[6];out[3]=a01;out[5]=a[7];out[6]=a02;out[7]=a12;}else {out[0]=a[0];out[1]=a[3];out[2]=a[6];out[3]=a[1];out[4]=a[4];out[5]=a[7];out[6]=a[2];out[7]=a[5];out[8]=a[8];}return out;}; /**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */mat3.invert=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],b01=a22*a11-a12*a21,b11=-a22*a10+a12*a20,b21=a21*a10-a11*a20, // Calculate the determinant
det=a00*b01+a01*b11+a02*b21;if(!det){return null;}det=1.0/det;out[0]=b01*det;out[1]=(-a22*a01+a02*a21)*det;out[2]=(a12*a01-a02*a11)*det;out[3]=b11*det;out[4]=(a22*a00-a02*a20)*det;out[5]=(-a12*a00+a02*a10)*det;out[6]=b21*det;out[7]=(-a21*a00+a01*a20)*det;out[8]=(a11*a00-a01*a10)*det;return out;}; /**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */mat3.adjoint=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8];out[0]=a11*a22-a12*a21;out[1]=a02*a21-a01*a22;out[2]=a01*a12-a02*a11;out[3]=a12*a20-a10*a22;out[4]=a00*a22-a02*a20;out[5]=a02*a10-a00*a12;out[6]=a10*a21-a11*a20;out[7]=a01*a20-a00*a21;out[8]=a00*a11-a01*a10;return out;}; /**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */mat3.determinant=function(a){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8];return a00*(a22*a11-a12*a21)+a01*(-a22*a10+a12*a20)+a02*(a21*a10-a11*a20);}; /**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */mat3.multiply=function(out,a,b){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],b00=b[0],b01=b[1],b02=b[2],b10=b[3],b11=b[4],b12=b[5],b20=b[6],b21=b[7],b22=b[8];out[0]=b00*a00+b01*a10+b02*a20;out[1]=b00*a01+b01*a11+b02*a21;out[2]=b00*a02+b01*a12+b02*a22;out[3]=b10*a00+b11*a10+b12*a20;out[4]=b10*a01+b11*a11+b12*a21;out[5]=b10*a02+b11*a12+b12*a22;out[6]=b20*a00+b21*a10+b22*a20;out[7]=b20*a01+b21*a11+b22*a21;out[8]=b20*a02+b21*a12+b22*a22;return out;}; /**
 * Alias for {@link mat3.multiply}
 * @function
 */mat3.mul=mat3.multiply; /**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */mat3.translate=function(out,a,v){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],x=v[0],y=v[1];out[0]=a00;out[1]=a01;out[2]=a02;out[3]=a10;out[4]=a11;out[5]=a12;out[6]=x*a00+y*a10+a20;out[7]=x*a01+y*a11+a21;out[8]=x*a02+y*a12+a22;return out;}; /**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */mat3.rotate=function(out,a,rad){var a00=a[0],a01=a[1],a02=a[2],a10=a[3],a11=a[4],a12=a[5],a20=a[6],a21=a[7],a22=a[8],s=Math.sin(rad),c=Math.cos(rad);out[0]=c*a00+s*a10;out[1]=c*a01+s*a11;out[2]=c*a02+s*a12;out[3]=c*a10-s*a00;out[4]=c*a11-s*a01;out[5]=c*a12-s*a02;out[6]=a20;out[7]=a21;out[8]=a22;return out;}; /**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/mat3.scale=function(out,a,v){var x=v[0],y=v[1];out[0]=x*a[0];out[1]=x*a[1];out[2]=x*a[2];out[3]=y*a[3];out[4]=y*a[4];out[5]=y*a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];return out;}; /**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */mat3.fromTranslation=function(out,v){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=v[0];out[7]=v[1];out[8]=1;return out;}; /**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */mat3.fromRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad);out[0]=c;out[1]=s;out[2]=0;out[3]=-s;out[4]=c;out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;}; /**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */mat3.fromScaling=function(out,v){out[0]=v[0];out[1]=0;out[2]=0;out[3]=0;out[4]=v[1];out[5]=0;out[6]=0;out[7]=0;out[8]=1;return out;}; /**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/mat3.fromMat2d=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=0;out[3]=a[2];out[4]=a[3];out[5]=0;out[6]=a[4];out[7]=a[5];out[8]=1;return out;}; /**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/mat3.fromQuat=function(out,q){var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,yx=y*x2,yy=y*y2,zx=z*x2,zy=z*y2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-yy-zz;out[3]=yx-wz;out[6]=zx+wy;out[1]=yx+wz;out[4]=1-xx-zz;out[7]=zy-wx;out[2]=zx-wy;out[5]=zy+wx;out[8]=1-xx-yy;return out;}; /**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/mat3.normalFromMat4=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32, // Calculate the determinant
det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det){return null;}det=1.0/det;out[0]=(a11*b11-a12*b10+a13*b09)*det;out[1]=(a12*b08-a10*b11-a13*b07)*det;out[2]=(a10*b10-a11*b08+a13*b06)*det;out[3]=(a02*b10-a01*b11-a03*b09)*det;out[4]=(a00*b11-a02*b08+a03*b07)*det;out[5]=(a01*b08-a00*b10-a03*b06)*det;out[6]=(a31*b05-a32*b04+a33*b03)*det;out[7]=(a32*b02-a30*b05-a33*b01)*det;out[8]=(a30*b04-a31*b02+a33*b00)*det;return out;}; /**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */mat3.str=function(a){return 'mat3('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+', '+a[4]+', '+a[5]+', '+a[6]+', '+a[7]+', '+a[8]+')';}; /**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */mat3.frob=function(a){return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+Math.pow(a[6],2)+Math.pow(a[7],2)+Math.pow(a[8],2));};module.exports=mat3;},{"./common.js":2}],6:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 4x4 Matrix
 * @name mat4
 */var mat4={}; /**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */mat4.create=function(){var out=new glMatrix.ARRAY_TYPE(16);out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */mat4.clone=function(a){var out=new glMatrix.ARRAY_TYPE(16);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;}; /**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */mat4.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;}; /**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */mat4.identity=function(out){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */mat4.transpose=function(out,a){ // If we are transposing ourselves we can skip a few steps but have to cache some values
if(out===a){var a01=a[1],a02=a[2],a03=a[3],a12=a[6],a13=a[7],a23=a[11];out[1]=a[4];out[2]=a[8];out[3]=a[12];out[4]=a01;out[6]=a[9];out[7]=a[13];out[8]=a02;out[9]=a12;out[11]=a[14];out[12]=a03;out[13]=a13;out[14]=a23;}else {out[0]=a[0];out[1]=a[4];out[2]=a[8];out[3]=a[12];out[4]=a[1];out[5]=a[5];out[6]=a[9];out[7]=a[13];out[8]=a[2];out[9]=a[6];out[10]=a[10];out[11]=a[14];out[12]=a[3];out[13]=a[7];out[14]=a[11];out[15]=a[15];}return out;}; /**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */mat4.invert=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32, // Calculate the determinant
det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det){return null;}det=1.0/det;out[0]=(a11*b11-a12*b10+a13*b09)*det;out[1]=(a02*b10-a01*b11-a03*b09)*det;out[2]=(a31*b05-a32*b04+a33*b03)*det;out[3]=(a22*b04-a21*b05-a23*b03)*det;out[4]=(a12*b08-a10*b11-a13*b07)*det;out[5]=(a00*b11-a02*b08+a03*b07)*det;out[6]=(a32*b02-a30*b05-a33*b01)*det;out[7]=(a20*b05-a22*b02+a23*b01)*det;out[8]=(a10*b10-a11*b08+a13*b06)*det;out[9]=(a01*b08-a00*b10-a03*b06)*det;out[10]=(a30*b04-a31*b02+a33*b00)*det;out[11]=(a21*b02-a20*b04-a23*b00)*det;out[12]=(a11*b07-a10*b09-a12*b06)*det;out[13]=(a00*b09-a01*b07+a02*b06)*det;out[14]=(a31*b01-a30*b03-a32*b00)*det;out[15]=(a20*b03-a21*b01+a22*b00)*det;return out;}; /**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */mat4.adjoint=function(out,a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];out[0]=a11*(a22*a33-a23*a32)-a21*(a12*a33-a13*a32)+a31*(a12*a23-a13*a22);out[1]=-(a01*(a22*a33-a23*a32)-a21*(a02*a33-a03*a32)+a31*(a02*a23-a03*a22));out[2]=a01*(a12*a33-a13*a32)-a11*(a02*a33-a03*a32)+a31*(a02*a13-a03*a12);out[3]=-(a01*(a12*a23-a13*a22)-a11*(a02*a23-a03*a22)+a21*(a02*a13-a03*a12));out[4]=-(a10*(a22*a33-a23*a32)-a20*(a12*a33-a13*a32)+a30*(a12*a23-a13*a22));out[5]=a00*(a22*a33-a23*a32)-a20*(a02*a33-a03*a32)+a30*(a02*a23-a03*a22);out[6]=-(a00*(a12*a33-a13*a32)-a10*(a02*a33-a03*a32)+a30*(a02*a13-a03*a12));out[7]=a00*(a12*a23-a13*a22)-a10*(a02*a23-a03*a22)+a20*(a02*a13-a03*a12);out[8]=a10*(a21*a33-a23*a31)-a20*(a11*a33-a13*a31)+a30*(a11*a23-a13*a21);out[9]=-(a00*(a21*a33-a23*a31)-a20*(a01*a33-a03*a31)+a30*(a01*a23-a03*a21));out[10]=a00*(a11*a33-a13*a31)-a10*(a01*a33-a03*a31)+a30*(a01*a13-a03*a11);out[11]=-(a00*(a11*a23-a13*a21)-a10*(a01*a23-a03*a21)+a20*(a01*a13-a03*a11));out[12]=-(a10*(a21*a32-a22*a31)-a20*(a11*a32-a12*a31)+a30*(a11*a22-a12*a21));out[13]=a00*(a21*a32-a22*a31)-a20*(a01*a32-a02*a31)+a30*(a01*a22-a02*a21);out[14]=-(a00*(a11*a32-a12*a31)-a10*(a01*a32-a02*a31)+a30*(a01*a12-a02*a11));out[15]=a00*(a11*a22-a12*a21)-a10*(a01*a22-a02*a21)+a20*(a01*a12-a02*a11);return out;}; /**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */mat4.determinant=function(a){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32; // Calculate the determinant
return b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;}; /**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */mat4.multiply=function(out,a,b){var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15]; // Cache only the current line of the second matrix
var b0=b[0],b1=b[1],b2=b[2],b3=b[3];out[0]=b0*a00+b1*a10+b2*a20+b3*a30;out[1]=b0*a01+b1*a11+b2*a21+b3*a31;out[2]=b0*a02+b1*a12+b2*a22+b3*a32;out[3]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[4];b1=b[5];b2=b[6];b3=b[7];out[4]=b0*a00+b1*a10+b2*a20+b3*a30;out[5]=b0*a01+b1*a11+b2*a21+b3*a31;out[6]=b0*a02+b1*a12+b2*a22+b3*a32;out[7]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[8];b1=b[9];b2=b[10];b3=b[11];out[8]=b0*a00+b1*a10+b2*a20+b3*a30;out[9]=b0*a01+b1*a11+b2*a21+b3*a31;out[10]=b0*a02+b1*a12+b2*a22+b3*a32;out[11]=b0*a03+b1*a13+b2*a23+b3*a33;b0=b[12];b1=b[13];b2=b[14];b3=b[15];out[12]=b0*a00+b1*a10+b2*a20+b3*a30;out[13]=b0*a01+b1*a11+b2*a21+b3*a31;out[14]=b0*a02+b1*a12+b2*a22+b3*a32;out[15]=b0*a03+b1*a13+b2*a23+b3*a33;return out;}; /**
 * Alias for {@link mat4.multiply}
 * @function
 */mat4.mul=mat4.multiply; /**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */mat4.translate=function(out,a,v){var x=v[0],y=v[1],z=v[2],a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23;if(a===out){out[12]=a[0]*x+a[4]*y+a[8]*z+a[12];out[13]=a[1]*x+a[5]*y+a[9]*z+a[13];out[14]=a[2]*x+a[6]*y+a[10]*z+a[14];out[15]=a[3]*x+a[7]*y+a[11]*z+a[15];}else {a00=a[0];a01=a[1];a02=a[2];a03=a[3];a10=a[4];a11=a[5];a12=a[6];a13=a[7];a20=a[8];a21=a[9];a22=a[10];a23=a[11];out[0]=a00;out[1]=a01;out[2]=a02;out[3]=a03;out[4]=a10;out[5]=a11;out[6]=a12;out[7]=a13;out[8]=a20;out[9]=a21;out[10]=a22;out[11]=a23;out[12]=a00*x+a10*y+a20*z+a[12];out[13]=a01*x+a11*y+a21*z+a[13];out[14]=a02*x+a12*y+a22*z+a[14];out[15]=a03*x+a13*y+a23*z+a[15];}return out;}; /**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/mat4.scale=function(out,a,v){var x=v[0],y=v[1],z=v[2];out[0]=a[0]*x;out[1]=a[1]*x;out[2]=a[2]*x;out[3]=a[3]*x;out[4]=a[4]*y;out[5]=a[5]*y;out[6]=a[6]*y;out[7]=a[7]*y;out[8]=a[8]*z;out[9]=a[9]*z;out[10]=a[10]*z;out[11]=a[11]*z;out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];return out;}; /**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */mat4.rotate=function(out,a,rad,axis){var x=axis[0],y=axis[1],z=axis[2],len=Math.sqrt(x*x+y*y+z*z),s,c,t,a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,b00,b01,b02,b10,b11,b12,b20,b21,b22;if(Math.abs(len)<glMatrix.EPSILON){return null;}len=1/len;x*=len;y*=len;z*=len;s=Math.sin(rad);c=Math.cos(rad);t=1-c;a00=a[0];a01=a[1];a02=a[2];a03=a[3];a10=a[4];a11=a[5];a12=a[6];a13=a[7];a20=a[8];a21=a[9];a22=a[10];a23=a[11]; // Construct the elements of the rotation matrix
b00=x*x*t+c;b01=y*x*t+z*s;b02=z*x*t-y*s;b10=x*y*t-z*s;b11=y*y*t+c;b12=z*y*t+x*s;b20=x*z*t+y*s;b21=y*z*t-x*s;b22=z*z*t+c; // Perform rotation-specific matrix multiplication
out[0]=a00*b00+a10*b01+a20*b02;out[1]=a01*b00+a11*b01+a21*b02;out[2]=a02*b00+a12*b01+a22*b02;out[3]=a03*b00+a13*b01+a23*b02;out[4]=a00*b10+a10*b11+a20*b12;out[5]=a01*b10+a11*b11+a21*b12;out[6]=a02*b10+a12*b11+a22*b12;out[7]=a03*b10+a13*b11+a23*b12;out[8]=a00*b20+a10*b21+a20*b22;out[9]=a01*b20+a11*b21+a21*b22;out[10]=a02*b20+a12*b21+a22*b22;out[11]=a03*b20+a13*b21+a23*b22;if(a!==out){ // If the source and destination differ, copy the unchanged last row
out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];}return out;}; /**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.rotateX=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11];if(a!==out){ // If the source and destination differ, copy the unchanged rows
out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];} // Perform axis-specific matrix multiplication
out[4]=a10*c+a20*s;out[5]=a11*c+a21*s;out[6]=a12*c+a22*s;out[7]=a13*c+a23*s;out[8]=a20*c-a10*s;out[9]=a21*c-a11*s;out[10]=a22*c-a12*s;out[11]=a23*c-a13*s;return out;}; /**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.rotateY=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a20=a[8],a21=a[9],a22=a[10],a23=a[11];if(a!==out){ // If the source and destination differ, copy the unchanged rows
out[4]=a[4];out[5]=a[5];out[6]=a[6];out[7]=a[7];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];} // Perform axis-specific matrix multiplication
out[0]=a00*c-a20*s;out[1]=a01*c-a21*s;out[2]=a02*c-a22*s;out[3]=a03*c-a23*s;out[8]=a00*s+a20*c;out[9]=a01*s+a21*c;out[10]=a02*s+a22*c;out[11]=a03*s+a23*c;return out;}; /**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.rotateZ=function(out,a,rad){var s=Math.sin(rad),c=Math.cos(rad),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7];if(a!==out){ // If the source and destination differ, copy the unchanged last row
out[8]=a[8];out[9]=a[9];out[10]=a[10];out[11]=a[11];out[12]=a[12];out[13]=a[13];out[14]=a[14];out[15]=a[15];} // Perform axis-specific matrix multiplication
out[0]=a00*c+a10*s;out[1]=a01*c+a11*s;out[2]=a02*c+a12*s;out[3]=a03*c+a13*s;out[4]=a10*c-a00*s;out[5]=a11*c-a01*s;out[6]=a12*c-a02*s;out[7]=a13*c-a03*s;return out;}; /**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */mat4.fromTranslation=function(out,v){out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=v[0];out[13]=v[1];out[14]=v[2];out[15]=1;return out;}; /**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */mat4.fromScaling=function(out,v){out[0]=v[0];out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=v[1];out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=v[2];out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */mat4.fromRotation=function(out,rad,axis){var x=axis[0],y=axis[1],z=axis[2],len=Math.sqrt(x*x+y*y+z*z),s,c,t;if(Math.abs(len)<glMatrix.EPSILON){return null;}len=1/len;x*=len;y*=len;z*=len;s=Math.sin(rad);c=Math.cos(rad);t=1-c; // Perform rotation-specific matrix multiplication
out[0]=x*x*t+c;out[1]=y*x*t+z*s;out[2]=z*x*t-y*s;out[3]=0;out[4]=x*y*t-z*s;out[5]=y*y*t+c;out[6]=z*y*t+x*s;out[7]=0;out[8]=x*z*t+y*s;out[9]=y*z*t-x*s;out[10]=z*z*t+c;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.fromXRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad); // Perform axis-specific matrix multiplication
out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=c;out[6]=s;out[7]=0;out[8]=0;out[9]=-s;out[10]=c;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.fromYRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad); // Perform axis-specific matrix multiplication
out[0]=c;out[1]=0;out[2]=-s;out[3]=0;out[4]=0;out[5]=1;out[6]=0;out[7]=0;out[8]=s;out[9]=0;out[10]=c;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */mat4.fromZRotation=function(out,rad){var s=Math.sin(rad),c=Math.cos(rad); // Perform axis-specific matrix multiplication
out[0]=c;out[1]=s;out[2]=0;out[3]=0;out[4]=-s;out[5]=c;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=1;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */mat4.fromRotationTranslation=function(out,q,v){ // Quaternion math
var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-(yy+zz);out[1]=xy+wz;out[2]=xz-wy;out[3]=0;out[4]=xy-wz;out[5]=1-(xx+zz);out[6]=yz+wx;out[7]=0;out[8]=xz+wy;out[9]=yz-wx;out[10]=1-(xx+yy);out[11]=0;out[12]=v[0];out[13]=v[1];out[14]=v[2];out[15]=1;return out;}; /**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */mat4.fromRotationTranslationScale=function(out,q,v,s){ // Quaternion math
var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2,sx=s[0],sy=s[1],sz=s[2];out[0]=(1-(yy+zz))*sx;out[1]=(xy+wz)*sx;out[2]=(xz-wy)*sx;out[3]=0;out[4]=(xy-wz)*sy;out[5]=(1-(xx+zz))*sy;out[6]=(yz+wx)*sy;out[7]=0;out[8]=(xz+wy)*sz;out[9]=(yz-wx)*sz;out[10]=(1-(xx+yy))*sz;out[11]=0;out[12]=v[0];out[13]=v[1];out[14]=v[2];out[15]=1;return out;}; /**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */mat4.fromRotationTranslationScaleOrigin=function(out,q,v,s,o){ // Quaternion math
var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2,sx=s[0],sy=s[1],sz=s[2],ox=o[0],oy=o[1],oz=o[2];out[0]=(1-(yy+zz))*sx;out[1]=(xy+wz)*sx;out[2]=(xz-wy)*sx;out[3]=0;out[4]=(xy-wz)*sy;out[5]=(1-(xx+zz))*sy;out[6]=(yz+wx)*sy;out[7]=0;out[8]=(xz+wy)*sz;out[9]=(yz-wx)*sz;out[10]=(1-(xx+yy))*sz;out[11]=0;out[12]=v[0]+ox-(out[0]*ox+out[4]*oy+out[8]*oz);out[13]=v[1]+oy-(out[1]*ox+out[5]*oy+out[9]*oz);out[14]=v[2]+oz-(out[2]*ox+out[6]*oy+out[10]*oz);out[15]=1;return out;};mat4.fromQuat=function(out,q){var x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,yx=y*x2,yy=y*y2,zx=z*x2,zy=z*y2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;out[0]=1-yy-zz;out[1]=yx+wz;out[2]=zx-wy;out[3]=0;out[4]=yx-wz;out[5]=1-xx-zz;out[6]=zy+wx;out[7]=0;out[8]=zx+wy;out[9]=zy-wx;out[10]=1-xx-yy;out[11]=0;out[12]=0;out[13]=0;out[14]=0;out[15]=1;return out;}; /**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */mat4.frustum=function(out,left,right,bottom,top,near,far){var rl=1/(right-left),tb=1/(top-bottom),nf=1/(near-far);out[0]=near*2*rl;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=near*2*tb;out[6]=0;out[7]=0;out[8]=(right+left)*rl;out[9]=(top+bottom)*tb;out[10]=(far+near)*nf;out[11]=-1;out[12]=0;out[13]=0;out[14]=far*near*2*nf;out[15]=0;return out;}; /**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */mat4.perspective=function(out,fovy,aspect,near,far){var f=1.0/Math.tan(fovy/2),nf=1/(near-far);out[0]=f/aspect;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=f;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=(far+near)*nf;out[11]=-1;out[12]=0;out[13]=0;out[14]=2*far*near*nf;out[15]=0;return out;}; /**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */mat4.perspectiveFromFieldOfView=function(out,fov,near,far){var upTan=Math.tan(fov.upDegrees*Math.PI/180.0),downTan=Math.tan(fov.downDegrees*Math.PI/180.0),leftTan=Math.tan(fov.leftDegrees*Math.PI/180.0),rightTan=Math.tan(fov.rightDegrees*Math.PI/180.0),xScale=2.0/(leftTan+rightTan),yScale=2.0/(upTan+downTan);out[0]=xScale;out[1]=0.0;out[2]=0.0;out[3]=0.0;out[4]=0.0;out[5]=yScale;out[6]=0.0;out[7]=0.0;out[8]=-((leftTan-rightTan)*xScale*0.5);out[9]=(upTan-downTan)*yScale*0.5;out[10]=far/(near-far);out[11]=-1.0;out[12]=0.0;out[13]=0.0;out[14]=far*near/(near-far);out[15]=0.0;return out;}; /**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */mat4.ortho=function(out,left,right,bottom,top,near,far){var lr=1/(left-right),bt=1/(bottom-top),nf=1/(near-far);out[0]=-2*lr;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=-2*bt;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=2*nf;out[11]=0;out[12]=(left+right)*lr;out[13]=(top+bottom)*bt;out[14]=(far+near)*nf;out[15]=1;return out;}; /**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */mat4.lookAt=function(out,eye,center,up){var x0,x1,x2,y0,y1,y2,z0,z1,z2,len,eyex=eye[0],eyey=eye[1],eyez=eye[2],upx=up[0],upy=up[1],upz=up[2],centerx=center[0],centery=center[1],centerz=center[2];if(Math.abs(eyex-centerx)<glMatrix.EPSILON&&Math.abs(eyey-centery)<glMatrix.EPSILON&&Math.abs(eyez-centerz)<glMatrix.EPSILON){return mat4.identity(out);}z0=eyex-centerx;z1=eyey-centery;z2=eyez-centerz;len=1/Math.sqrt(z0*z0+z1*z1+z2*z2);z0*=len;z1*=len;z2*=len;x0=upy*z2-upz*z1;x1=upz*z0-upx*z2;x2=upx*z1-upy*z0;len=Math.sqrt(x0*x0+x1*x1+x2*x2);if(!len){x0=0;x1=0;x2=0;}else {len=1/len;x0*=len;x1*=len;x2*=len;}y0=z1*x2-z2*x1;y1=z2*x0-z0*x2;y2=z0*x1-z1*x0;len=Math.sqrt(y0*y0+y1*y1+y2*y2);if(!len){y0=0;y1=0;y2=0;}else {len=1/len;y0*=len;y1*=len;y2*=len;}out[0]=x0;out[1]=y0;out[2]=z0;out[3]=0;out[4]=x1;out[5]=y1;out[6]=z1;out[7]=0;out[8]=x2;out[9]=y2;out[10]=z2;out[11]=0;out[12]=-(x0*eyex+x1*eyey+x2*eyez);out[13]=-(y0*eyex+y1*eyey+y2*eyez);out[14]=-(z0*eyex+z1*eyey+z2*eyez);out[15]=1;return out;}; /**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */mat4.str=function(a){return 'mat4('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+', '+a[4]+', '+a[5]+', '+a[6]+', '+a[7]+', '+a[8]+', '+a[9]+', '+a[10]+', '+a[11]+', '+a[12]+', '+a[13]+', '+a[14]+', '+a[15]+')';}; /**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */mat4.frob=function(a){return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+Math.pow(a[6],2)+Math.pow(a[7],2)+Math.pow(a[8],2)+Math.pow(a[9],2)+Math.pow(a[10],2)+Math.pow(a[11],2)+Math.pow(a[12],2)+Math.pow(a[13],2)+Math.pow(a[14],2)+Math.pow(a[15],2));};module.exports=mat4;},{"./common.js":2}],7:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js");var mat3=_dereq_("./mat3.js");var vec3=_dereq_("./vec3.js");var vec4=_dereq_("./vec4.js"); /**
 * @class Quaternion
 * @name quat
 */var quat={}; /**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */quat.create=function(){var out=new glMatrix.ARRAY_TYPE(4);out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;}; /**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */quat.rotationTo=function(){var tmpvec3=vec3.create();var xUnitVec3=vec3.fromValues(1,0,0);var yUnitVec3=vec3.fromValues(0,1,0);return function(out,a,b){var dot=vec3.dot(a,b);if(dot<-0.999999){vec3.cross(tmpvec3,xUnitVec3,a);if(vec3.length(tmpvec3)<0.000001)vec3.cross(tmpvec3,yUnitVec3,a);vec3.normalize(tmpvec3,tmpvec3);quat.setAxisAngle(out,tmpvec3,Math.PI);return out;}else if(dot>0.999999){out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;}else {vec3.cross(tmpvec3,a,b);out[0]=tmpvec3[0];out[1]=tmpvec3[1];out[2]=tmpvec3[2];out[3]=1+dot;return quat.normalize(out,out);}};}(); /**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */quat.setAxes=function(){var matr=mat3.create();return function(out,view,right,up){matr[0]=right[0];matr[3]=right[1];matr[6]=right[2];matr[1]=up[0];matr[4]=up[1];matr[7]=up[2];matr[2]=-view[0];matr[5]=-view[1];matr[8]=-view[2];return quat.normalize(out,quat.fromMat3(out,matr));};}(); /**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */quat.clone=vec4.clone; /**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */quat.fromValues=vec4.fromValues; /**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */quat.copy=vec4.copy; /**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */quat.set=vec4.set; /**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */quat.identity=function(out){out[0]=0;out[1]=0;out[2]=0;out[3]=1;return out;}; /**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/quat.setAxisAngle=function(out,axis,rad){rad=rad*0.5;var s=Math.sin(rad);out[0]=s*axis[0];out[1]=s*axis[1];out[2]=s*axis[2];out[3]=Math.cos(rad);return out;}; /**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */quat.add=vec4.add; /**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */quat.multiply=function(out,a,b){var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3];out[0]=ax*bw+aw*bx+ay*bz-az*by;out[1]=ay*bw+aw*by+az*bx-ax*bz;out[2]=az*bw+aw*bz+ax*by-ay*bx;out[3]=aw*bw-ax*bx-ay*by-az*bz;return out;}; /**
 * Alias for {@link quat.multiply}
 * @function
 */quat.mul=quat.multiply; /**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */quat.scale=vec4.scale; /**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */quat.rotateX=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw+aw*bx;out[1]=ay*bw+az*bx;out[2]=az*bw-ay*bx;out[3]=aw*bw-ax*bx;return out;}; /**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */quat.rotateY=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],by=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw-az*by;out[1]=ay*bw+aw*by;out[2]=az*bw+ax*by;out[3]=aw*bw-ay*by;return out;}; /**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */quat.rotateZ=function(out,a,rad){rad*=0.5;var ax=a[0],ay=a[1],az=a[2],aw=a[3],bz=Math.sin(rad),bw=Math.cos(rad);out[0]=ax*bw+ay*bz;out[1]=ay*bw-ax*bz;out[2]=az*bw+aw*bz;out[3]=aw*bw-az*bz;return out;}; /**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */quat.calculateW=function(out,a){var x=a[0],y=a[1],z=a[2];out[0]=x;out[1]=y;out[2]=z;out[3]=Math.sqrt(Math.abs(1.0-x*x-y*y-z*z));return out;}; /**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */quat.dot=vec4.dot; /**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */quat.lerp=vec4.lerp; /**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */quat.slerp=function(out,a,b,t){ // benchmarks:
//    http://jsperf.com/quaternion-slerp-implementations
var ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3];var omega,cosom,sinom,scale0,scale1; // calc cosine
cosom=ax*bx+ay*by+az*bz+aw*bw; // adjust signs (if necessary)
if(cosom<0.0){cosom=-cosom;bx=-bx;by=-by;bz=-bz;bw=-bw;} // calculate coefficients
if(1.0-cosom>0.000001){ // standard case (slerp)
omega=Math.acos(cosom);sinom=Math.sin(omega);scale0=Math.sin((1.0-t)*omega)/sinom;scale1=Math.sin(t*omega)/sinom;}else { // "from" and "to" quaternions are very close 
//  ... so we can do a linear interpolation
scale0=1.0-t;scale1=t;} // calculate final values
out[0]=scale0*ax+scale1*bx;out[1]=scale0*ay+scale1*by;out[2]=scale0*az+scale1*bz;out[3]=scale0*aw+scale1*bw;return out;}; /**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */quat.sqlerp=function(){var temp1=quat.create();var temp2=quat.create();return function(out,a,b,c,d,t){quat.slerp(temp1,a,d,t);quat.slerp(temp2,b,c,t);quat.slerp(out,temp1,temp2,2*t*(1-t));return out;};}(); /**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */quat.invert=function(out,a){var a0=a[0],a1=a[1],a2=a[2],a3=a[3],dot=a0*a0+a1*a1+a2*a2+a3*a3,invDot=dot?1.0/dot:0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
out[0]=-a0*invDot;out[1]=-a1*invDot;out[2]=-a2*invDot;out[3]=a3*invDot;return out;}; /**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */quat.conjugate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];out[3]=a[3];return out;}; /**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */quat.length=vec4.length; /**
 * Alias for {@link quat.length}
 * @function
 */quat.len=quat.length; /**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */quat.squaredLength=vec4.squaredLength; /**
 * Alias for {@link quat.squaredLength}
 * @function
 */quat.sqrLen=quat.squaredLength; /**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */quat.normalize=vec4.normalize; /**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */quat.fromMat3=function(out,m){ // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
// article "Quaternion Calculus and Fast Animation".
var fTrace=m[0]+m[4]+m[8];var fRoot;if(fTrace>0.0){ // |w| > 1/2, may as well choose w > 1/2
fRoot=Math.sqrt(fTrace+1.0); // 2w
out[3]=0.5*fRoot;fRoot=0.5/fRoot; // 1/(4w)
out[0]=(m[5]-m[7])*fRoot;out[1]=(m[6]-m[2])*fRoot;out[2]=(m[1]-m[3])*fRoot;}else { // |w| <= 1/2
var i=0;if(m[4]>m[0])i=1;if(m[8]>m[i*3+i])i=2;var j=(i+1)%3;var k=(i+2)%3;fRoot=Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k]+1.0);out[i]=0.5*fRoot;fRoot=0.5/fRoot;out[3]=(m[j*3+k]-m[k*3+j])*fRoot;out[j]=(m[j*3+i]+m[i*3+j])*fRoot;out[k]=(m[k*3+i]+m[i*3+k])*fRoot;}return out;}; /**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */quat.str=function(a){return 'quat('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';};module.exports=quat;},{"./common.js":2,"./mat3.js":5,"./vec3.js":9,"./vec4.js":10}],8:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 2 Dimensional Vector
 * @name vec2
 */var vec2={}; /**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */vec2.create=function(){var out=new glMatrix.ARRAY_TYPE(2);out[0]=0;out[1]=0;return out;}; /**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */vec2.clone=function(a){var out=new glMatrix.ARRAY_TYPE(2);out[0]=a[0];out[1]=a[1];return out;}; /**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */vec2.fromValues=function(x,y){var out=new glMatrix.ARRAY_TYPE(2);out[0]=x;out[1]=y;return out;}; /**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */vec2.copy=function(out,a){out[0]=a[0];out[1]=a[1];return out;}; /**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */vec2.set=function(out,x,y){out[0]=x;out[1]=y;return out;}; /**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];return out;}; /**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];return out;}; /**
 * Alias for {@link vec2.subtract}
 * @function
 */vec2.sub=vec2.subtract; /**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];return out;}; /**
 * Alias for {@link vec2.multiply}
 * @function
 */vec2.mul=vec2.multiply; /**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];return out;}; /**
 * Alias for {@link vec2.divide}
 * @function
 */vec2.div=vec2.divide; /**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);return out;}; /**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */vec2.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);return out;}; /**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */vec2.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;return out;}; /**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */vec2.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+b[0]*scale;out[1]=a[1]+b[1]*scale;return out;}; /**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */vec2.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1];return Math.sqrt(x*x+y*y);}; /**
 * Alias for {@link vec2.distance}
 * @function
 */vec2.dist=vec2.distance; /**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */vec2.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1];return x*x+y*y;}; /**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */vec2.sqrDist=vec2.squaredDistance; /**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */vec2.length=function(a){var x=a[0],y=a[1];return Math.sqrt(x*x+y*y);}; /**
 * Alias for {@link vec2.length}
 * @function
 */vec2.len=vec2.length; /**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */vec2.squaredLength=function(a){var x=a[0],y=a[1];return x*x+y*y;}; /**
 * Alias for {@link vec2.squaredLength}
 * @function
 */vec2.sqrLen=vec2.squaredLength; /**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */vec2.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];return out;}; /**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */vec2.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];return out;}; /**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */vec2.normalize=function(out,a){var x=a[0],y=a[1];var len=x*x+y*y;if(len>0){ //TODO: evaluate use of glm_invsqrt here?
len=1/Math.sqrt(len);out[0]=a[0]*len;out[1]=a[1]*len;}return out;}; /**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */vec2.dot=function(a,b){return a[0]*b[0]+a[1]*b[1];}; /**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */vec2.cross=function(out,a,b){var z=a[0]*b[1]-a[1]*b[0];out[0]=out[1]=0;out[2]=z;return out;}; /**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */vec2.lerp=function(out,a,b,t){var ax=a[0],ay=a[1];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);return out;}; /**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */vec2.random=function(out,scale){scale=scale||1.0;var r=glMatrix.RANDOM()*2.0*Math.PI;out[0]=Math.cos(r)*scale;out[1]=Math.sin(r)*scale;return out;}; /**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */vec2.transformMat2=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[2]*y;out[1]=m[1]*x+m[3]*y;return out;}; /**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */vec2.transformMat2d=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[2]*y+m[4];out[1]=m[1]*x+m[3]*y+m[5];return out;}; /**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */vec2.transformMat3=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[3]*y+m[6];out[1]=m[1]*x+m[4]*y+m[7];return out;}; /**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */vec2.transformMat4=function(out,a,m){var x=a[0],y=a[1];out[0]=m[0]*x+m[4]*y+m[12];out[1]=m[1]*x+m[5]*y+m[13];return out;}; /**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */vec2.forEach=function(){var vec=vec2.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=2;}if(!offset){offset=0;}if(count){l=Math.min(count*stride+offset,a.length);}else {l=a.length;}for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];}return a;};}(); /**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */vec2.str=function(a){return 'vec2('+a[0]+', '+a[1]+')';};module.exports=vec2;},{"./common.js":2}],9:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 3 Dimensional Vector
 * @name vec3
 */var vec3={}; /**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */vec3.create=function(){var out=new glMatrix.ARRAY_TYPE(3);out[0]=0;out[1]=0;out[2]=0;return out;}; /**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */vec3.clone=function(a){var out=new glMatrix.ARRAY_TYPE(3);out[0]=a[0];out[1]=a[1];out[2]=a[2];return out;}; /**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */vec3.fromValues=function(x,y,z){var out=new glMatrix.ARRAY_TYPE(3);out[0]=x;out[1]=y;out[2]=z;return out;}; /**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */vec3.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];return out;}; /**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */vec3.set=function(out,x,y,z){out[0]=x;out[1]=y;out[2]=z;return out;}; /**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];out[2]=a[2]+b[2];return out;}; /**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];out[2]=a[2]-b[2];return out;}; /**
 * Alias for {@link vec3.subtract}
 * @function
 */vec3.sub=vec3.subtract; /**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];out[2]=a[2]*b[2];return out;}; /**
 * Alias for {@link vec3.multiply}
 * @function
 */vec3.mul=vec3.multiply; /**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];out[2]=a[2]/b[2];return out;}; /**
 * Alias for {@link vec3.divide}
 * @function
 */vec3.div=vec3.divide; /**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);out[2]=Math.min(a[2],b[2]);return out;}; /**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);out[2]=Math.max(a[2],b[2]);return out;}; /**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */vec3.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;out[2]=a[2]*b;return out;}; /**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */vec3.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+b[0]*scale;out[1]=a[1]+b[1]*scale;out[2]=a[2]+b[2]*scale;return out;}; /**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */vec3.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2];return Math.sqrt(x*x+y*y+z*z);}; /**
 * Alias for {@link vec3.distance}
 * @function
 */vec3.dist=vec3.distance; /**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */vec3.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2];return x*x+y*y+z*z;}; /**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */vec3.sqrDist=vec3.squaredDistance; /**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */vec3.length=function(a){var x=a[0],y=a[1],z=a[2];return Math.sqrt(x*x+y*y+z*z);}; /**
 * Alias for {@link vec3.length}
 * @function
 */vec3.len=vec3.length; /**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */vec3.squaredLength=function(a){var x=a[0],y=a[1],z=a[2];return x*x+y*y+z*z;}; /**
 * Alias for {@link vec3.squaredLength}
 * @function
 */vec3.sqrLen=vec3.squaredLength; /**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */vec3.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];return out;}; /**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */vec3.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];out[2]=1.0/a[2];return out;}; /**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */vec3.normalize=function(out,a){var x=a[0],y=a[1],z=a[2];var len=x*x+y*y+z*z;if(len>0){ //TODO: evaluate use of glm_invsqrt here?
len=1/Math.sqrt(len);out[0]=a[0]*len;out[1]=a[1]*len;out[2]=a[2]*len;}return out;}; /**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}; /**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */vec3.cross=function(out,a,b){var ax=a[0],ay=a[1],az=a[2],bx=b[0],by=b[1],bz=b[2];out[0]=ay*bz-az*by;out[1]=az*bx-ax*bz;out[2]=ax*by-ay*bx;return out;}; /**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */vec3.lerp=function(out,a,b,t){var ax=a[0],ay=a[1],az=a[2];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);out[2]=az+t*(b[2]-az);return out;}; /**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */vec3.hermite=function(out,a,b,c,d,t){var factorTimes2=t*t,factor1=factorTimes2*(2*t-3)+1,factor2=factorTimes2*(t-2)+t,factor3=factorTimes2*(t-1),factor4=factorTimes2*(3-2*t);out[0]=a[0]*factor1+b[0]*factor2+c[0]*factor3+d[0]*factor4;out[1]=a[1]*factor1+b[1]*factor2+c[1]*factor3+d[1]*factor4;out[2]=a[2]*factor1+b[2]*factor2+c[2]*factor3+d[2]*factor4;return out;}; /**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */vec3.bezier=function(out,a,b,c,d,t){var inverseFactor=1-t,inverseFactorTimesTwo=inverseFactor*inverseFactor,factorTimes2=t*t,factor1=inverseFactorTimesTwo*inverseFactor,factor2=3*t*inverseFactorTimesTwo,factor3=3*factorTimes2*inverseFactor,factor4=factorTimes2*t;out[0]=a[0]*factor1+b[0]*factor2+c[0]*factor3+d[0]*factor4;out[1]=a[1]*factor1+b[1]*factor2+c[1]*factor3+d[1]*factor4;out[2]=a[2]*factor1+b[2]*factor2+c[2]*factor3+d[2]*factor4;return out;}; /**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */vec3.random=function(out,scale){scale=scale||1.0;var r=glMatrix.RANDOM()*2.0*Math.PI;var z=glMatrix.RANDOM()*2.0-1.0;var zScale=Math.sqrt(1.0-z*z)*scale;out[0]=Math.cos(r)*zScale;out[1]=Math.sin(r)*zScale;out[2]=z*scale;return out;}; /**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */vec3.transformMat4=function(out,a,m){var x=a[0],y=a[1],z=a[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];w=w||1.0;out[0]=(m[0]*x+m[4]*y+m[8]*z+m[12])/w;out[1]=(m[1]*x+m[5]*y+m[9]*z+m[13])/w;out[2]=(m[2]*x+m[6]*y+m[10]*z+m[14])/w;return out;}; /**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */vec3.transformMat3=function(out,a,m){var x=a[0],y=a[1],z=a[2];out[0]=x*m[0]+y*m[3]+z*m[6];out[1]=x*m[1]+y*m[4]+z*m[7];out[2]=x*m[2]+y*m[5]+z*m[8];return out;}; /**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */vec3.transformQuat=function(out,a,q){ // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
var x=a[0],y=a[1],z=a[2],qx=q[0],qy=q[1],qz=q[2],qw=q[3], // calculate quat * vec
ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z; // calculate result * inverse quat
out[0]=ix*qw+iw*-qx+iy*-qz-iz*-qy;out[1]=iy*qw+iw*-qy+iz*-qx-ix*-qz;out[2]=iz*qw+iw*-qz+ix*-qy-iy*-qx;return out;}; /**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */vec3.rotateX=function(out,a,b,c){var p=[],r=[]; //Translate point to the origin
p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2]; //perform rotation
r[0]=p[0];r[1]=p[1]*Math.cos(c)-p[2]*Math.sin(c);r[2]=p[1]*Math.sin(c)+p[2]*Math.cos(c); //translate to correct position
out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;}; /**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */vec3.rotateY=function(out,a,b,c){var p=[],r=[]; //Translate point to the origin
p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2]; //perform rotation
r[0]=p[2]*Math.sin(c)+p[0]*Math.cos(c);r[1]=p[1];r[2]=p[2]*Math.cos(c)-p[0]*Math.sin(c); //translate to correct position
out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;}; /**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */vec3.rotateZ=function(out,a,b,c){var p=[],r=[]; //Translate point to the origin
p[0]=a[0]-b[0];p[1]=a[1]-b[1];p[2]=a[2]-b[2]; //perform rotation
r[0]=p[0]*Math.cos(c)-p[1]*Math.sin(c);r[1]=p[0]*Math.sin(c)+p[1]*Math.cos(c);r[2]=p[2]; //translate to correct position
out[0]=r[0]+b[0];out[1]=r[1]+b[1];out[2]=r[2]+b[2];return out;}; /**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */vec3.forEach=function(){var vec=vec3.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=3;}if(!offset){offset=0;}if(count){l=Math.min(count*stride+offset,a.length);}else {l=a.length;}for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];vec[2]=a[i+2];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];a[i+2]=vec[2];}return a;};}(); /**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */vec3.angle=function(a,b){var tempA=vec3.fromValues(a[0],a[1],a[2]);var tempB=vec3.fromValues(b[0],b[1],b[2]);vec3.normalize(tempA,tempA);vec3.normalize(tempB,tempB);var cosine=vec3.dot(tempA,tempB);if(cosine>1.0){return 0;}else {return Math.acos(cosine);}}; /**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */vec3.str=function(a){return 'vec3('+a[0]+', '+a[1]+', '+a[2]+')';};module.exports=vec3;},{"./common.js":2}],10:[function(_dereq_,module,exports){ /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */var glMatrix=_dereq_("./common.js"); /**
 * @class 4 Dimensional Vector
 * @name vec4
 */var vec4={}; /**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */vec4.create=function(){var out=new glMatrix.ARRAY_TYPE(4);out[0]=0;out[1]=0;out[2]=0;out[3]=0;return out;}; /**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */vec4.clone=function(a){var out=new glMatrix.ARRAY_TYPE(4);out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;}; /**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */vec4.fromValues=function(x,y,z,w){var out=new glMatrix.ARRAY_TYPE(4);out[0]=x;out[1]=y;out[2]=z;out[3]=w;return out;}; /**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */vec4.copy=function(out,a){out[0]=a[0];out[1]=a[1];out[2]=a[2];out[3]=a[3];return out;}; /**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */vec4.set=function(out,x,y,z,w){out[0]=x;out[1]=y;out[2]=z;out[3]=w;return out;}; /**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.add=function(out,a,b){out[0]=a[0]+b[0];out[1]=a[1]+b[1];out[2]=a[2]+b[2];out[3]=a[3]+b[3];return out;}; /**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.subtract=function(out,a,b){out[0]=a[0]-b[0];out[1]=a[1]-b[1];out[2]=a[2]-b[2];out[3]=a[3]-b[3];return out;}; /**
 * Alias for {@link vec4.subtract}
 * @function
 */vec4.sub=vec4.subtract; /**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.multiply=function(out,a,b){out[0]=a[0]*b[0];out[1]=a[1]*b[1];out[2]=a[2]*b[2];out[3]=a[3]*b[3];return out;}; /**
 * Alias for {@link vec4.multiply}
 * @function
 */vec4.mul=vec4.multiply; /**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.divide=function(out,a,b){out[0]=a[0]/b[0];out[1]=a[1]/b[1];out[2]=a[2]/b[2];out[3]=a[3]/b[3];return out;}; /**
 * Alias for {@link vec4.divide}
 * @function
 */vec4.div=vec4.divide; /**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.min=function(out,a,b){out[0]=Math.min(a[0],b[0]);out[1]=Math.min(a[1],b[1]);out[2]=Math.min(a[2],b[2]);out[3]=Math.min(a[3],b[3]);return out;}; /**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */vec4.max=function(out,a,b){out[0]=Math.max(a[0],b[0]);out[1]=Math.max(a[1],b[1]);out[2]=Math.max(a[2],b[2]);out[3]=Math.max(a[3],b[3]);return out;}; /**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */vec4.scale=function(out,a,b){out[0]=a[0]*b;out[1]=a[1]*b;out[2]=a[2]*b;out[3]=a[3]*b;return out;}; /**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */vec4.scaleAndAdd=function(out,a,b,scale){out[0]=a[0]+b[0]*scale;out[1]=a[1]+b[1]*scale;out[2]=a[2]+b[2]*scale;out[3]=a[3]+b[3]*scale;return out;}; /**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */vec4.distance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],w=b[3]-a[3];return Math.sqrt(x*x+y*y+z*z+w*w);}; /**
 * Alias for {@link vec4.distance}
 * @function
 */vec4.dist=vec4.distance; /**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */vec4.squaredDistance=function(a,b){var x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],w=b[3]-a[3];return x*x+y*y+z*z+w*w;}; /**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */vec4.sqrDist=vec4.squaredDistance; /**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */vec4.length=function(a){var x=a[0],y=a[1],z=a[2],w=a[3];return Math.sqrt(x*x+y*y+z*z+w*w);}; /**
 * Alias for {@link vec4.length}
 * @function
 */vec4.len=vec4.length; /**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */vec4.squaredLength=function(a){var x=a[0],y=a[1],z=a[2],w=a[3];return x*x+y*y+z*z+w*w;}; /**
 * Alias for {@link vec4.squaredLength}
 * @function
 */vec4.sqrLen=vec4.squaredLength; /**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */vec4.negate=function(out,a){out[0]=-a[0];out[1]=-a[1];out[2]=-a[2];out[3]=-a[3];return out;}; /**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */vec4.inverse=function(out,a){out[0]=1.0/a[0];out[1]=1.0/a[1];out[2]=1.0/a[2];out[3]=1.0/a[3];return out;}; /**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */vec4.normalize=function(out,a){var x=a[0],y=a[1],z=a[2],w=a[3];var len=x*x+y*y+z*z+w*w;if(len>0){len=1/Math.sqrt(len);out[0]=x*len;out[1]=y*len;out[2]=z*len;out[3]=w*len;}return out;}; /**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */vec4.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];}; /**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */vec4.lerp=function(out,a,b,t){var ax=a[0],ay=a[1],az=a[2],aw=a[3];out[0]=ax+t*(b[0]-ax);out[1]=ay+t*(b[1]-ay);out[2]=az+t*(b[2]-az);out[3]=aw+t*(b[3]-aw);return out;}; /**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */vec4.random=function(out,scale){scale=scale||1.0; //TODO: This is a pretty awful way of doing this. Find something better.
out[0]=glMatrix.RANDOM();out[1]=glMatrix.RANDOM();out[2]=glMatrix.RANDOM();out[3]=glMatrix.RANDOM();vec4.normalize(out,out);vec4.scale(out,out,scale);return out;}; /**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */vec4.transformMat4=function(out,a,m){var x=a[0],y=a[1],z=a[2],w=a[3];out[0]=m[0]*x+m[4]*y+m[8]*z+m[12]*w;out[1]=m[1]*x+m[5]*y+m[9]*z+m[13]*w;out[2]=m[2]*x+m[6]*y+m[10]*z+m[14]*w;out[3]=m[3]*x+m[7]*y+m[11]*z+m[15]*w;return out;}; /**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */vec4.transformQuat=function(out,a,q){var x=a[0],y=a[1],z=a[2],qx=q[0],qy=q[1],qz=q[2],qw=q[3], // calculate quat * vec
ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z; // calculate result * inverse quat
out[0]=ix*qw+iw*-qx+iy*-qz-iz*-qy;out[1]=iy*qw+iw*-qy+iz*-qx-ix*-qz;out[2]=iz*qw+iw*-qz+ix*-qy-iy*-qx;out[3]=a[3];return out;}; /**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */vec4.forEach=function(){var vec=vec4.create();return function(a,stride,offset,count,fn,arg){var i,l;if(!stride){stride=4;}if(!offset){offset=0;}if(count){l=Math.min(count*stride+offset,a.length);}else {l=a.length;}for(i=offset;i<l;i+=stride){vec[0]=a[i];vec[1]=a[i+1];vec[2]=a[i+2];vec[3]=a[i+3];fn(vec,vec,arg);a[i]=vec[0];a[i+1]=vec[1];a[i+2]=vec[2];a[i+3]=vec[3];}return a;};}(); /**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */vec4.str=function(a){return 'vec4('+a[0]+', '+a[1]+', '+a[2]+', '+a[3]+')';};module.exports=vec4;},{"./common.js":2}],11:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // alfrid.js
//	TOOLS
//	CAMERAS
//	LOADERS
//	HELPERS
var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);var _GLTool=_dereq_('./alfrid/GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _GLShader=_dereq_('./alfrid/GLShader');var _GLShader2=_interopRequireDefault(_GLShader);var _GLTexture=_dereq_('./alfrid/GLTexture');var _GLTexture2=_interopRequireDefault(_GLTexture);var _GLCubeTexture=_dereq_('./alfrid/GLCubeTexture');var _GLCubeTexture2=_interopRequireDefault(_GLCubeTexture);var _Mesh=_dereq_('./alfrid/Mesh');var _Mesh2=_interopRequireDefault(_Mesh);var _Geom=_dereq_('./alfrid/Geom');var _Geom2=_interopRequireDefault(_Geom);var _Batch=_dereq_('./alfrid/Batch');var _Batch2=_interopRequireDefault(_Batch);var _FrameBuffer=_dereq_('./alfrid/FrameBuffer');var _FrameBuffer2=_interopRequireDefault(_FrameBuffer);var _CubeFrameBuffer=_dereq_('./alfrid/CubeFrameBuffer');var _CubeFrameBuffer2=_interopRequireDefault(_CubeFrameBuffer);var _Scheduler=_dereq_('./alfrid/tools/Scheduler');var _Scheduler2=_interopRequireDefault(_Scheduler);var _EventDispatcher=_dereq_('./alfrid/tools/EventDispatcher');var _EventDispatcher2=_interopRequireDefault(_EventDispatcher);var _EaseNumber=_dereq_('./alfrid/tools/EaseNumber');var _EaseNumber2=_interopRequireDefault(_EaseNumber);var _OrbitalControl=_dereq_('./alfrid/tools/OrbitalControl');var _OrbitalControl2=_interopRequireDefault(_OrbitalControl);var _QuatRotation=_dereq_('./alfrid/tools/QuatRotation');var _QuatRotation2=_interopRequireDefault(_QuatRotation);var _Camera=_dereq_('./alfrid/cameras/Camera');var _Camera2=_interopRequireDefault(_Camera);var _CameraOrtho=_dereq_('./alfrid/cameras/CameraOrtho');var _CameraOrtho2=_interopRequireDefault(_CameraOrtho);var _CameraPerspective=_dereq_('./alfrid/cameras/CameraPerspective');var _CameraPerspective2=_interopRequireDefault(_CameraPerspective);var _CameraCube=_dereq_('./alfrid/cameras/CameraCube');var _CameraCube2=_interopRequireDefault(_CameraCube);var _BinaryLoader=_dereq_('./alfrid/loaders/BinaryLoader');var _BinaryLoader2=_interopRequireDefault(_BinaryLoader);var _ObjLoader=_dereq_('./alfrid/loaders/ObjLoader');var _ObjLoader2=_interopRequireDefault(_ObjLoader);var _HDRLoader=_dereq_('./alfrid/loaders/HDRLoader');var _HDRLoader2=_interopRequireDefault(_HDRLoader);var _BatchCopy=_dereq_('./alfrid/helpers/BatchCopy');var _BatchCopy2=_interopRequireDefault(_BatchCopy);var _BatchAxis=_dereq_('./alfrid/helpers/BatchAxis');var _BatchAxis2=_interopRequireDefault(_BatchAxis);var _BatchDotsPlane=_dereq_('./alfrid/helpers/BatchDotsPlane');var _BatchDotsPlane2=_interopRequireDefault(_BatchDotsPlane);var _Scene=_dereq_('./alfrid/helpers/Scene');var _Scene2=_interopRequireDefault(_Scene);var _View=_dereq_('./alfrid/helpers/View');var _View2=_interopRequireDefault(_View);var _ShaderLibs=_dereq_('./alfrid/tools/ShaderLibs');var _ShaderLibs2=_interopRequireDefault(_ShaderLibs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var VERSION='1.0.0';var alfrid=function(){function alfrid(){_classCallCheck(this,alfrid);this.glm=_glMatrix2.default;this.GL=_GLTool2.default;this.GLTool=_GLTool2.default;this.GLShader=_GLShader2.default;this.GLTexture=_GLTexture2.default;this.GLCubeTexture=_GLCubeTexture2.default;this.Mesh=_Mesh2.default;this.Geom=_Geom2.default;this.Batch=_Batch2.default;this.FrameBuffer=_FrameBuffer2.default;this.CubeFrameBuffer=_CubeFrameBuffer2.default;this.Scheduler=_Scheduler2.default;this.EventDispatcher=_EventDispatcher2.default;this.EaseNumber=_EaseNumber2.default;this.Camera=_Camera2.default;this.CameraOrtho=_CameraOrtho2.default;this.CameraPerspective=_CameraPerspective2.default;this.CameraCube=_CameraCube2.default;this.OrbitalControl=_OrbitalControl2.default;this.QuatRotation=_QuatRotation2.default;this.BinaryLoader=_BinaryLoader2.default;this.ObjLoader=_ObjLoader2.default;this.HDRLoader=_HDRLoader2.default;this.BatchCopy=_BatchCopy2.default;this.BatchAxis=_BatchAxis2.default;this.BatchDotsPlane=_BatchDotsPlane2.default;this.Scene=_Scene2.default;this.View=_View2.default;this.ShaderLibs=_ShaderLibs2.default; //	NOT SUPER SURE I'VE DONE THIS IS A GOOD WAY
for(var s in _glMatrix2.default){if(_glMatrix2.default[s]){window[s]=_glMatrix2.default[s];}} //	TESTING CODES
}_createClass(alfrid,[{key:'log',value:function log(){if(navigator.userAgent.indexOf('Chrome')>-1){console.log('%clib alfrid : VERSION '+VERSION,'background: #193441; color: #FCFFF5');}else {console.log('lib alfrid : VERSION ',VERSION);}console.log('%cClasses : ','color: #193441');for(var s in this){if(this[s]){console.log('%c - '+s,'color: #3E606F');}}}}]);return alfrid;}();var b=new alfrid();module.exports=b;},{"./alfrid/Batch":12,"./alfrid/CubeFrameBuffer":13,"./alfrid/FrameBuffer":14,"./alfrid/GLCubeTexture":15,"./alfrid/GLShader":16,"./alfrid/GLTexture":17,"./alfrid/GLTool":18,"./alfrid/Geom":19,"./alfrid/Mesh":20,"./alfrid/cameras/Camera":21,"./alfrid/cameras/CameraCube":22,"./alfrid/cameras/CameraOrtho":23,"./alfrid/cameras/CameraPerspective":24,"./alfrid/helpers/BatchAxis":25,"./alfrid/helpers/BatchCopy":26,"./alfrid/helpers/BatchDotsPlane":27,"./alfrid/helpers/Scene":28,"./alfrid/helpers/View":29,"./alfrid/loaders/BinaryLoader":30,"./alfrid/loaders/HDRLoader":31,"./alfrid/loaders/ObjLoader":32,"./alfrid/tools/EaseNumber":33,"./alfrid/tools/EventDispatcher":34,"./alfrid/tools/OrbitalControl":36,"./alfrid/tools/QuatRotation":37,"./alfrid/tools/Scheduler":38,"./alfrid/tools/ShaderLibs":39,"gl-matrix":1}],12:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // Batch.js
Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Batch=function(){function Batch(mMesh,mShader){_classCallCheck(this,Batch);this._mesh=mMesh;this._shader=mShader;} //	PUBLIC METHODS
_createClass(Batch,[{key:'draw',value:function draw(){this._shader.bind();_GLTool2.default.draw(this.mesh);} //	GETTER AND SETTER
},{key:'mesh',get:function get(){return this._mesh;}},{key:'shader',get:function get(){return this._shader;}}]);return Batch;}();exports.default=Batch;},{"./GLTool":18}],13:[function(_dereq_,module,exports){ // CubeFrameBuffer.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _GLCubeTexture=_dereq_('./GLCubeTexture');var _GLCubeTexture2=_interopRequireDefault(_GLCubeTexture);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var gl=undefined;var CubeFrameBuffer=function(){function CubeFrameBuffer(size){var mParameters=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];_classCallCheck(this,CubeFrameBuffer);gl=_GLTool2.default.gl;this._size=size;this.magFilter=mParameters.magFilter||gl.LINEAR;this.minFilter=mParameters.minFilter||gl.LINEAR;this.wrapS=mParameters.wrapS||gl.CLAMP_TO_EDGE;this.wrapT=mParameters.wrapT||gl.CLAMP_TO_EDGE;this._init();}_createClass(CubeFrameBuffer,[{key:'_init',value:function _init(){this.texture=gl.createTexture();this.glTexture=new _GLCubeTexture2.default(this.texture,{},true);gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.texture);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,this.minFilter);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S,this.wrapS);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T,this.wrapT);var targets=[gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];for(var i=0;i<targets.length;i++){gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(targets[i],0,gl.RGBA,this.width,this.height,0,gl.RGBA,gl.FLOAT,null);}this._frameBuffers=[];for(var i=0;i<targets.length;i++){var frameBuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,targets[i],this.texture,0);var status=gl.checkFramebufferStatus(gl.FRAMEBUFFER);if(status!==gl.FRAMEBUFFER_COMPLETE){console.log('gl.checkFramebufferStatus() returned '+status);}this._frameBuffers.push(frameBuffer);} // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);}},{key:'bind',value:function bind(mTargetIndex){ // if(Math.random() > .99) console.log('bind :', mTargetIndex, this._frameBuffers[mTargetIndex]);
_GLTool2.default.viewport(0,0,this.width,this.height);gl.bindFramebuffer(gl.FRAMEBUFFER,this._frameBuffers[mTargetIndex]);}},{key:'unbind',value:function unbind(){gl.bindFramebuffer(gl.FRAMEBUFFER,null);_GLTool2.default.viewport(0,0,_GLTool2.default.width,_GLTool2.default.height);} //	TEXTURES
},{key:'getTexture',value:function getTexture(){return this.glTexture;} //	GETTERS AND SETTERS
},{key:'width',get:function get(){return this._size;}},{key:'height',get:function get(){return this._size;}}]);return CubeFrameBuffer;}();exports.default=CubeFrameBuffer;},{"./GLCubeTexture":15,"./GLTool":18}],14:[function(_dereq_,module,exports){ // FrameBuffer.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _GLTexture=_dereq_('./GLTexture');var _GLTexture2=_interopRequireDefault(_GLTexture);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var isPowerOfTwo=function isPowerOfTwo(x){return x!==0&&!(x&x-1);};var gl=undefined;var WEBGL_depth_texture=undefined;var FrameBuffer=function(){function FrameBuffer(mWidth,mHeight){var mParameters=arguments.length<=2||arguments[2]===undefined?{}:arguments[2];_classCallCheck(this,FrameBuffer);gl=_GLTool2.default.gl;WEBGL_depth_texture=_GLTool2.default.checkExtension('WEBGL_depth_texture');this.width=mWidth;this.height=mHeight;this.magFilter=mParameters.magFilter||gl.LINEAR;this.minFilter=mParameters.minFilter||gl.LINEAR;this.wrapS=mParameters.wrapS||gl.CLAMP_TO_EDGE;this.wrapT=mParameters.wrapT||gl.CLAMP_TO_EDGE;this.useDepth=mParameters.useDepth||true;this.useStencil=mParameters.useStencil||false;if(!isPowerOfTwo(this.width)||!isPowerOfTwo(this.height)){this.wrapS=this.wrapT=gl.CLAMP_TO_EDGE;if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){this.minFilter=gl.LINEAR;}}this._init();}_createClass(FrameBuffer,[{key:'_init',value:function _init(){this.texture=gl.createTexture();this.glTexture=new _GLTexture2.default(this.texture,true);this.depthTexture=gl.createTexture();this.glDepthTexture=new _GLTexture2.default(this.depthTexture,true);this.frameBuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.frameBuffer); //	SETUP TEXTURE MIPMAP, WRAP
gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,this.minFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,this.wrapS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,this.wrapT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.width,this.height,0,gl.RGBA,gl.FLOAT,null);if(WEBGL_depth_texture){gl.bindTexture(gl.TEXTURE_2D,this.depthTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,this.minFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,this.wrapS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,this.wrapT);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,this.width,this.height,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_SHORT,null);} //	GET COLOUR
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0); //	GET DEPTH
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,this.depthTexture,0);if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.generateMipmap(gl.TEXTURE_2D);} //	UNBIND
gl.bindTexture(gl.TEXTURE_2D,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);} //	PUBLIC METHODS
},{key:'bind',value:function bind(){_GLTool2.default.viewport(0,0,this.width,this.height);gl.bindFramebuffer(gl.FRAMEBUFFER,this.frameBuffer);}},{key:'unbind',value:function unbind(){gl.bindFramebuffer(gl.FRAMEBUFFER,null);_GLTool2.default.viewport(0,0,_GLTool2.default.width,_GLTool2.default.height);} //	TEXTURES
},{key:'getTexture',value:function getTexture(){return this.glTexture;}},{key:'getDepthTexture',value:function getDepthTexture(){return this.glDepthTexture;} //	MIPMAP FILTER
},{key:'minFilter',value:function minFilter(mValue){if(mValue!==gl.LINEAR&&mValue!==gl.NEAREST&&mValue!==gl.LINEAR_MIPMAP_NEAREST){return this;}this.minFilter=mValue;return this;}},{key:'magFilter',value:function magFilter(mValue){if(mValue!==gl.LINEAR&&mValue!==gl.NEAREST&&mValue!==gl.LINEAR_MIPMAP_NEAREST){return this;}this.magFilter=mValue;return this;} //	WRAP
},{key:'wrapS',value:function wrapS(mValue){if(mValue!==gl.CLAMP_TO_EDGE&&mValue!==gl.REPEAT&&mValue!==gl.MIRRORED_REPEAT){return this;}this.wrapS=mValue;return this;}},{key:'wrapT',value:function wrapT(mValue){if(mValue!==gl.CLAMP_TO_EDGE&&mValue!==gl.REPEAT&&mValue!==gl.MIRRORED_REPEAT){return this;}this.wrapT=mValue;return this;}}]);return FrameBuffer;}();exports.default=FrameBuffer;},{"./GLTexture":17,"./GLTool":18}],15:[function(_dereq_,module,exports){ // GLCubeTexture.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var gl=undefined;var GLCubeTexture=function(){function GLCubeTexture(mSource){var mParameters=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];var isCubeTexture=arguments.length<=2||arguments[2]===undefined?false:arguments[2];_classCallCheck(this,GLCubeTexture); // console.log(typeof(mSource));
gl=_GLTool2.default.gl;if(isCubeTexture){this.texture=mSource;return;}this.texture=gl.createTexture();this.magFilter=mParameters.magFilter||gl.LINEAR;this.minFilter=mParameters.minFilter||gl.LINEAR_MIPMAP_NEAREST;this.wrapS=mParameters.wrapS||gl.CLAMP_TO_EDGE;this.wrapT=mParameters.wrapT||gl.CLAMP_TO_EDGE;gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.texture);var targets=[gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];for(var j=0;j<6;j++){gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); // gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mSource[j]);	
if(mSource[j].exposure){gl.texImage2D(targets[j],0,gl.RGBA,mSource[j].shape[0],mSource[j].shape[1],0,gl.RGBA,gl.FLOAT,mSource[j].data);}else {gl.texImage2D(targets[j],0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mSource[j]);}gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S,this.wrapS);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T,this.wrapT);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,this.minFilter);}gl.generateMipmap(gl.TEXTURE_CUBE_MAP);gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);} //	PUBLIC METHOD
_createClass(GLCubeTexture,[{key:'bind',value:function bind(){var index=arguments.length<=0||arguments[0]===undefined?0:arguments[0];if(!_GLTool2.default.shader){return;}gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.texture);gl.uniform1i(_GLTool2.default.shader.uniformTextures[index],index);this._bindIndex=index;}},{key:'unbind',value:function unbind(){gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);}}]);return GLCubeTexture;}();exports.default=GLCubeTexture;},{"./GLTool":18}],16:[function(_dereq_,module,exports){ // GLShader.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var addLineNumbers=function addLineNumbers(string){var lines=string.split('\n');for(var i=0;i<lines.length;i++){lines[i]=i+1+': '+lines[i];}return lines.join('\n');};var gl=undefined;var defaultVertexShader="#define GLSLIFY 1\n// basic.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n}";var defaultFragmentShader="#define GLSLIFY 1\n// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision highp float;\nvarying vec2 vTextureCoord;\nuniform float time;\n// uniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}";var GLShader=function(){function GLShader(){var strVertexShader=arguments.length<=0||arguments[0]===undefined?defaultVertexShader:arguments[0];var strFragmentShader=arguments.length<=1||arguments[1]===undefined?defaultFragmentShader:arguments[1];_classCallCheck(this,GLShader);gl=_GLTool2.default.gl;this.parameters=[];this.uniformValues={};this.uniformTextures=[];if(!strVertexShader){strVertexShader=defaultVertexShader;}if(!strFragmentShader){strFragmentShader=defaultVertexShader;}var vsShader=this._createShaderProgram(strVertexShader,true);var fsShader=this._createShaderProgram(strFragmentShader,false);this._attachShaderProgram(vsShader,fsShader);}_createClass(GLShader,[{key:'bind',value:function bind(){gl.useProgram(this.shaderProgram);_GLTool2.default.useShader(this);this.uniformTextures=[];}},{key:'uniform',value:function uniform(mName,mType,mValue){var hasUniform=false;var oUniform=undefined;for(var i=0;i<this.parameters.length;i++){oUniform=this.parameters[i];if(oUniform.name===mName){oUniform.value=mValue;hasUniform=true;break;}}if(!hasUniform){this.shaderProgram[mName]=gl.getUniformLocation(this.shaderProgram,mName);this.parameters.push({name:mName,type:mType,value:mValue,uniformLoc:this.shaderProgram[mName]});}else {this.shaderProgram[mName]=oUniform.uniformLoc;}if(mType.indexOf('Matrix')===-1){gl[mType](this.shaderProgram[mName],mValue);}else {gl[mType](this.shaderProgram[mName],false,mValue);this.uniformValues[mName]=mValue;}}},{key:'_createShaderProgram',value:function _createShaderProgram(mShaderStr,isVertexShader){var shaderType=isVertexShader?_GLTool2.default.VERTEX_SHADER:_GLTool2.default.FRAGMENT_SHADER;var shader=gl.createShader(shaderType);gl.shaderSource(shader,mShaderStr);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.warn('Error in Shader : ',gl.getShaderInfoLog(shader));console.log(addLineNumbers(mShaderStr));return null;}return shader;}},{key:'_attachShaderProgram',value:function _attachShaderProgram(mVertexShader,mFragmentShader){this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,mVertexShader);gl.attachShader(this.shaderProgram,mFragmentShader);gl.linkProgram(this.shaderProgram);}}]);return GLShader;}();exports.default=GLShader;},{"./GLTool":18}],17:[function(_dereq_,module,exports){ // GLTexture.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var isPowerOfTwo=function isPowerOfTwo(x){return x!==0&&!(x&x-1);};var isSourcePowerOfTwo=function isSourcePowerOfTwo(obj){var w=obj.width||obj.videoWidth;var h=obj.height||obj.videoHeight;if(!w||!h){return false;}return isPowerOfTwo(w)&&isPowerOfTwo(h);};var gl=undefined;var GLTexture=function(){function GLTexture(mSource){var isTexture=arguments.length<=1||arguments[1]===undefined?false:arguments[1];var mParameters=arguments.length<=2||arguments[2]===undefined?{}:arguments[2];_classCallCheck(this,GLTexture);gl=_GLTool2.default.gl;if(isTexture){this.texture=mSource;}else {this._mSource=mSource;this.texture=gl.createTexture();this._isVideo=mSource.tagName==='VIDEO';this.magFilter=mParameters.magFilter||gl.LINEAR;this.minFilter=mParameters.minFilter||gl.LINEAR_MIPMAP_NEAREST;this.wrapS=mParameters.wrapS||gl.MIRRORED_REPEAT;this.wrapT=mParameters.wrapT||gl.MIRRORED_REPEAT;var width=mSource.width||mSource.videoWidth;if(width){if(!isSourcePowerOfTwo(mSource)){this.wrapS=this.wrapT=gl.CLAMP_TO_EDGE;if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){this.minFilter=gl.LINEAR;}}}else {this.wrapS=this.wrapT=gl.CLAMP_TO_EDGE;if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){this.minFilter=gl.LINEAR;}}gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);if(mSource.exposure){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,mSource.shape[0],mSource.shape[1],0,gl.RGBA,gl.FLOAT,mSource.data);}else {gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mSource);}gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,this.minFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,this.wrapS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,this.wrapT);if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){gl.generateMipmap(gl.TEXTURE_2D);}gl.bindTexture(gl.TEXTURE_2D,null);}} //	MIPMAP FILTER
_createClass(GLTexture,[{key:'minFilter',value:function minFilter(mValue){if(mValue!==gl.LINEAR&&mValue!==gl.NEAREST&&mValue!==gl.LINEAR_MIPMAP_NEAREST){return this;}this.minFilter=mValue;return this;}},{key:'magFilter',value:function magFilter(mValue){if(mValue!==gl.LINEAR&&mValue!==gl.NEAREST&&mValue!==gl.LINEAR_MIPMAP_NEAREST){return this;}this.magFilter=mValue;return this;} //	WRAP
},{key:'wrapS',value:function wrapS(mValue){if(mValue!==gl.CLAMP_TO_EDGE&&mValue!==gl.REPEAT&&mValue!==gl.MIRRORED_REPEAT){return this;}this.wrapS=mValue;return this;}},{key:'wrapT',value:function wrapT(mValue){if(mValue!==gl.CLAMP_TO_EDGE&&mValue!==gl.REPEAT&&mValue!==gl.MIRRORED_REPEAT){return this;}this.wrapT=mValue;return this;} //	UPDATE TEXTURE
},{key:'updateTexture',value:function updateTexture(mSource){if(mSource){this._mSource=mSource;}gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this._mSource);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,this.magFilter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,this.minFilter);if(this.minFilter===gl.LINEAR_MIPMAP_NEAREST){gl.generateMipmap(gl.TEXTURE_2D);}gl.bindTexture(gl.TEXTURE_2D,null);}},{key:'bind',value:function bind(index){if(index===undefined){index=0;}if(!_GLTool2.default.shader){return;}gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(_GLTool2.default.shader.uniformTextures[index],index);this._bindIndex=index;}}]);return GLTexture;}();exports.default=GLTexture;},{"./GLTool":18}],18:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // GLTool.js
Object.defineProperty(exports,"__esModule",{value:true});var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var GLTool=function(){function GLTool(){_classCallCheck(this,GLTool);this.canvas;this._viewport=[0,0,0,0];this._enabledVertexAttribute=[];this.identityMatrix=_glMatrix2.default.mat4.create();this._normalMatrix=_glMatrix2.default.mat3.create();this._inverseModelViewMatrix=_glMatrix2.default.mat3.create();this._modelMatrix=_glMatrix2.default.mat4.create();this._matrix=_glMatrix2.default.mat4.create();_glMatrix2.default.mat4.identity(this.identityMatrix,this.identityMatrix);} //	INITIALIZE
_createClass(GLTool,[{key:'init',value:function init(mCanvas){var mParameters=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];if(this.canvas!==undefined){this.destroy();}this.canvas=mCanvas;this.setSize(window.innerWidth,window.innerHeight);this.gl=this.canvas.getContext('webgl',mParameters)||this.canvas.getContext('experimental-webgl',mParameters); //	extensions
var extensions=['EXT_shader_texture_lod','EXT_shader_texture_lod','EXT_sRGB','EXT_frag_depth','OES_texture_float','OES_texture_half_float','OES_texture_float_linear','OES_texture_half_float_linear','OES_standard_derivatives','WEBGL_depth_texture'];this.extensions={};for(var i=0;i<extensions.length;i++){this.extensions[extensions[i]]=this.gl.getExtension(extensions[i]);} //	Copy gl Attributes
var gl=this.gl;this.VERTEX_SHADER=gl.VERTEX_SHADER;this.FRAGMENT_SHADER=gl.FRAGMENT_SHADER;this.COMPILE_STATUS=gl.COMPILE_STATUS;this.DEPTH_TEST=gl.DEPTH_TEST;this.CULL_FACE=gl.CULL_FACE;this.BLEND=gl.BLEND;this.POINTS=gl.POINTS;this.LINES=gl.LINES;this.TRIANGLES=gl.TRIANGLES;this.LINEAR=gl.LINEAR;this.NEAREST=gl.NEAREST;this.LINEAR_MIPMAP_NEAREST=gl.LINEAR_MIPMAP_NEAREST;this.MIRRORED_REPEAT=gl.MIRRORED_REPEAT;this.CLAMP_TO_EDGE=gl.CLAMP_TO_EDGE;this.enable(this.DEPTH_TEST);this.enable(this.CULL_FACE);this.enable(this.BLEND);} //	PUBLIC METHODS
},{key:'setViewport',value:function setViewport(x,y,w,h){var hasChanged=false;if(x!==this._viewport[0]){hasChanged=true;}if(y!==this._viewport[1]){hasChanged=true;}if(w!==this._viewport[2]){hasChanged=true;}if(h!==this._viewport[3]){hasChanged=true;}if(hasChanged){this.gl.viewport(x,y,w,h);this._viewport=[x,y,w,h];}}},{key:'clear',value:function clear(r,g,b,a){this.gl.clearColor(r,g,b,a);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);}},{key:'setMatrices',value:function setMatrices(mCamera){this.camera=mCamera;this.rotate(this.identityMatrix);}},{key:'useShader',value:function useShader(mShader){this.shader=mShader;this.shaderProgram=this.shader.shaderProgram;}},{key:'rotate',value:function rotate(mRotation){_glMatrix2.default.mat4.copy(this._modelMatrix,mRotation);_glMatrix2.default.mat4.multiply(this._matrix,this.camera.matrix,this._modelMatrix);_glMatrix2.default.mat3.fromMat4(this._normalMatrix,this._matrix);_glMatrix2.default.mat3.invert(this._normalMatrix,this._normalMatrix);_glMatrix2.default.mat3.transpose(this._normalMatrix,this._normalMatrix);_glMatrix2.default.mat3.fromMat4(this._inverseModelViewMatrix,this._matrix);_glMatrix2.default.mat3.invert(this._inverseModelViewMatrix,this._inverseModelViewMatrix);}},{key:'draw',value:function draw(mMesh){if(mMesh.length){for(var i=0;i<mMesh.length;i++){this.draw(mMesh[i]);}return;}function getAttribLoc(gl,shaderProgram,name){if(shaderProgram.cacheAttribLoc===undefined){shaderProgram.cacheAttribLoc={};}if(shaderProgram.cacheAttribLoc[name]===undefined){shaderProgram.cacheAttribLoc[name]=gl.getAttribLocation(shaderProgram,name);}return shaderProgram.cacheAttribLoc[name];} //	ATTRIBUTES
for(var i=0;i<mMesh.attributes.length;i++){var attribute=mMesh.attributes[i];this.gl.bindBuffer(this.gl.ARRAY_BUFFER,attribute.buffer);var attrPosition=getAttribLoc(this.gl,this.shaderProgram,attribute.name);this.gl.vertexAttribPointer(attrPosition,attribute.itemSize,this.gl.FLOAT,false,0,0);if(this._enabledVertexAttribute.indexOf(attrPosition)===-1){this.gl.enableVertexAttribArray(attrPosition);this._enabledVertexAttribute.push(attrPosition);}} //	BIND INDEX BUFFER
this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,mMesh.iBuffer); //	DEFAULT MATRICES
this.shader.uniform('uProjectionMatrix','uniformMatrix4fv',this.camera.projection);this.shader.uniform('uModelMatrix','uniformMatrix4fv',this._modelMatrix);this.shader.uniform('uViewMatrix','uniformMatrix4fv',this.camera.matrix);this.shader.uniform('uNormalMatrix','uniformMatrix3fv',this._normalMatrix);this.shader.uniform('uModelViewMatrixInverse','uniformMatrix3fv',this._inverseModelViewMatrix); //	DRAWING
if(mMesh.drawType===this.gl.POINTS){this.gl.drawArrays(mMesh.drawType,0,mMesh.vertexSize);}else {this.gl.drawElements(mMesh.drawType,mMesh.iBuffer.numItems,this.gl.UNSIGNED_SHORT,0);}}},{key:'setSize',value:function setSize(mWidth,mHeight){this._width=mWidth;this._height=mHeight;this.canvas.width=this._width;this.canvas.height=this._height;this._aspectRatio=this._width/this._height;if(this.gl){this.viewport(0,0,this._width,this._height);}}},{key:'showExtensions',value:function showExtensions(){console.log('Extensions : ',this.extensions);for(var ext in this.extensions){if(this.extensions[ext]){console.log(ext,':',this.extensions[ext]);}}}},{key:'checkExtension',value:function checkExtension(mExtension){return !!this.extensions[mExtension];}},{key:'getExtension',value:function getExtension(mExtension){return this.extensions[mExtension];} //	BLEND MODES
},{key:'enableAlphaBlending',value:function enableAlphaBlending(){this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);}},{key:'enableAdditiveBlending',value:function enableAdditiveBlending(){this.gl.blendFunc(this.gl.ONE,this.gl.ONE);} //	GL NATIVE FUNCTIONS
},{key:'enable',value:function enable(mParameter){this.gl.enable(mParameter);}},{key:'disable',value:function disable(mParameter){this.gl.disable(mParameter);}},{key:'viewport',value:function viewport(x,y,w,h){this.setViewport(x,y,w,h);} //	GETTER AND SETTERS
},{key:'destroy', //	DESTROY
value:function destroy(){this.canvas=null;if(this.canvas.parentNode){try{this.canvas.parentNode.removeChild(this.canvas);}catch(e){console.log('Error : ',e);}}}},{key:'width',get:function get(){return this._width;}},{key:'height',get:function get(){return this._height;}},{key:'aspectRatio',get:function get(){return this._aspectRatio;}}]);return GLTool;}();var GL=new GLTool();exports.default=GL;},{"gl-matrix":1}],19:[function(_dereq_,module,exports){ // Geom.js
'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _Mesh=_dereq_('./Mesh');var _Mesh2=_interopRequireDefault(_Mesh);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var Geom={};Geom.plane=function(width,height,numSegments){var withNormals=arguments.length<=3||arguments[3]===undefined?false:arguments[3];var axis=arguments.length<=4||arguments[4]===undefined?'xy':arguments[4];var drawType=arguments.length<=5||arguments[5]===undefined?4:arguments[5];var positions=[];var coords=[];var indices=[];var normals=[];var gapX=width/numSegments;var gapY=height/numSegments;var gapUV=1/numSegments;var index=0;var sx=-width*0.5;var sy=-height*0.5;for(var i=0;i<numSegments;i++){for(var j=0;j<numSegments;j++){var tx=gapX*i+sx;var ty=gapY*j+sy;if(axis==='xz'){positions.push([tx,0,-ty+gapY]);positions.push([tx+gapX,0,-ty+gapY]);positions.push([tx+gapX,0,-ty]);positions.push([tx,0,-ty]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);}else if(axis==='yz'){positions.push([0,tx,ty]);positions.push([0,tx+gapX,ty]);positions.push([0,tx+gapX,ty+gapY]);positions.push([0,tx,ty+gapY]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);}else {positions.push([tx,ty,0]);positions.push([tx+gapX,ty,0]);positions.push([tx+gapX,ty+gapY,0]);positions.push([tx,ty+gapY,0]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);}var u=i/numSegments;var v=j/numSegments;coords.push([u,v]);coords.push([u+gapUV,v]);coords.push([u+gapUV,v+gapUV]);coords.push([u,v+gapUV]);indices.push(index*4+0);indices.push(index*4+1);indices.push(index*4+2);indices.push(index*4+0);indices.push(index*4+2);indices.push(index*4+3);index++;}}var mesh=new _Mesh2.default(drawType);mesh.bufferVertex(positions);mesh.bufferTexCoords(coords);mesh.bufferIndices(indices);if(withNormals){mesh.bufferNormal(normals);}return mesh;};Geom.sphere=function(size,numSegments){var withNormals=arguments.length<=2||arguments[2]===undefined?false:arguments[2];var isInvert=arguments.length<=3||arguments[3]===undefined?false:arguments[3];var drawType=arguments.length<=4||arguments[4]===undefined?4:arguments[4];var positions=[];var coords=[];var indices=[];var normals=[];var index=0;var gapUV=1/numSegments;var getPosition=function getPosition(i,j){var isNormal=arguments.length<=2||arguments[2]===undefined?false:arguments[2]; //	rx : -90 ~ 90 , ry : 0 ~ 360
var rx=i/numSegments*Math.PI-Math.PI*0.5;var ry=j/numSegments*Math.PI*2;var r=isNormal?1:size;var pos=[];pos[1]=Math.sin(rx)*r;var t=Math.cos(rx)*r;pos[0]=Math.cos(ry)*t;pos[2]=Math.sin(ry)*t;var precision=10000;pos[0]=Math.floor(pos[0]*precision)/precision;pos[1]=Math.floor(pos[1]*precision)/precision;pos[2]=Math.floor(pos[2]*precision)/precision;return pos;};for(var i=0;i<numSegments;i++){for(var j=0;j<numSegments;j++){positions.push(getPosition(i,j));positions.push(getPosition(i+1,j));positions.push(getPosition(i+1,j+1));positions.push(getPosition(i,j+1));if(withNormals){normals.push(getPosition(i,j,true));normals.push(getPosition(i+1,j,true));normals.push(getPosition(i+1,j+1,true));normals.push(getPosition(i,j+1,true));}var u=j/numSegments;var v=i/numSegments;coords.push([1.0-u,v]);coords.push([1.0-u,v+gapUV]);coords.push([1.0-u-gapUV,v+gapUV]);coords.push([1.0-u-gapUV,v]);indices.push(index*4+0);indices.push(index*4+1);indices.push(index*4+2);indices.push(index*4+0);indices.push(index*4+2);indices.push(index*4+3);index++;}}if(isInvert){indices.reverse();}var mesh=new _Mesh2.default(drawType);mesh.bufferVertex(positions);mesh.bufferTexCoords(coords);mesh.bufferIndices(indices);if(withNormals){mesh.bufferNormal(normals);}return mesh;};Geom.cube=function(w,h,d){var withNormals=arguments.length<=3||arguments[3]===undefined?false:arguments[3];var drawType=arguments.length<=4||arguments[4]===undefined?4:arguments[4];h=h||w;d=d||w;var x=w/2;var y=h/2;var z=d/2;var positions=[];var coords=[];var indices=[];var normals=[];var count=0; // BACK
positions.push([-x,y,-z]);positions.push([x,y,-z]);positions.push([x,-y,-z]);positions.push([-x,-y,-z]);normals.push([0,0,-1]);normals.push([0,0,-1]);normals.push([0,0,-1]);normals.push([0,0,-1]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // RIGHT
positions.push([x,y,-z]);positions.push([x,y,z]);positions.push([x,-y,z]);positions.push([x,-y,-z]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // FRONT
positions.push([x,y,z]);positions.push([-x,y,z]);positions.push([-x,-y,z]);positions.push([x,-y,z]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // LEFT
positions.push([-x,y,z]);positions.push([-x,y,-z]);positions.push([-x,-y,-z]);positions.push([-x,-y,z]);normals.push([-1,0,0]);normals.push([-1,0,0]);normals.push([-1,0,0]);normals.push([-1,0,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // TOP
positions.push([-x,y,z]);positions.push([x,y,z]);positions.push([x,y,-z]);positions.push([-x,y,-z]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // BOTTOM
positions.push([-x,-y,-z]);positions.push([x,-y,-z]);positions.push([x,-y,z]);positions.push([-x,-y,z]);normals.push([0,-1,0]);normals.push([0,-1,0]);normals.push([0,-1,0]);normals.push([0,-1,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++;var mesh=new _Mesh2.default(drawType);mesh.bufferVertex(positions);mesh.bufferTexCoords(coords);mesh.bufferIndices(indices);if(withNormals){mesh.bufferNormal(normals);}return mesh;};Geom.skybox=function(size){var withNormals=arguments.length<=1||arguments[1]===undefined?false:arguments[1];var drawType=arguments.length<=2||arguments[2]===undefined?4:arguments[2];var positions=[];var coords=[];var indices=[];var normals=[];var count=0; // BACK
positions.push([size,size,-size]);positions.push([-size,size,-size]);positions.push([-size,-size,-size]);positions.push([size,-size,-size]);normals.push([0,0,-1]);normals.push([0,0,-1]);normals.push([0,0,-1]);normals.push([0,0,-1]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // RIGHT
positions.push([size,-size,-size]);positions.push([size,-size,size]);positions.push([size,size,size]);positions.push([size,size,-size]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);normals.push([1,0,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // FRONT
positions.push([-size,size,size]);positions.push([size,size,size]);positions.push([size,-size,size]);positions.push([-size,-size,size]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);normals.push([0,0,1]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // LEFT
positions.push([-size,-size,size]);positions.push([-size,-size,-size]);positions.push([-size,size,-size]);positions.push([-size,size,size]);normals.push([-1,0,0]);normals.push([-1,0,0]);normals.push([-1,0,0]);normals.push([-1,0,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // TOP
positions.push([size,size,size]);positions.push([-size,size,size]);positions.push([-size,size,-size]);positions.push([size,size,-size]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);normals.push([0,1,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);count++; // BOTTOM
positions.push([size,-size,-size]);positions.push([-size,-size,-size]);positions.push([-size,-size,size]);positions.push([size,-size,size]);normals.push([0,-1,0]);normals.push([0,-1,0]);normals.push([0,-1,0]);normals.push([0,-1,0]);coords.push([0,0]);coords.push([1,0]);coords.push([1,1]);coords.push([0,1]);indices.push(count*4+0);indices.push(count*4+1);indices.push(count*4+2);indices.push(count*4+0);indices.push(count*4+2);indices.push(count*4+3);var mesh=new _Mesh2.default(drawType);mesh.bufferVertex(positions);mesh.bufferTexCoords(coords);mesh.bufferIndices(indices);if(withNormals){mesh.bufferNormal(normals);}return mesh;};Geom.bigTriangle=function(){var indices=[2,1,0];var positions=[[-1,-1],[-1,4],[4,-1]];var mesh=new _Mesh2.default();mesh.bufferData(positions,'aPosition',2);mesh.bufferIndices(indices);return mesh;};exports.default=Geom;},{"./Mesh":20}],20:[function(_dereq_,module,exports){ // Mesh.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('./GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var gl=undefined;var vec3=_glMatrix2.default.vec3;var Mesh=function(){function Mesh(){var mDrawType=arguments.length<=0||arguments[0]===undefined?_GLTool2.default.gl.TRIANGLES:arguments[0];_classCallCheck(this,Mesh);gl=_GLTool2.default.gl;this.drawType=mDrawType;this._attributes=[];this._vertexSize=0;this._vertices=[];this._texCoords=[];this._normals=[];this._faceNormals=[];this._tangents=[];this._indices=[];this._faces=[];}_createClass(Mesh,[{key:'bufferVertex',value:function bufferVertex(mArrayVertices){var isDynamic=arguments.length<=1||arguments[1]===undefined?false:arguments[1];this._vertexSize=mArrayVertices.length;this.bufferData(mArrayVertices,'aVertexPosition',3,isDynamic);this._vertices=mArrayVertices;}},{key:'bufferTexCoords',value:function bufferTexCoords(mArrayTexCoords){var isDynamic=arguments.length<=1||arguments[1]===undefined?false:arguments[1];this.bufferData(mArrayTexCoords,'aTextureCoord',2,isDynamic);this._texCoords=mArrayTexCoords;}},{key:'bufferNormal',value:function bufferNormal(mNormals){var isDynamic=arguments.length<=1||arguments[1]===undefined?false:arguments[1];this.bufferData(mNormals,'aNormal',3,isDynamic);this._normals=mNormals;}},{key:'bufferIndices',value:function bufferIndices(mArrayIndices){var isDynamic=arguments.length<=1||arguments[1]===undefined?false:arguments[1];var drawType=isDynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW;this._indices=mArrayIndices;this.iBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mArrayIndices),drawType);this.iBuffer.itemSize=1;this.iBuffer.numItems=mArrayIndices.length;this._indices=mArrayIndices;}},{key:'bufferData',value:function bufferData(mData,mName,mItemSize){var isDynamic=arguments.length<=3||arguments[3]===undefined?false:arguments[3];var index=-1,i=0;var drawType=isDynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW;var bufferData=[];var buffer=undefined,dataArray=undefined; //	Check for existing attributes
for(i=0;i<this._attributes.length;i++){if(this._attributes[i].name===mName){this._attributes[i].data=mData;index=i;break;}} //	flatten buffer data		
for(i=0;i<mData.length;i++){for(var j=0;j<mData[i].length;j++){bufferData.push(mData[i][j]);}}if(index===-1){ //	attribute not exist yet, create new buffer
buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);dataArray=new Float32Array(bufferData);gl.bufferData(gl.ARRAY_BUFFER,dataArray,drawType);this._attributes.push({name:mName,data:mData,itemSize:mItemSize,buffer:buffer,dataArray:dataArray});}else { //	attribute existed, replace with new data
buffer=this._attributes[index].buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);dataArray=this._attributes[index].dataArray;for(i=0;i<bufferData.length;i++){dataArray[i]=bufferData[i];}gl.bufferData(gl.ARRAY_BUFFER,dataArray,drawType);}}},{key:'computeNormals',value:function computeNormals(){var usingFaceNormals=arguments.length<=0||arguments[0]===undefined?false:arguments[0];this._generateFaces();if(usingFaceNormals){this._computeFaceNormals();}else {this._computeVertexNormals();}}},{key:'computeTangents',value:function computeTangents(){} //	PRIVATE METHODS
},{key:'_computeFaceNormals',value:function _computeFaceNormals(){var faceIndex=undefined;var face=undefined;var normals=[];for(var i=0;i<this._indices.length;i+=3){faceIndex=i/3;face=this._faces[faceIndex];var N=face.normal;normals[face.indices[0]]=N;normals[face.indices[1]]=N;normals[face.indices[2]]=N;}this.bufferNormal(normals);}},{key:'_computeVertexNormals',value:function _computeVertexNormals(){ //	loop through all vertices
var sumNormal=vec3.create();var face=undefined;var normals=[];for(var i=0;i<this._vertices.length;i++){vec3.set(sumNormal,0,0,0);for(var j=0;j<this._faces.length;j++){face=this._faces[j]; //	if vertex exist in the face, add the normal to sum normal
if(face.indices.indexOf(i)>=0){sumNormal[0]+=face.normal[0];sumNormal[1]+=face.normal[1];sumNormal[2]+=face.normal[2];}}vec3.normalize(sumNormal,sumNormal);normals.push([sumNormal[0],sumNormal[1],sumNormal[2]]);}this.bufferNormal(normals);}},{key:'_generateFaces',value:function _generateFaces(){var ia=undefined,ib=undefined,ic=undefined;var a=undefined,b=undefined,c=undefined,vba=vec3.create(),vca=vec3.create(),vNormal=vec3.create();for(var i=0;i<this._indices.length;i+=3){ia=this._indices[i];ib=this._indices[i+1];ic=this._indices[i+2];a=vec3.clone(this._vertices[ia]);b=vec3.clone(this._vertices[ib]);c=vec3.clone(this._vertices[ic]);vec3.sub(vba,b,a);vec3.sub(vca,c,a);vec3.cross(vNormal,vba,vca);vec3.normalize(vNormal,vNormal);var N=[vNormal[0],vNormal[1],vNormal[2]];var face={indices:[ia,ib,ic],normal:N};this._faces.push(face);}} //	GETTER AND SETTERS
},{key:'attributes',get:function get(){return this._attributes;}},{key:'vertexSize',get:function get(){return this._vertexSize;}},{key:'hasNormals',get:function get(){if(this._normals.length===0){return false;}return true;}},{key:'hasTangents',get:function get(){if(this._tangents.length===0){return false;}return true;}}]);return Mesh;}();exports.default=Mesh;},{"./GLTool":18,"gl-matrix":1}],21:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // Camera.js
Object.defineProperty(exports,"__esModule",{value:true});var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Camera=function(){function Camera(){_classCallCheck(this,Camera); //	VIEW MATRIX
this._matrix=_glMatrix2.default.mat4.create(); //	PROJECTION MATRIX
this._projection=_glMatrix2.default.mat4.create(); //	POSITION OF CAMERA
this.position=_glMatrix2.default.vec3.create();}_createClass(Camera,[{key:'lookAt',value:function lookAt(aEye,aCenter,aUp){_glMatrix2.default.vec3.copy(this.position,aEye);_glMatrix2.default.mat4.identity(this._matrix);_glMatrix2.default.mat4.lookAt(this._matrix,aEye,aCenter,aUp);} //	GETTERS
},{key:'matrix',get:function get(){return this._matrix;}},{key:'viewMatrix',get:function get(){return this._matrix;}},{key:'projection',get:function get(){return this._projection;}},{key:'projectionMatrix',get:function get(){return this._projection;}}]);return Camera;}();exports.default=Camera;},{"gl-matrix":1}],22:[function(_dereq_,module,exports){ // CameraCube.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _CameraPerspective2=_dereq_('./CameraPerspective');var _CameraPerspective3=_interopRequireDefault(_CameraPerspective2);var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var vec3=_glMatrix2.default.vec3;var CAMERA_SETTINGS=[[vec3.fromValues(0,0,0),vec3.fromValues(1,0,0),vec3.fromValues(0,-1,0)],[vec3.fromValues(0,0,0),vec3.fromValues(-1,0,0),vec3.fromValues(0,-1,0)],[vec3.fromValues(0,0,0),vec3.fromValues(0,1,0),vec3.fromValues(0,0,1)],[vec3.fromValues(0,0,0),vec3.fromValues(0,-1,0),vec3.fromValues(0,0,-1)],[vec3.fromValues(0,0,0),vec3.fromValues(0,0,1),vec3.fromValues(0,-1,0)],[vec3.fromValues(0,0,0),vec3.fromValues(0,0,-1),vec3.fromValues(0,-1,0)]];var CameraCube=function(_CameraPerspective){_inherits(CameraCube,_CameraPerspective);function CameraCube(){_classCallCheck(this,CameraCube);var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(CameraCube).call(this));_this.setPerspective(Math.PI/2,1,0.1,1000);return _this;}_createClass(CameraCube,[{key:'face',value:function face(mIndex){var o=CAMERA_SETTINGS[mIndex];this.lookAt(o[0],o[1],o[2]);}}]);return CameraCube;}(_CameraPerspective3.default);exports.default=CameraCube;},{"./CameraPerspective":24,"gl-matrix":1}],23:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _Camera2=_dereq_('./Camera');var _Camera3=_interopRequireDefault(_Camera2);var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;} // CameraOrtho.js
var CameraOrtho=function(_Camera){_inherits(CameraOrtho,_Camera);function CameraOrtho(){_classCallCheck(this,CameraOrtho);var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(CameraOrtho).call(this));var eye=_glMatrix2.default.vec3.clone([0,0,5]);var center=_glMatrix2.default.vec3.create();var up=_glMatrix2.default.vec3.clone([0,-1,0]);_this.lookAt(eye,center,up);_this.ortho(1,-1,1,-1);return _this;}_createClass(CameraOrtho,[{key:'setBoundary',value:function setBoundary(left,right,top,bottom){this.ortho(left,right,top,bottom);}},{key:'ortho',value:function ortho(left,right,top,bottom){this.left=left;this.right=right;this.top=top;this.bottom=bottom;_glMatrix2.default.mat4.ortho(this._projection,left,right,top,bottom,0,10000);}}]);return CameraOrtho;}(_Camera3.default);exports.default=CameraOrtho;},{"./Camera":21,"gl-matrix":1}],24:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _Camera2=_dereq_('./Camera');var _Camera3=_interopRequireDefault(_Camera2);var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;} // CameraPerspective.js
var CameraPerspective=function(_Camera){_inherits(CameraPerspective,_Camera);function CameraPerspective(){_classCallCheck(this,CameraPerspective);return _possibleConstructorReturn(this,Object.getPrototypeOf(CameraPerspective).call(this));}_createClass(CameraPerspective,[{key:'setPerspective',value:function setPerspective(mFov,mAspectRatio,mNear,mFar){this._fov=mFov;this._near=mNear;this._far=mFar;this._aspectRatio=mAspectRatio;_glMatrix2.default.mat4.perspective(this._projection,mFov,mAspectRatio,mNear,mFar);}},{key:'setAspectRatio',value:function setAspectRatio(mAspectRatio){this._aspectRatio=mAspectRatio;_glMatrix2.default.mat4.perspective(this.projection,this._fov,mAspectRatio,this._near,this._far);}}]);return CameraPerspective;}(_Camera3.default);exports.default=CameraPerspective;},{"./Camera":21,"gl-matrix":1}],25:[function(_dereq_,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('../GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _Mesh=_dereq_('../Mesh');var _Mesh2=_interopRequireDefault(_Mesh);var _GLShader=_dereq_('../GLShader');var _GLShader2=_interopRequireDefault(_GLShader);var _Batch2=_dereq_('../Batch');var _Batch3=_interopRequireDefault(_Batch2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;} // BatchAxis.js
var BatchAxis=function(_Batch){_inherits(BatchAxis,_Batch);function BatchAxis(){_classCallCheck(this,BatchAxis);var positions=[];var colors=[];var indices=[0,1,2,3,4,5];var r=9999;positions.push([-r,0,0]);positions.push([r,0,0]);positions.push([0,-r,0]);positions.push([0,r,0]);positions.push([0,0,-r]);positions.push([0,0,r]);colors.push([1,0,0]);colors.push([1,0,0]);colors.push([0,1,0]);colors.push([0,1,0]);colors.push([0,0,1]);colors.push([0,0,1]);var mesh=new _Mesh2.default(_GLTool2.default.LINES);mesh.bufferVertex(positions);mesh.bufferIndices(indices);mesh.bufferData(colors,'aColor',3);var shader=new _GLShader2.default("#define GLSLIFY 1\n// axis.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\nattribute vec3 aVertexPosition;\nattribute vec3 aColor;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec3 vColor;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vColor = aColor;\n}","#define GLSLIFY 1\n// axis.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision highp float;\nvarying vec3 vColor;\n\nvoid main(void) {\n    gl_FragColor = vec4(vColor, 1.0);\n}");return _possibleConstructorReturn(this,Object.getPrototypeOf(BatchAxis).call(this,mesh,shader));}return BatchAxis;}(_Batch3.default);exports.default=BatchAxis;},{"../Batch":12,"../GLShader":16,"../GLTool":18,"../Mesh":20}],26:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else {return get(parent,property,receiver);}}else if("value" in desc){return desc.value;}else {var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};Object.defineProperty(exports,"__esModule",{value:true});var _Geom=_dereq_('../Geom');var _Geom2=_interopRequireDefault(_Geom);var _GLShader=_dereq_('../GLShader');var _GLShader2=_interopRequireDefault(_GLShader);var _Batch2=_dereq_('../Batch');var _Batch3=_interopRequireDefault(_Batch2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;} // BatchCopy.js
var BatchCopy=function(_Batch){_inherits(BatchCopy,_Batch);function BatchCopy(){_classCallCheck(this,BatchCopy);var mesh=_Geom2.default.bigTriangle();var shader=new _GLShader2.default("#define GLSLIFY 1\n// bigTriangle.vert\n\n#define SHADER_NAME BIG_TRIANGLE_VERTEX\n\nprecision highp float;\nattribute vec2 aPosition;\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n    gl_Position = vec4(aPosition, 0.0, 1.0);\n    vTextureCoord = aPosition * .5 + .5;\n}","#define GLSLIFY 1\n// copy.frag\n\n#define SHADER_NAME COPY_FRAGMENT\n\nprecision highp float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = texture2D(texture, vTextureCoord);\n}");var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(BatchCopy).call(this,mesh,shader));shader.bind();shader.uniform('texture','uniform1i',0);return _this;}_createClass(BatchCopy,[{key:'draw',value:function draw(texture){this.shader.bind();texture.bind(0);_get(Object.getPrototypeOf(BatchCopy.prototype),'draw',this).call(this);}}]);return BatchCopy;}(_Batch3.default);exports.default=BatchCopy;},{"../Batch":12,"../GLShader":16,"../Geom":19}],27:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else {return get(parent,property,receiver);}}else if("value" in desc){return desc.value;}else {var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('../GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _Mesh=_dereq_('../Mesh');var _Mesh2=_interopRequireDefault(_Mesh);var _GLShader=_dereq_('../GLShader');var _GLShader2=_interopRequireDefault(_GLShader);var _Batch2=_dereq_('../Batch');var _Batch3=_interopRequireDefault(_Batch2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;} // BatchDotsPlane.js
var BatchDotsPlane=function(_Batch){_inherits(BatchDotsPlane,_Batch);function BatchDotsPlane(){_classCallCheck(this,BatchDotsPlane);var positions=[];var indices=[];var index=0;var numDots=100;var size=50;var gap=size/numDots;var i=undefined,j=undefined;for(i=-size/2;i<size;i+=gap){for(j=-size/2;j<size;j+=gap){positions.push([i,j,0]);indices.push(index);index++;positions.push([i,0,j]);indices.push(index);index++;}}var mesh=new _Mesh2.default(_GLTool2.default.POINTS);mesh.bufferVertex(positions);mesh.bufferIndices(indices);var shader=new _GLShader2.default("#define GLSLIFY 1\n// basic.vert\n\n#define SHADER_NAME DOTS_PLANE_VERTEX\n\nprecision highp float;\nattribute vec3 aVertexPosition;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n}","#define GLSLIFY 1\n// simpleColor.frag\n\n#define SHADER_NAME SIMPLE_COLOR\n\nprecision highp float;\n\nuniform vec3 color;\nuniform float opacity;\n\nvoid main(void) {\n    gl_FragColor = vec4(color, opacity);\n}");var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(BatchDotsPlane).call(this,mesh,shader));_this.color=[1,1,1];_this.opacity=0.5;return _this;}_createClass(BatchDotsPlane,[{key:'draw',value:function draw(){this.shader.bind();this.shader.uniform('color','uniform3fv',this.color);this.shader.uniform('opacity','uniform1f',this.opacity); // GL.draw(this.mesh);
_get(Object.getPrototypeOf(BatchDotsPlane.prototype),'draw',this).call(this);}}]);return BatchDotsPlane;}(_Batch3.default);exports.default=BatchDotsPlane;},{"../Batch":12,"../GLShader":16,"../GLTool":18,"../Mesh":20}],28:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // Scene.js
Object.defineProperty(exports,"__esModule",{value:true});var _GLTool=_dereq_('../GLTool');var _GLTool2=_interopRequireDefault(_GLTool);var _Scheduler=_dereq_('../tools/Scheduler');var _Scheduler2=_interopRequireDefault(_Scheduler);var _CameraPerspective=_dereq_('../cameras/CameraPerspective');var _CameraPerspective2=_interopRequireDefault(_CameraPerspective);var _CameraOrtho=_dereq_('../cameras/CameraOrtho');var _CameraOrtho2=_interopRequireDefault(_CameraOrtho);var _OrbitalControl=_dereq_('../tools/OrbitalControl');var _OrbitalControl2=_interopRequireDefault(_OrbitalControl);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Scene=function(){function Scene(){var _this=this;_classCallCheck(this,Scene);this._init();this._initTextures();this._initViews();this._efIndex=_Scheduler2.default.addEF(function(){return _this._loop();});window.addEventListener('resize',function(){return _this.resize();});} //	PUBLIC METHODS
_createClass(Scene,[{key:'render',value:function render(){}},{key:'stop',value:function stop(){if(this._efIndex===-1){return;}this._efIndex=_Scheduler2.default.removeEF(this._efIndex);}},{key:'start',value:function start(){var _this2=this;if(this._efIndex!==-1){return;}this._efIndex=_Scheduler2.default.addEF(function(){return _this2._loop();});}},{key:'resize',value:function resize(){_GLTool2.default.setSize(window.innerWidth,window.innerHeight);this.camera.setAspectRatio(_GLTool2.default.aspectRatio);} //	PROTECTED METHODS TO BE OVERRIDEN BY CHILDREN
},{key:'_initTextures',value:function _initTextures(){}},{key:'_initViews',value:function _initViews(){} //	PRIVATE METHODS
},{key:'_init',value:function _init(){this.camera=new _CameraPerspective2.default();this.camera.setPerspective(45*Math.PI/180,_GLTool2.default.aspectRatio,0.1,100);this.orbitalControl=new _OrbitalControl2.default(this.camera,window,15);this.orbitalControl.radius.value=10;this.cameraOrtho=new _CameraOrtho2.default();}},{key:'_loop',value:function _loop(){ //	RESET VIEWPORT
_GLTool2.default.viewport(0,0,_GLTool2.default.width,_GLTool2.default.height); //	RESET CAMERA
_GLTool2.default.setMatrices(this.camera);this.render();}}]);return Scene;}();exports.default=Scene;},{"../GLTool":18,"../cameras/CameraOrtho":23,"../cameras/CameraPerspective":24,"../tools/OrbitalControl":36,"../tools/Scheduler":38}],29:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // View.js
Object.defineProperty(exports,"__esModule",{value:true});var _GLShader=_dereq_('../GLShader');var _GLShader2=_interopRequireDefault(_GLShader);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var View=function(){function View(mStrVertex,mStrFrag){_classCallCheck(this,View);this.shader=new _GLShader2.default(mStrVertex,mStrFrag);this._init();} //	PROTECTED METHODS
_createClass(View,[{key:'_init',value:function _init(){} // 	PUBLIC METHODS
},{key:'render',value:function render(){}}]);return View;}();exports.default=View;},{"../GLShader":16}],30:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}} // BinaryLoader.js
var BinaryLoader=function(){function BinaryLoader(){var _this=this;var isArrayBuffer=arguments.length<=0||arguments[0]===undefined?false:arguments[0];_classCallCheck(this,BinaryLoader);this._req=new XMLHttpRequest();this._req.addEventListener('load',function(e){return _this._onLoaded(e);});this._req.addEventListener('progress',function(e){return _this._onProgress(e);});if(isArrayBuffer){this._req.responseType='arraybuffer';}}_createClass(BinaryLoader,[{key:'load',value:function load(url,callback){console.log('Loading : ',url);this._callback=callback;this._req.open('GET',url);this._req.send();}},{key:'_onLoaded',value:function _onLoaded(){this._callback(this._req.response);}},{key:'_onProgress',value:function _onProgress() /*e*/{ // console.log('on Progress:', (e.loaded/e.total*100).toFixed(2));
}}]);return BinaryLoader;}();exports.default=BinaryLoader;},{}],31:[function(_dereq_,module,exports){ // HDRLoader.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _BinaryLoader2=_dereq_('./BinaryLoader');var _BinaryLoader3=_interopRequireDefault(_BinaryLoader2);var _HDRParser=_dereq_('../tools/HDRParser');var _HDRParser2=_interopRequireDefault(_HDRParser);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var HDRLoader=function(_BinaryLoader){_inherits(HDRLoader,_BinaryLoader);function HDRLoader(){_classCallCheck(this,HDRLoader);return _possibleConstructorReturn(this,Object.getPrototypeOf(HDRLoader).call(this,true));}_createClass(HDRLoader,[{key:'parse',value:function parse(mArrayBuffer){return (0,_HDRParser2.default)(mArrayBuffer);}},{key:'_onLoaded',value:function _onLoaded(){var o=this.parse(this._req.response);if(this._callback){this._callback(o);}}}]);return HDRLoader;}(_BinaryLoader3.default);HDRLoader.parse=function(mArrayBuffer){return (0,_HDRParser2.default)(mArrayBuffer);};exports.default=HDRLoader;},{"../tools/HDRParser":35,"./BinaryLoader":30}],32:[function(_dereq_,module,exports){ // ObjLoader.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else {return get(parent,property,receiver);}}else if("value" in desc){return desc.value;}else {var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};Object.defineProperty(exports,"__esModule",{value:true});var _BinaryLoader2=_dereq_('./BinaryLoader');var _BinaryLoader3=_interopRequireDefault(_BinaryLoader2);var _Mesh=_dereq_('../Mesh');var _Mesh2=_interopRequireDefault(_Mesh);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&((typeof call==="undefined"?"undefined":_typeof(call))==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+(typeof superClass==="undefined"?"undefined":_typeof(superClass)));}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var ObjLoader=function(_BinaryLoader){_inherits(ObjLoader,_BinaryLoader);function ObjLoader(){_classCallCheck(this,ObjLoader);return _possibleConstructorReturn(this,Object.getPrototypeOf(ObjLoader).call(this));}_createClass(ObjLoader,[{key:'load',value:function load(url,callback){var ignoreNormals=arguments.length<=2||arguments[2]===undefined?true:arguments[2];var drawType=arguments.length<=3||arguments[3]===undefined?4:arguments[3];this._ignoreNormals=ignoreNormals;this._drawType=drawType;_get(Object.getPrototypeOf(ObjLoader.prototype),'load',this).call(this,url,callback);}},{key:'_onLoaded',value:function _onLoaded(){this._parseObj(this._req.response);}},{key:'_parseObj',value:function _parseObj(objStr){var lines=objStr.split('\n');var positions=[];var coords=[];var finalNormals=[];var vertices=[];var normals=[];var uvs=[];var indices=[];var count=0;var result=undefined; // v float float float
var vertex_pattern=/v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/; // vn float float float
var normal_pattern=/vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/; // vt float float
var uv_pattern=/vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/; // f vertex vertex vertex ...
var face_pattern1=/f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/; // f vertex/uv vertex/uv vertex/uv ...
var face_pattern2=/f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/; // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
var face_pattern3=/f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/; // f vertex//normal vertex//normal vertex//normal ...
var face_pattern4=/f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;function parseVertexIndex(value){var index=parseInt(value);return (index>=0?index-1:index+vertices.length/3)*3;}function parseNormalIndex(value){var index=parseInt(value);return (index>=0?index-1:index+normals.length/3)*3;}function parseUVIndex(value){var index=parseInt(value);return (index>=0?index-1:index+uvs.length/2)*2;}function addVertex(a,b,c){positions.push([vertices[a],vertices[a+1],vertices[a+2]]);positions.push([vertices[b],vertices[b+1],vertices[b+2]]);positions.push([vertices[c],vertices[c+1],vertices[c+2]]);indices.push(count*3+0);indices.push(count*3+1);indices.push(count*3+2);count++;}function addUV(a,b,c){coords.push([uvs[a],uvs[a+1]]);coords.push([uvs[b],uvs[b+1]]);coords.push([uvs[c],uvs[c+1]]);}function addNormal(a,b,c){finalNormals.push([normals[a],normals[a+1],normals[a+2]]);finalNormals.push([normals[b],normals[b+1],normals[b+2]]);finalNormals.push([normals[c],normals[c+1],normals[c+2]]);}function addFace(a,b,c,d,ua,ub,uc,ud,na,nb,nc,nd){var ia=parseVertexIndex(a);var ib=parseVertexIndex(b);var ic=parseVertexIndex(c);var id=undefined;if(d===undefined){addVertex(ia,ib,ic);}else {id=parseVertexIndex(d);addVertex(ia,ib,id);addVertex(ib,ic,id);}if(ua!==undefined){ia=parseUVIndex(ua);ib=parseUVIndex(ub);ic=parseUVIndex(uc);if(d===undefined){addUV(ia,ib,ic);}else {id=parseUVIndex(ud);addUV(ia,ib,id);addUV(ib,ic,id);}}if(na!==undefined){ia=parseNormalIndex(na);ib=parseNormalIndex(nb);ic=parseNormalIndex(nc);if(d===undefined){addNormal(ia,ib,ic);}else {id=parseNormalIndex(nd);addNormal(ia,ib,id);addNormal(ib,ic,id);}}}for(var i=0;i<lines.length;i++){var line=lines[i];line=line.trim();if(line.length===0||line.charAt(0)==='#'){continue;}else if((result=vertex_pattern.exec(line))!==null){vertices.push(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));}else if((result=normal_pattern.exec(line))!==null){normals.push(parseFloat(result[1]),parseFloat(result[2]),parseFloat(result[3]));}else if((result=uv_pattern.exec(line))!==null){uvs.push(parseFloat(result[1]),parseFloat(result[2]));}else if((result=face_pattern1.exec(line))!==null){addFace(result[1],result[2],result[3],result[4]);}else if((result=face_pattern2.exec(line))!==null){addFace(result[2],result[5],result[8],result[11],result[3],result[6],result[9],result[12]);}else if((result=face_pattern3.exec(line))!==null){addFace(result[2],result[6],result[10],result[14],result[3],result[7],result[11],result[15],result[4],result[8],result[12],result[16]);}else if((result=face_pattern4.exec(line))!==null){addFace(result[2],result[5],result[8],result[11],undefined,undefined,undefined,undefined,result[3],result[6],result[9],result[12]);}}this._generateMeshes({positions:positions,coords:coords,normals:finalNormals,indices:indices});}},{key:'_generateMeshes',value:function _generateMeshes(o){var maxNumVertices=65535;if(o.positions.length>maxNumVertices){var meshes=[];var lastIndex=0;var oCopy={};oCopy.positions=o.positions.concat();oCopy.coords=o.coords.concat();oCopy.indices=o.indices.concat();oCopy.normals=o.normals.concat();while(o.indices.length>0){var sliceNum=Math.min(maxNumVertices,o.positions.length);var indices=o.indices.splice(0,sliceNum);var positions=[];var coords=[];var normals=[];var index=undefined,tmpIndex=0;for(var i=0;i<indices.length;i++){if(indices[i]>tmpIndex){tmpIndex=indices[i];}index=indices[i];positions.push(oCopy.positions[index]);coords.push(oCopy.coords[index]);normals.push(oCopy.normals[index]);indices[i]-=lastIndex;}lastIndex=tmpIndex+1;var mesh=new _Mesh2.default(this._drawType);mesh.bufferVertex(positions);mesh.bufferTexCoords(coords);mesh.bufferIndices(indices);if(!this._ignoreNormals){mesh.bufferNormal(normals);}meshes.push(mesh);}if(this._callback){this._callback(meshes,oCopy);}}else {var mesh=new _Mesh2.default(this._drawType);mesh.bufferVertex(o.positions);mesh.bufferTexCoords(o.coords);mesh.bufferIndices(o.indices);if(!this._ignoreNormals){mesh.bufferNormal(o.normals);}if(this._callback){this._callback(mesh,o);}}}}]);return ObjLoader;}(_BinaryLoader3.default);exports.default=ObjLoader;},{"../Mesh":20,"./BinaryLoader":30}],33:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}(); // EaseNumber.js
Object.defineProperty(exports,"__esModule",{value:true});var _Scheduler=_dereq_('./Scheduler');var _Scheduler2=_interopRequireDefault(_Scheduler);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EaseNumber=function(){function EaseNumber(mValue){var _this=this;var mEasing=arguments.length<=1||arguments[1]===undefined?0.1:arguments[1];_classCallCheck(this,EaseNumber);this.easing=mEasing;this._value=mValue;this._targetValue=mValue;_Scheduler2.default.addEF(function(){return _this._update();});}_createClass(EaseNumber,[{key:'_update',value:function _update(){this._checkLimit();this._value+=(this._targetValue-this._value)*this.easing;}},{key:'setTo',value:function setTo(mValue){this._targetValue=this._value=mValue;}},{key:'add',value:function add(mAdd){this._targetValue+=mAdd;}},{key:'limit',value:function limit(mMin,mMax){if(mMin>mMax){this.limit(mMax,mMin);return;}this._min=mMin;this._max=mMax;this._checkLimit();}},{key:'_checkLimit',value:function _checkLimit(){if(this._min!==undefined&&this._targetValue<this._min){this._targetValue=this._min;}if(this._max!==undefined&&this._targetValue>this._max){this._targetValue=this._max;}} //	GETTERS / SETTERS
},{key:'value',set:function set(mValue){this._targetValue=mValue;},get:function get(){return this._value;}},{key:'targetValue',get:function get(){return this._targetValue;}}]);return EaseNumber;}();exports.default=EaseNumber;},{"./Scheduler":38}],34:[function(_dereq_,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}} // EventDispatcher.js
var supportsCustomEvents=true;try{var newTestCustomEvent=document.createEvent('CustomEvent');newTestCustomEvent=null;}catch(e){supportsCustomEvents=false;}var EventDispatcher=function(){function EventDispatcher(){_classCallCheck(this,EventDispatcher);}_createClass(EventDispatcher,[{key:'addEventListener',value:function addEventListener(aEventType,aFunction){if(this._eventListeners===null){this._eventListeners={};}if(!this._eventListeners[aEventType]){this._eventListeners[aEventType]=[];}this._eventListeners[aEventType].push(aFunction);return this;}},{key:'removeEventListener',value:function removeEventListener(aEventType,aFunction){if(this._eventListeners===null){this._eventListeners={};}var currentArray=this._eventListeners[aEventType];if(typeof currentArray==='undefined'){return this;}var currentArrayLength=currentArray.length;for(var i=0;i<currentArrayLength;i++){if(currentArray[i]===aFunction){currentArray.splice(i,1);i--;currentArrayLength--;}}return this;}},{key:'dispatchEvent',value:function dispatchEvent(aEvent){if(this._eventListeners===null){this._eventListeners={};}var eventType=aEvent.type;try{if(aEvent.target===null){aEvent.target=this;}aEvent.currentTarget=this;}catch(theError){var newEvent={'type':eventType,'detail':aEvent.detail,'dispatcher':this};return this.dispatchEvent(newEvent);}var currentEventListeners=this._eventListeners[eventType];if(currentEventListeners!==null&&currentEventListeners!==undefined){var currentArray=this._copyArray(currentEventListeners);var currentArrayLength=currentArray.length;for(var i=0;i<currentArrayLength;i++){var currentFunction=currentArray[i];currentFunction.call(this,aEvent);}}return this;}},{key:'dispatchCustomEvent',value:function dispatchCustomEvent(aEventType,aDetail){var newEvent=undefined;if(supportsCustomEvents){newEvent=document.createEvent('CustomEvent');newEvent.dispatcher=this;newEvent.initCustomEvent(aEventType,false,false,aDetail);}else {newEvent={'type':aEventType,'detail':aDetail,'dispatcher':this};}return this.dispatchEvent(newEvent);}},{key:'_destroy',value:function _destroy(){if(this._eventListeners!==null){for(var objectName in this._eventListeners){if(this._eventListeners.hasOwnProperty(objectName)){var currentArray=this._eventListeners[objectName];var currentArrayLength=currentArray.length;for(var i=0;i<currentArrayLength;i++){currentArray[i]=null;}delete this._eventListeners[objectName];}}this._eventListeners=null;}}},{key:'_copyArray',value:function _copyArray(aArray){var currentArray=new Array(aArray.length);var currentArrayLength=currentArray.length;for(var i=0;i<currentArrayLength;i++){currentArray[i]=aArray[i];}return currentArray;}}]);return EventDispatcher;}();exports.default=EventDispatcher;},{}],35:[function(_dereq_,module,exports){ // HDRParser.js
'use strict'; //Code ported by Marcin Ignac (2014)
//Based on Java implementation from
//https://code.google.com/r/cys12345-research/source/browse/hdr/image_processor/RGBE.java?r=7d84e9fd866b24079dbe61fa0a966ce8365f5726
Object.defineProperty(exports,"__esModule",{value:true});var radiancePattern='#\\?RADIANCE';var commentPattern='#.*'; // let gammaPattern = 'GAMMA=';
var exposurePattern='EXPOSURE=\\s*([0-9]*[.][0-9]*)';var formatPattern='FORMAT=32-bit_rle_rgbe';var widthHeightPattern='-Y ([0-9]+) \\+X ([0-9]+)'; //http://croquetweak.blogspot.co.uk/2014/08/deconstructing-floats-frexp-and-ldexp.html
// function ldexp(mantissa, exponent) {
//     return exponent > 1023 ? mantissa * Math.pow(2, 1023) * Math.pow(2, exponent - 1023) : exponent < -1074 ? mantissa * Math.pow(2, -1074) * Math.pow(2, exponent + 1074) : mantissa * Math.pow(2, exponent);
// }
function readPixelsRawRLE(buffer,data,offset,fileOffset,scanline_width,num_scanlines){var rgbe=new Array(4);var scanline_buffer=null;var ptr=undefined;var ptr_end=undefined;var count=undefined;var buf=new Array(2);var bufferLength=buffer.length;function readBuf(buf){var bytesRead=0;do {buf[bytesRead++]=buffer[fileOffset];}while(++fileOffset<bufferLength&&bytesRead<buf.length);return bytesRead;}function readBufOffset(buf,offset,length){var bytesRead=0;do {buf[offset+bytesRead++]=buffer[fileOffset];}while(++fileOffset<bufferLength&&bytesRead<length);return bytesRead;}function readPixelsRaw(buffer,data,offset,numpixels){var numExpected=4*numpixels;var numRead=readBufOffset(data,offset,numExpected);if(numRead<numExpected){throw new Error('Error reading raw pixels: got '+numRead+' bytes, expected '+numExpected);}}while(num_scanlines>0){if(readBuf(rgbe)<rgbe.length){throw new Error('Error reading bytes: expected '+rgbe.length);}if(rgbe[0]!==2||rgbe[1]!==2||(rgbe[2]&0x80)!==0){ //this file is not run length encoded
data[offset++]=rgbe[0];data[offset++]=rgbe[1];data[offset++]=rgbe[2];data[offset++]=rgbe[3];readPixelsRaw(buffer,data,offset,scanline_width*num_scanlines-1);return;}if(((rgbe[2]&0xFF)<<8|rgbe[3]&0xFF)!==scanline_width){throw new Error('Wrong scanline width '+((rgbe[2]&0xFF)<<8|rgbe[3]&0xFF)+', expected '+scanline_width);}if(scanline_buffer===null){scanline_buffer=new Array(4*scanline_width);}ptr=0; /* read each of the four channels for the scanline into the buffer */for(var i=0;i<4;i++){ptr_end=(i+1)*scanline_width;while(ptr<ptr_end){if(readBuf(buf)<buf.length){throw new Error('Error reading 2-byte buffer');}if((buf[0]&0xFF)>128){ /* a run of the same value */count=(buf[0]&0xFF)-128;if(count===0||count>ptr_end-ptr){throw new Error('Bad scanline data');}while(count-->0){scanline_buffer[ptr++]=buf[1];}}else { /* a non-run */count=buf[0]&0xFF;if(count===0||count>ptr_end-ptr){throw new Error('Bad scanline data');}scanline_buffer[ptr++]=buf[1];if(--count>0){if(readBufOffset(scanline_buffer,ptr,count)<count){throw new Error('Error reading non-run data');}ptr+=count;}}}} /* copy byte data to output */for(var i=0;i<scanline_width;i++){data[offset+0]=scanline_buffer[i];data[offset+1]=scanline_buffer[i+scanline_width];data[offset+2]=scanline_buffer[i+2*scanline_width];data[offset+3]=scanline_buffer[i+3*scanline_width];offset+=4;}num_scanlines--;}} //Returns data as floats and flipped along Y by default
function parseHdr(buffer){if(buffer instanceof ArrayBuffer){buffer=new Uint8Array(buffer);}var fileOffset=0;var bufferLength=buffer.length;var NEW_LINE=10;function readLine(){var buf='';do {var b=buffer[fileOffset];if(b===NEW_LINE){++fileOffset;break;}buf+=String.fromCharCode(b);}while(++fileOffset<bufferLength);return buf;}var width=0;var height=0;var exposure=1;var gamma=1;var rle=false;for(var i=0;i<20;i++){var line=readLine();var match=undefined;if(match=line.match(radiancePattern)){}else if(match=line.match(formatPattern)){rle=true;}else if(match=line.match(exposurePattern)){exposure=Number(match[1]);}else if(match=line.match(commentPattern)){}else if(match=line.match(widthHeightPattern)){height=Number(match[1]);width=Number(match[2]);break;}}if(!rle){throw new Error('File is not run length encoded!');}var data=new Uint8Array(width*height*4);var scanline_width=width;var num_scanlines=height;readPixelsRawRLE(buffer,data,0,fileOffset,scanline_width,num_scanlines); //TODO: Should be Float16
var floatData=new Float32Array(width*height*4);for(var offset=0;offset<data.length;offset+=4){var r=data[offset+0]/255;var g=data[offset+1]/255;var b=data[offset+2]/255;var e=data[offset+3];var f=Math.pow(2.0,e-128.0);r*=f;g*=f;b*=f;var floatOffset=offset;floatData[floatOffset+0]=r;floatData[floatOffset+1]=g;floatData[floatOffset+2]=b;floatData[floatOffset+3]=1.0;}return {shape:[width,height],exposure:exposure,gamma:gamma,data:floatData};}exports.default=parseHdr;},{}],36:[function(_dereq_,module,exports){ // OrbitalControl.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _EaseNumber=_dereq_('./EaseNumber');var _EaseNumber2=_interopRequireDefault(_EaseNumber);var _Scheduler=_dereq_('./Scheduler');var _Scheduler2=_interopRequireDefault(_Scheduler);var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var getMouse=function getMouse(mEvent,mTarget){var o=mTarget||{};if(mEvent.touches){o.x=mEvent.touches[0].pageX;o.y=mEvent.touches[0].pageY;}else {o.x=mEvent.clientX;o.y=mEvent.clientY;}return o;};var OrbitalControl=function(){function OrbitalControl(mTarget){var _this=this;var mListenerTarget=arguments.length<=1||arguments[1]===undefined?window:arguments[1];var mRadius=arguments.length<=2||arguments[2]===undefined?500:arguments[2];_classCallCheck(this,OrbitalControl);this._target=mTarget;this._listenerTarget=mListenerTarget;this._mouse={};this._preMouse={};this.center=_glMatrix2.default.vec3.create();this._up=_glMatrix2.default.vec3.fromValues(0,1,0);this.radius=new _EaseNumber2.default(mRadius);this.position=_glMatrix2.default.vec3.fromValues(0,0,this.radius.value);this.positionOffset=_glMatrix2.default.vec3.create();this._rx=new _EaseNumber2.default(0);this._rx.limit(-Math.PI/2,Math.PI/2);this._ry=new _EaseNumber2.default(0);this._preRX=0;this._preRY=0;this._isLockZoom=false;this._isLockRotation=false;this._isInvert=false;this._listenerTarget.addEventListener('mousewheel',function(e){return _this._onWheel(e);});this._listenerTarget.addEventListener('DOMMouseScroll',function(e){return _this._onWheel(e);});this._listenerTarget.addEventListener('mousedown',function(e){return _this._onDown(e);});this._listenerTarget.addEventListener('touchstart',function(e){return _this._onDown(e);});this._listenerTarget.addEventListener('mousemove',function(e){return _this._onMove(e);});this._listenerTarget.addEventListener('touchmove',function(e){return _this._onMove(e);});window.addEventListener('touchend',function(){return _this._onUp();});window.addEventListener('mouseup',function(){return _this._onUp();});_Scheduler2.default.addEF(function(){return _this._loop();});} //	PUBLIC METHODS
_createClass(OrbitalControl,[{key:'lock',value:function lock(){var mValue=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isLockZoom=mValue;this._isLockRotation=mValue;}},{key:'lockZoom',value:function lockZoom(){var mValue=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isLockZoom=mValue;}},{key:'lockRotation',value:function lockRotation(){var mValue=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isLockRotation=mValue;}},{key:'inverseControl',value:function inverseControl(){var isInvert=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isInvert=isInvert;} //	EVENT HANDLERES
},{key:'_onDown',value:function _onDown(mEvent){if(this._isLockRotation){return;}this._isMouseDown=true;getMouse(mEvent,this._mouse);getMouse(mEvent,this._preMouse);this._preRX=this._rx.targetValue;this._preRY=this._ry.targetValue;}},{key:'_onMove',value:function _onMove(mEvent){if(this._isLockRotation){return;}getMouse(mEvent,this._mouse);if(mEvent.touches){mEvent.preventDefault();}if(this._isMouseDown){var diffX=-(this._mouse.x-this._preMouse.x);if(this._isInvert){diffX*=-1;}this._ry.value=this._preRY-diffX*0.01;var diffY=-(this._mouse.y-this._preMouse.y);if(this._isInvert){diffY*=-1;}this._rx.value=this._preRX-diffY*0.01;}}},{key:'_onUp',value:function _onUp(){if(this._isLockRotation){return;}this._isMouseDown=false;}},{key:'_onWheel',value:function _onWheel(mEvent){if(this._isLockZoom){return;}var w=mEvent.wheelDelta;var d=mEvent.detail;var value=0;if(d){if(w){value=w/d/40*d>0?1:-1; // Opera
}else {value=-d/3; // Firefox;         TODO: do not /3 for OS X
}}else {value=w/120;}this.radius.add(-value*2);} //	PRIVATE METHODS
},{key:'_loop',value:function _loop(){this._updatePosition();if(this._target){this._updateCamera();}}},{key:'_updatePosition',value:function _updatePosition(){this.position[1]=Math.sin(this._rx.value)*this.radius.value;var tr=Math.cos(this._rx.value)*this.radius.value;this.position[0]=Math.cos(this._ry.value+Math.PI*0.5)*tr;this.position[2]=Math.sin(this._ry.value+Math.PI*0.5)*tr;_glMatrix2.default.vec3.add(this.position,this.position,this.positionOffset);}},{key:'_updateCamera',value:function _updateCamera(){this._target.lookAt(this.position,this.center,this._up);}}]);return OrbitalControl;}();exports.default=OrbitalControl;},{"./EaseNumber":33,"./Scheduler":38,"gl-matrix":1}],37:[function(_dereq_,module,exports){ // QuatRotation.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});var _glMatrix=_dereq_('gl-matrix');var _glMatrix2=_interopRequireDefault(_glMatrix);var _EaseNumber=_dereq_('./EaseNumber');var _EaseNumber2=_interopRequireDefault(_EaseNumber);var _Scheduler=_dereq_('./Scheduler');var _Scheduler2=_interopRequireDefault(_Scheduler);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var getMouse=function getMouse(mEvent,mTarget){var o=mTarget||{};if(mEvent.touches){o.x=mEvent.touches[0].pageX;o.y=mEvent.touches[0].pageY;}else {o.x=mEvent.clientX;o.y=mEvent.clientY;}return o;};var QuatRotation=function(){function QuatRotation(mTarget){var _this=this;var mListenerTarget=arguments.length<=1||arguments[1]===undefined?window:arguments[1];var mEasing=arguments.length<=2||arguments[2]===undefined?0.1:arguments[2];_classCallCheck(this,QuatRotation);this._target=mTarget;this._listenerTarget=mListenerTarget;this.matrix=_glMatrix2.default.mat4.create();this.m=_glMatrix2.default.mat4.create();this._vZaxis=_glMatrix2.default.vec3.clone([0,0,0]);this._zAxis=_glMatrix2.default.vec3.clone([0,0,1]);this.preMouse={x:0,y:0};this.mouse={x:0,y:0};this._isMouseDown=false;this._rotation=_glMatrix2.default.quat.create();this.tempRotation=_glMatrix2.default.quat.create();this._rotateZMargin=0;this._offset=0.004;this._slerp=-1;this._isLocked=false;this._diffX=new _EaseNumber2.default(0,mEasing);this._diffY=new _EaseNumber2.default(0,mEasing);this._listenerTarget.addEventListener('mousedown',function(e){return _this._onDown(e);});this._listenerTarget.addEventListener('touchstart',function(e){return _this._onDown(e);});this._listenerTarget.addEventListener('mousemove',function(e){return _this._onMove(e);});this._listenerTarget.addEventListener('touchmove',function(e){return _this._onMove(e);});window.addEventListener('touchend',function(){return _this._onUp();});window.addEventListener('mouseup',function(){return _this._onUp();});_Scheduler2.default.addEF(function(){return _this._loop();});} // 	PUBLIC METHODS
_createClass(QuatRotation,[{key:'inverseControl',value:function inverseControl(){var isInvert=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isInvert=isInvert;}},{key:'lock',value:function lock(){var mValue=arguments.length<=0||arguments[0]===undefined?true:arguments[0];this._isLocked=mValue;}},{key:'setCameraPos',value:function setCameraPos(mQuat){var speed=arguments.length<=1||arguments[1]===undefined?0.1:arguments[1];this.easing=speed;if(this._slerp>0){return;}var tempRotation=_glMatrix2.default.quat.clone(this._rotation);this._updateRotation(tempRotation);this._rotation=_glMatrix2.default.quat.clone(tempRotation);this._currDiffX=this.diffX=0;this._currDiffY=this.diffY=0;this._isMouseDown=false;this._isRotateZ=0;this._targetQuat=_glMatrix2.default.quat.clone(mQuat);this._slerp=1;}},{key:'resetQuat',value:function resetQuat(){this._rotation=_glMatrix2.default.quat.clone([0,0,1,0]);this.tempRotation=_glMatrix2.default.quat.clone([0,0,0,0]);this._targetQuat=undefined;this._slerp=-1;} //	EVENT HANDLER
},{key:'_onDown',value:function _onDown(mEvent){if(this._isLocked){return;}var mouse=getMouse(mEvent);var tempRotation=_glMatrix2.default.quat.clone(this._rotation);this._updateRotation(tempRotation);this._rotation=tempRotation;this._isMouseDown=true;this._isRotateZ=0;this.preMouse={x:mouse.x,y:mouse.y};if(mouse.y<this._rotateZMargin||mouse.y>window.innerHeight-this._rotateZMargin){this._isRotateZ=1;}else if(mouse.x<this._rotateZMargin||mouse.x>window.innerWidth-this._rotateZMargin){this._isRotateZ=2;}this._diffX.setTo(0);this._diffY.setTo(0);}},{key:'_onMove',value:function _onMove(mEvent){if(this._isLocked){return;}getMouse(mEvent,this.mouse);}},{key:'_onUp',value:function _onUp(){if(this._isLocked){return;}this._isMouseDown=false;} //	PRIVATE METHODS
},{key:'_updateRotation',value:function _updateRotation(mTempRotation){if(this._isMouseDown&&!this._isLocked){this._diffX.value=-(this.mouse.x-this.preMouse.x);this._diffY.value=this.mouse.y-this.preMouse.y;if(this._isInvert){this._diffX.value=-this._diffX.targetValue;this._diffY.value=-this._diffY.targetValue;}}var angle=undefined,_quat=undefined;if(this._isRotateZ>0){if(this._isRotateZ===1){angle=-this._diffX.value*this._offset;angle*=this.preMouse.y<this._rotateZMargin?-1:1;_quat=_glMatrix2.default.quat.clone([0,0,Math.sin(angle),Math.cos(angle)]);_glMatrix2.default.quat.multiply(_quat,mTempRotation,_quat);}else {angle=-this._diffY.value*this._offset;angle*=this.preMouse.x<this._rotateZMargin?1:-1;_quat=_glMatrix2.default.quat.clone([0,0,Math.sin(angle),Math.cos(angle)]);_glMatrix2.default.quat.multiply(_quat,mTempRotation,_quat);}}else {var v=_glMatrix2.default.vec3.clone([this._diffX.value,this._diffY.value,0]);var axis=_glMatrix2.default.vec3.create();_glMatrix2.default.vec3.cross(axis,v,this._zAxis);_glMatrix2.default.vec3.normalize(axis,axis);angle=_glMatrix2.default.vec3.length(v)*this._offset;_quat=_glMatrix2.default.quat.clone([Math.sin(angle)*axis[0],Math.sin(angle)*axis[1],Math.sin(angle)*axis[2],Math.cos(angle)]);_glMatrix2.default.quat.multiply(mTempRotation,_quat,mTempRotation);}}},{key:'_loop',value:function _loop(){_glMatrix2.default.mat4.identity(this.m);if(this._targetQuat===undefined){_glMatrix2.default.quat.set(this.tempRotation,this._rotation[0],this._rotation[1],this._rotation[2],this._rotation[3]);this._updateRotation(this.tempRotation);}else {this._slerp+=(0-this._slerp)*0.1;if(this._slerp<0.001){_glMatrix2.default.quat.set(this._rotation,this._targetQuat[0],this._targetQuat[1],this._targetQuat[2],this._targetQuat[3]);this._targetQuat=undefined;this._slerp=-1;}else {_glMatrix2.default.quat.set(this.tempRotation,0,0,0,0);_glMatrix2.default.quat.slerp(this.tempRotation,this._targetQuat,this._rotation,this._slerp);}}_glMatrix2.default.vec3.transformQuat(this._vZaxis,this._vZaxis,this.tempRotation);_glMatrix2.default.mat4.fromQuat(this.matrix,this.tempRotation);} //	GETTER AND SETTER
},{key:'easing',set:function set(mValue){this._diffX.easing=mValue;this._diffY.easing=mValue;},get:function get(){return this._diffX.easing;}}]);return QuatRotation;}();exports.default=QuatRotation;},{"./EaseNumber":33,"./Scheduler":38,"gl-matrix":1}],38:[function(_dereq_,module,exports){ // Scheduler.js
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}if(window.requestAnimFrame===undefined){window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback){window.setTimeout(callback,1000/60);};}();}var FRAMERATE=60;var Scheduler=function(){function Scheduler(){_classCallCheck(this,Scheduler);this._delayTasks=[];this._nextTasks=[];this._deferTasks=[];this._highTasks=[];this._usurpTask=[];this._enterframeTasks=[];this._idTable=0;this._loop();} //	PUBLIC METHODS
_createClass(Scheduler,[{key:'addEF',value:function addEF(func,params){params=params||[];var id=this._idTable;this._enterframeTasks[id]={func:func,params:params};this._idTable++;return id;}},{key:'removeEF',value:function removeEF(id){if(this._enterframeTasks[id]!==undefined){this._enterframeTasks[id]=null;}return -1;}},{key:'delay',value:function delay(func,params,_delay){var time=new Date().getTime();var t={func:func,params:params,delay:_delay,time:time};this._delayTasks.push(t);}},{key:'defer',value:function defer(func,params){var t={func:func,params:params};this._deferTasks.push(t);}},{key:'next',value:function next(func,params){var t={func:func,params:params};this._nextTasks.push(t);}},{key:'usurp',value:function usurp(func,params){var t={func:func,params:params};this._usurpTask.push(t);} //	PRIVATE METHODS
},{key:'_process',value:function _process(){var i=0,task=undefined,interval=undefined,current=undefined;for(i=0;i<this._enterframeTasks.length;i++){task=this._enterframeTasks[i];if(task!==null&&task!==undefined){ // task.func.apply(task.scope, task.params);
// console.log(task.func());
task.func(task.params);}}while(this._highTasks.length>0){task=this._highTasks.pop();task.func(task.params); // task.func.apply(task.scope, task.params);
}var startTime=new Date().getTime();for(i=0;i<this._delayTasks.length;i++){task=this._delayTasks[i];if(startTime-task.time>task.delay){ // task.func.apply(task.scope, task.params);
task.func(task.params);this._delayTasks.splice(i,1);}}startTime=new Date().getTime();interval=1000/FRAMERATE;while(this._deferTasks.length>0){task=this._deferTasks.shift();current=new Date().getTime();if(current-startTime<interval){ // task.func.apply(task.scope, task.params);
task.func(task.params);}else {this._deferTasks.unshift(task);break;}}startTime=new Date().getTime();interval=1000/FRAMERATE;while(this._usurpTask.length>0){task=this._usurpTask.shift();current=new Date().getTime();if(current-startTime<interval){ // task.func.apply(task.scope, task.params);
task.func(task.params);}else { // this._usurpTask.unshift(task);
break;}}this._highTasks=this._highTasks.concat(this._nextTasks);this._nextTasks=[];this._usurpTask=[];}},{key:'_loop',value:function _loop(){var _this=this;this._process();window.requestAnimFrame(function(){return _this._loop();});}}]);return Scheduler;}();var scheduler=new Scheduler();exports.default=scheduler;},{}],39:[function(_dereq_,module,exports){ // ShaderLbs.js
'use strict';Object.defineProperty(exports,"__esModule",{value:true});var ShaderLibs={simpleColorFrag:"#define GLSLIFY 1\n// simpleColor.frag\n\n#define SHADER_NAME SIMPLE_COLOR\n\nprecision highp float;\n\nuniform vec3 color;\nuniform float opacity;\n\nvoid main(void) {\n    gl_FragColor = vec4(color, opacity);\n}",bigTriangleVert:"#define GLSLIFY 1\n// bigTriangle.vert\n\n#define SHADER_NAME BIG_TRIANGLE_VERTEX\n\nprecision highp float;\nattribute vec2 aPosition;\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n    gl_Position = vec4(aPosition, 0.0, 1.0);\n    vTextureCoord = aPosition * .5 + .5;\n}",generalVert:"#define GLSLIFY 1\n// general.vert\n\n#define SHADER_NAME GENERAL_VERTEX\n\nprecision highp float;\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nuniform vec3 position;\nuniform vec3 scale;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n\tvec3 pos      = aVertexPosition * scale;\n\tpos           += position;\n\tgl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);\n\tvTextureCoord = aTextureCoord;\n}",generalNormalVert:"#define GLSLIFY 1\n// generalWithNormal.vert\n\n#define SHADER_NAME GENERAL_VERTEX\n\nprecision highp float;\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform mat3 uNormalMatrix;\n\nuniform vec3 position;\nuniform vec3 scale;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n\tvec3 pos      = aVertexPosition * scale;\n\tpos           += position;\n\tgl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);\n\t\n\tvTextureCoord = aTextureCoord;\n\tvNormal       = normalize(uNormalMatrix * aNormal);\n}"};exports.default=ShaderLibs;},{}]},{},[11])(11);}); 

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

!function (t) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = t();else if ("function" == typeof define && define.amd) define([], t);else {
    var e;"undefined" != typeof window ? e = window : "undefined" != typeof global ? e = global : "undefined" != typeof self && (e = self), e.Sono = t();
  }
}(function () {
  var t;return function e(t, n, i) {
    function o(r, u) {
      if (!n[r]) {
        if (!t[r]) {
          var a = "function" == typeof require && require;if (!u && a) return a(r, !0);if (s) return s(r, !0);var c = new Error("Cannot find module '" + r + "'");throw c.code = "MODULE_NOT_FOUND", c;
        }var h = n[r] = { exports: {} };t[r][0].call(h.exports, function (e) {
          var n = t[r][1][e];return o(n ? n : e);
        }, h, h.exports, e, t, n, i);
      }return n[r].exports;
    }for (var s = "function" == typeof require && require, r = 0; r < i.length; r++) {
      o(i[r]);
    }return o;
  }({ 1: [function (t, e) {
      "use strict";
      function n() {
        this.VERSION = "0.0.6", window.AudioContext = window.AudioContext || window.webkitAudioContext;var t = window.AudioContext ? new window.AudioContext() : null,
            e = t ? t.destination : null;this._group = new s(t, e), this._gain = this._group.gain, this._sounds = this._group.sounds, this._context = t, c.setContext(t), this._handleTouchlock(), this._handlePageVisibility();
      }var i = t("./lib/utils/browser.js"),
          o = t("./lib/utils/file.js"),
          s = t("./lib/group.js"),
          r = t("./lib/utils/loader.js"),
          u = t("./lib/sound.js"),
          a = t("./lib/utils/sound-group.js"),
          c = t("./lib/utils/utils.js");n.prototype.createSound = function (t) {
        if (o.containsURL(t)) return this.load(t);var e = t && t.noWebAudio ? null : this._context,
            n = new u(e, this._gain);return n.isTouchLocked = this._isTouchLocked, t && (n.data = t.data || t, n.id = void 0 !== t.id ? t.id : "", n.loop = !!t.loop, n.volume = t.volume), this._group.add(n), n;
      }, n.prototype.destroySound = function (t) {
        return t ? (this._sounds.some(function (e, n, i) {
          return e === t || e.id === t ? (i.splice(n, 1), e.loader && (e.loader.destroy(), e.loader = null), e.destroy(), !0) : void 0;
        }), this) : void 0;
      }, n.prototype.destroyAll = function () {
        return this._group.destroy(), this;
      }, n.prototype.getSound = function (t) {
        var e = null;return this._sounds.some(function (n) {
          return n.id === t ? (e = n, !0) : void 0;
        }), e;
      }, n.prototype.createGroup = function (t) {
        var e = new a(this._context, this._gain);return t && t.forEach(function (t) {
          e.add(t);
        }), e;
      }, n.prototype.load = function (t) {
        if (!t) throw new Error("ArgumentException: Sono.load: param config is undefined");var e,
            n,
            i = !!t.noWebAudio || !!t.asMediaElement,
            s = t.onProgress,
            u = t.onComplete,
            a = t.thisArg || t.context || this,
            c = t.url || t;if (o.containsURL(c)) e = this._queue(t, i), n = e.loader;else {
          if (!Array.isArray(c) || !o.containsURL(c[0].url)) return null;e = [], n = new r.Group(), c.forEach(function (t) {
            e.push(this._queue(t, i, n));
          }, this);
        }return s && n.onProgress.add(s, a), u && n.onComplete.addOnce(function () {
          u.call(a, e);
        }), n.start(), e;
      }, n.prototype._queue = function (t, e, n) {
        var i = o.getSupportedFile(t.url || t),
            s = t && t.noWebAudio ? null : this._context,
            a = new u(s, this._gain);a.isTouchLocked = this._isTouchLocked, this._group.add(a), a.id = void 0 !== t.id ? t.id : "", a.loop = !!t.loop, a.volume = t.volume;var c = new r(i);return c.audioContext = e ? null : this._context, c.isTouchLocked = this._isTouchLocked, c.onBeforeComplete.addOnce(function (t) {
          a.data = t;
        }), a.loader = c, n && n.add(c), a;
      }, n.prototype.mute = function () {
        return this._group.mute(), this;
      }, n.prototype.unMute = function () {
        return this._group.unMute(), this;
      }, Object.defineProperty(n.prototype, "volume", { get: function get() {
          return this._group.volume;
        }, set: function set(t) {
          this._group.volume = t;
        } }), n.prototype.fade = function (t, e) {
        return this._group.fade(t, e), this;
      }, n.prototype.pauseAll = function () {
        return this._group.pause(), this;
      }, n.prototype.resumeAll = function () {
        return this._group.resume(), this;
      }, n.prototype.stopAll = function () {
        return this._group.stop(), this;
      }, n.prototype.play = function (t, e, n) {
        return this.getSound(t).play(e, n), this;
      }, n.prototype.pause = function (t) {
        return this.getSound(t).pause(), this;
      }, n.prototype.stop = function (t) {
        return this.getSound(t).stop(), this;
      }, n.prototype._handleTouchlock = function () {
        var t = function t() {
          this._isTouchLocked = !1, this._sounds.forEach(function (t) {
            t.isTouchLocked = !1, t.loader && (t.loader.isTouchLocked = !1);
          });
        };this._isTouchLocked = i.handleTouchLock(t, this);
      }, n.prototype._handlePageVisibility = function () {
        function t() {
          o.forEach(function (t) {
            t.playing && (t.pause(), n.push(t));
          });
        }function e() {
          for (; n.length;) {
            n.pop().play();
          }
        }var n = [],
            o = this._sounds;i.handlePageVisibility(t, e, this);
      }, n.prototype.log = function () {
        var t = "Sono " + this.VERSION,
            e = "Supported:" + this.isSupported + " WebAudioAPI:" + this.hasWebAudio + " TouchLocked:" + this._isTouchLocked + " Extensions:" + o.extensions;if (navigator.userAgent.indexOf("Chrome") > -1) {
          var n = ["%c ♫ " + t + " ♫ %c " + e + " ", "color: #FFFFFF; background: #379F7A", "color: #1F1C0D; background: #E0FBAC"];console.log.apply(console, n);
        } else window.console && window.console.log.call && console.log.call(console, t + " " + e);
      }, Object.defineProperties(n.prototype, { canPlay: { get: function get() {
            return o.canPlay;
          } }, context: { get: function get() {
            return this._context;
          } }, effect: { get: function get() {
            return this._group.effect;
          } }, extensions: { get: function get() {
            return o.extensions;
          } }, hasWebAudio: { get: function get() {
            return !!this._context;
          } }, isSupported: { get: function get() {
            return o.extensions.length > 0;
          } }, gain: { get: function get() {
            return this._gain;
          } }, sounds: { get: function get() {
            return this._group.sounds.slice(0);
          } }, utils: { get: function get() {
            return c;
          } } }), e.exports = new n();
    }, { "./lib/group.js": 14, "./lib/sound.js": 15, "./lib/utils/browser.js": 21, "./lib/utils/file.js": 22, "./lib/utils/loader.js": 23, "./lib/utils/sound-group.js": 25, "./lib/utils/utils.js": 26 }], 2: [function (e, n) {
      !function (e) {
        function i(t, e, n, i, o) {
          this._listener = e, this._isOnce = n, this.context = i, this._signal = t, this._priority = o || 0;
        }function o(t, e) {
          if ("function" != typeof t) throw new Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", e));
        }function s() {
          this._bindings = [], this._prevParams = null;var t = this;this.dispatch = function () {
            s.prototype.dispatch.apply(t, arguments);
          };
        }i.prototype = { active: !0, params: null, execute: function execute(t) {
            var e, n;return this.active && this._listener && (n = this.params ? this.params.concat(t) : t, e = this._listener.apply(this.context, n), this._isOnce && this.detach()), e;
          }, detach: function detach() {
            return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
          }, isBound: function isBound() {
            return !!this._signal && !!this._listener;
          }, isOnce: function isOnce() {
            return this._isOnce;
          }, getListener: function getListener() {
            return this._listener;
          }, getSignal: function getSignal() {
            return this._signal;
          }, _destroy: function _destroy() {
            delete this._signal, delete this._listener, delete this.context;
          }, toString: function toString() {
            return "[SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]";
          } }, s.prototype = { VERSION: "1.0.0", memorize: !1, _shouldPropagate: !0, active: !0, _registerListener: function _registerListener(t, e, n, o) {
            var s,
                r = this._indexOfListener(t, n);if (-1 !== r) {
              if (s = this._bindings[r], s.isOnce() !== e) throw new Error("You cannot add" + (e ? "" : "Once") + "() then add" + (e ? "Once" : "") + "() the same listener without removing the relationship first.");
            } else s = new i(this, t, e, n, o), this._addBinding(s);return this.memorize && this._prevParams && s.execute(this._prevParams), s;
          }, _addBinding: function _addBinding(t) {
            var e = this._bindings.length;do {
              --e;
            } while (this._bindings[e] && t._priority <= this._bindings[e]._priority);this._bindings.splice(e + 1, 0, t);
          }, _indexOfListener: function _indexOfListener(t, e) {
            for (var n, i = this._bindings.length; i--;) {
              if (n = this._bindings[i], n._listener === t && n.context === e) return i;
            }return -1;
          }, has: function has(t, e) {
            return -1 !== this._indexOfListener(t, e);
          }, add: function add(t, e, n) {
            return o(t, "add"), this._registerListener(t, !1, e, n);
          }, addOnce: function addOnce(t, e, n) {
            return o(t, "addOnce"), this._registerListener(t, !0, e, n);
          }, remove: function remove(t, e) {
            o(t, "remove");var n = this._indexOfListener(t, e);return -1 !== n && (this._bindings[n]._destroy(), this._bindings.splice(n, 1)), t;
          }, removeAll: function removeAll() {
            for (var t = this._bindings.length; t--;) {
              this._bindings[t]._destroy();
            }this._bindings.length = 0;
          }, getNumListeners: function getNumListeners() {
            return this._bindings.length;
          }, halt: function halt() {
            this._shouldPropagate = !1;
          }, dispatch: function dispatch() {
            if (this.active) {
              var t,
                  e = Array.prototype.slice.call(arguments),
                  n = this._bindings.length;if (this.memorize && (this._prevParams = e), n) {
                t = this._bindings.slice(), this._shouldPropagate = !0;do {
                  n--;
                } while (t[n] && this._shouldPropagate && t[n].execute(e) !== !1);
              }
            }
          }, forget: function forget() {
            this._prevParams = null;
          }, dispose: function dispose() {
            this.removeAll(), delete this._bindings, delete this._prevParams;
          }, toString: function toString() {
            return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]";
          } };var r = s;r.Signal = s, "function" == typeof t && t.amd ? t(function () {
          return r;
        }) : "undefined" != typeof n && n.exports ? n.exports = r : e.signals = r;
      }(this);
    }, {}], 3: [function (t, e) {
      "use strict";
      function n(t) {
        this._context = t || new r(), this._destination = null, this._nodeList = [], this._sourceNode = null;
      }var i = t("./effect/analyser.js"),
          o = t("./effect/distortion.js"),
          s = t("./effect/echo.js"),
          r = t("./effect/fake-context.js"),
          u = t("./effect/filter.js"),
          a = t("./effect/flanger.js"),
          c = t("./effect/panner.js"),
          h = t("./effect/phaser.js"),
          d = t("./effect/recorder.js"),
          l = t("./effect/reverb.js");n.prototype.add = function (t) {
        return t ? (this._nodeList.push(t), this._updateConnections(), t) : void 0;
      }, n.prototype.remove = function (t) {
        for (var e = this._nodeList.length, n = 0; e > n; n++) {
          if (t === this._nodeList[n]) {
            this._nodeList.splice(n, 1);break;
          }
        }var i = t._output || t;return i.disconnect(), this._updateConnections(), t;
      }, n.prototype.removeAll = function () {
        for (; this._nodeList.length;) {
          this._nodeList.pop().disconnect();
        }return this._updateConnections(), this;
      }, n.prototype.destroy = function () {
        this._context = null, this._destination = null, this._nodeList = [], this._sourceNode = null;
      }, n.prototype._connect = function (t, e) {
        var n = t._output || t;n.disconnect(), n.connect(e);
      }, n.prototype._connectToDestination = function (t) {
        var e = this._nodeList.length,
            n = e ? this._nodeList[e - 1] : this._sourceNode;n && this._connect(n, t), this._destination = t;
      }, n.prototype._updateConnections = function () {
        if (this._sourceNode) {
          for (var t, e, n = 0; n < this._nodeList.length; n++) {
            t = this._nodeList[n], e = 0 === n ? this._sourceNode : this._nodeList[n - 1], this._connect(e, t);
          }this._destination && this._connectToDestination(this._destination);
        }
      }, Object.defineProperty(n.prototype, "panning", { get: function get() {
          return this._panning || (this._panning = new c(this._context)), this._panning;
        } }), n.prototype.analyser = function (t, e, n, o) {
        var s = new i(this._context, t, e, n, o);return this.add(s);
      }, n.prototype.compressor = function (t) {
        t = t || {};var e = this._context.createDynamicsCompressor();return e.update = function (t) {
          e.threshold.value = void 0 !== t.threshold ? t.threshold : -24, e.knee.value = void 0 !== t.knee ? t.knee : 30, e.ratio.value = void 0 !== t.ratio ? t.ratio : 12, e.reduction.value = void 0 !== t.reduction ? t.reduction : -10, e.attack.value = void 0 !== t.attack ? t.attack : 3e-4, e.release.value = void 0 !== t.release ? t.release : .25;
        }, e.update(t), this.add(e);
      }, n.prototype.convolver = function (t) {
        var e = this._context.createConvolver();return e.buffer = t, this.add(e);
      }, n.prototype.delay = function (t) {
        var e = this._context.createDelay();return void 0 !== t && (e.delayTime.value = t), this.add(e);
      }, n.prototype.echo = function (t, e) {
        var n = new s(this._context, t, e);return this.add(n);
      }, n.prototype.distortion = function (t) {
        var e = new o(this._context, t);return this.add(e);
      }, n.prototype.filter = function (t, e, n, i) {
        var o = new u(this._context, t, e, n, i);return this.add(o);
      }, n.prototype.lowpass = function (t, e, n) {
        return this.filter("lowpass", t, e, n);
      }, n.prototype.highpass = function (t, e, n) {
        return this.filter("highpass", t, e, n);
      }, n.prototype.bandpass = function (t, e, n) {
        return this.filter("bandpass", t, e, n);
      }, n.prototype.lowshelf = function (t, e, n) {
        return this.filter("lowshelf", t, e, n);
      }, n.prototype.highshelf = function (t, e, n) {
        return this.filter("highshelf", t, e, n);
      }, n.prototype.peaking = function (t, e, n) {
        return this.filter("peaking", t, e, n);
      }, n.prototype.notch = function (t, e, n) {
        return this.filter("notch", t, e, n);
      }, n.prototype.allpass = function (t, e, n) {
        return this.filter("allpass", t, e, n);
      }, n.prototype.flanger = function (t) {
        var e = new a(this._context, t);return this.add(e);
      }, n.prototype.gain = function (t) {
        var e = this._context.createGain();return void 0 !== t && (e.gain.value = t), e;
      }, n.prototype.panner = function () {
        var t = new c(this._context);return this.add(t);
      }, n.prototype.phaser = function (t) {
        var e = new h(this._context, t);return this.add(e);
      }, n.prototype.recorder = function (t) {
        var e = new d(this._context, t);return this.add(e);
      }, n.prototype.reverb = function (t, e, n) {
        var i = new l(this._context, t, e, n);return this.add(i);
      }, n.prototype.script = function (t) {
        t = t || {};var e = t.bufferSize || 1024,
            n = void 0 === t.inputChannels ? 0 : n,
            i = void 0 === t.outputChannels ? 1 : i,
            o = this._context.createScriptProcessor(e, n, i),
            s = t.thisArg || t.context || o,
            r = t.callback || function () {};return o.onaudioprocess = r.bind(s), this.add(o);
      }, n.prototype.setSource = function (t) {
        return this._sourceNode = t, this._updateConnections(), t;
      }, n.prototype.setDestination = function (t) {
        return this._connectToDestination(t), t;
      }, e.exports = n;
    }, { "./effect/analyser.js": 4, "./effect/distortion.js": 5, "./effect/echo.js": 6, "./effect/fake-context.js": 7, "./effect/filter.js": 8, "./effect/flanger.js": 9, "./effect/panner.js": 10, "./effect/phaser.js": 11, "./effect/recorder.js": 12, "./effect/reverb.js": 13 }], 4: [function (t, e) {
      "use strict";
      function n(t, e, n, i, o) {
        e = e || 32;var s,
            r,
            u = t.createAnalyser();u.fftSize = e, void 0 !== n && (u.smoothingTimeConstant = n), void 0 !== i && (u.minDecibels = i), void 0 !== o && (u.maxDecibels = o);var a = function a() {
          (e !== u.fftSize || void 0 === s) && (s = new Uint8Array(u.fftSize), r = new Uint8Array(u.frequencyBinCount), e = u.fftSize);
        };return a(), u.getWaveform = function () {
          return a(), this.getByteTimeDomainData(s), s;
        }, u.getFrequencies = function () {
          return a(), this.getByteFrequencyData(r), r;
        }, Object.defineProperties(u, { smoothing: { get: function get() {
              return u.smoothingTimeConstant;
            }, set: function set(t) {
              u.smoothingTimeConstant = t;
            } } }), u;
      }e.exports = n;
    }, {}], 5: [function (t, e) {
      "use strict";
      function n(t, e) {
        e = e || 1;var n = t.createWaveShaper();return n.update = function (t) {
          e = t;for (var n, i = 100 * t, o = 22050, s = new Float32Array(o), r = Math.PI / 180, u = 0; o > u; u++) {
            n = 2 * u / o - 1, s[u] = (3 + i) * n * 20 * r / (Math.PI + i * Math.abs(n));
          }this.curve = s;
        }, Object.defineProperties(n, { amount: { get: function get() {
              return e;
            }, set: function set(t) {
              this.update(t);
            } } }), void 0 !== e && n.update(e), n;
      }e.exports = n;
    }, {}], 6: [function (t, e) {
      "use strict";
      function n(t, e, n) {
        var i = t.createGain(),
            o = t.createDelay(),
            s = t.createGain(),
            r = t.createGain();s.gain.value = n || .5, o.delayTime.value = e || .5, i.connect(o), i.connect(r), o.connect(s), s.connect(o), s.connect(r);var u = i;return u.name = "Echo", u._output = r, Object.defineProperties(u, { delay: { get: function get() {
              return o.delayTime.value;
            }, set: function set(t) {
              o.delayTime.value = t;
            } }, feedback: { get: function get() {
              return s.gain.value;
            }, set: function set(t) {
              s.gain.value = t;
            } } }), u;
      }e.exports = n;
    }, {}], 7: [function (t, e) {
      "use strict";
      function n() {
        var t = Date.now(),
            e = function e() {},
            n = function n() {
          return { value: 1, defaultValue: 1, linearRampToValueAtTime: e, setValueAtTime: e, exponentialRampToValueAtTime: e, setTargetAtTime: e, setValueCurveAtTime: e, cancelScheduledValues: e };
        },
            i = function i() {
          return { connect: e, disconnect: e, frequencyBinCount: 0, smoothingTimeConstant: 0, fftSize: 0, minDecibels: 0, maxDecibels: 0, getByteTimeDomainData: e, getByteFrequencyData: e, getFloatTimeDomainData: e, getFloatFrequencyData: e, gain: n(), panningModel: 0, setPosition: e, setOrientation: e, setVelocity: e, distanceModel: 0, refDistance: 0, maxDistance: 0, rolloffFactor: 0, coneInnerAngle: 360, coneOuterAngle: 360, coneOuterGain: 0, type: 0, frequency: n(), delayTime: n(), buffer: 0, threshold: n(), knee: n(), ratio: n(), attack: n(), release: n(), reduction: n(), oversample: 0, curve: 0, sampleRate: 1, length: 0, duration: 0, numberOfChannels: 0, getChannelData: function getChannelData() {
              return [];
            }, copyFromChannel: e, copyToChannel: e, dopplerFactor: 0, speedOfSound: 0, start: e };
        };return window.Uint8Array || (window.Int8Array = window.Uint8Array = window.Uint8ClampedArray = window.Int16Array = window.Uint16Array = window.Int32Array = window.Uint32Array = window.Float32Array = window.Float64Array = Array), { createAnalyser: i, createBuffer: i, createBiquadFilter: i, createChannelMerger: i, createChannelSplitter: i, createDynamicsCompressor: i, createConvolver: i, createDelay: i, createGain: i, createOscillator: i, createPanner: i, createScriptProcessor: i, createWaveShaper: i, listener: i(), get currentTime() {
            return (Date.now() - t) / 1e3;
          } };
      }e.exports = n;
    }, {}], 8: [function (t, e) {
      "use strict";
      function n(t, e, n, i, o) {
        var s = 40,
            r = t.sampleRate / 2,
            u = t.createBiquadFilter();u.type = e, void 0 !== n && (u.frequency.value = n), void 0 !== i && (u.Q.value = i), void 0 !== o && (u.gain.value = o);var a = function a(t) {
          var e = Math.log(r / s) / Math.LN2,
              n = Math.pow(2, e * (t - 1));return r * n;
        };return u.update = function (t, e) {
          void 0 !== t && (this.frequency.value = t), void 0 !== e && (this.gain.value = e);
        }, u.setByPercent = function (t, e, n) {
          u.frequency.value = a(t), void 0 !== e && (u.Q.value = e), void 0 !== n && (u.gain.value = n);
        }, u;
      }e.exports = n;
    }, {}], 9: [function (t, e) {
      "use strict";
      function n(t, e) {
        var n = e.feedback || .5,
            i = e.delay || .005,
            o = e.gain || .002,
            s = e.frequency || .25,
            r = t.createGain(),
            u = t.createDelay(),
            a = t.createGain(),
            c = t.createOscillator(),
            h = t.createGain(),
            d = t.createGain();u.delayTime.value = i, a.gain.value = n, c.type = "sine", c.frequency.value = s, h.gain.value = o, r.connect(d), r.connect(u), u.connect(d), u.connect(a), a.connect(r), c.connect(h), h.connect(u.delayTime), c.start(0);var l = r;return l.name = "Flanger", l._output = d, Object.defineProperties(l, { delay: { get: function get() {
              return u.delayTime.value;
            }, set: function set(t) {
              u.delayTime.value = t;
            } }, lfoFrequency: { get: function get() {
              return c.frequency.value;
            }, set: function set(t) {
              c.frequency.value = t;
            } }, lfoGain: { get: function get() {
              return h.gain.value;
            }, set: function set(t) {
              h.gain.value = t;
            } }, feedback: { get: function get() {
              return a.gain.value;
            }, set: function set(t) {
              a.gain.value = t;
            } } }), l;
      }function i(t, e) {
        var n = e.feedback || .5,
            i = e.delay || .003,
            o = e.gain || .005,
            s = e.frequency || .5,
            r = t.createGain(),
            u = t.createChannelSplitter(2),
            a = t.createChannelMerger(2),
            c = t.createGain(),
            h = t.createGain(),
            d = t.createOscillator(),
            l = t.createGain(),
            f = t.createGain(),
            p = t.createDelay(),
            _ = t.createDelay(),
            g = t.createGain();c.gain.value = h.gain.value = n, p.delayTime.value = _.delayTime.value = i, d.type = "sine", d.frequency.value = s, l.gain.value = o, f.gain.value = 0 - o, r.connect(u), u.connect(p, 0), u.connect(_, 1), p.connect(c), _.connect(h), c.connect(_), h.connect(p), p.connect(a, 0, 0), _.connect(a, 0, 1), a.connect(g), r.connect(g), d.connect(l), d.connect(f), l.connect(p.delayTime), f.connect(_.delayTime), d.start(0);var y = r;return y.name = "StereoFlanger", y._output = g, Object.defineProperties(y, { delay: { get: function get() {
              return p.delayTime.value;
            }, set: function set(t) {
              p.delayTime.value = _.delayTime.value = t;
            } }, lfoFrequency: { get: function get() {
              return d.frequency.value;
            }, set: function set(t) {
              d.frequency.value = t;
            } }, lfoGain: { get: function get() {
              return l.gain.value;
            }, set: function set(t) {
              l.gain.value = f.gain.value = t;
            } }, feedback: { get: function get() {
              return c.gain.value;
            }, set: function set(t) {
              c.gain.value = h.gain.value = t;
            } } }), y;
      }function o(t, e) {
        return e = e || {}, e.stereo ? new i(t, e) : new n(t, e);
      }e.exports = o;
    }, {}], 10: [function (t, e) {
      "use strict";
      function n(t) {
        var e = t.createPanner();e.panningModel = n.defaults.panningModel, e.distanceModel = n.defaults.distanceModel, e.refDistance = n.defaults.refDistance, e.maxDistance = n.defaults.maxDistance, e.rolloffFactor = n.defaults.rolloffFactor, e.coneInnerAngle = n.defaults.coneInnerAngle, e.coneOuterAngle = n.defaults.coneOuterAngle, e.coneOuterGain = n.defaults.coneOuterGain, e.setPosition(0, 0, 0), e.setOrientation(0, 0, 0);var i = { pool: [], get: function get(t, e, n) {
            var i = this.pool.length ? this.pool.pop() : { x: 0, y: 0, z: 0 };return void 0 !== t && isNaN(t) && "x" in t && "y" in t && "z" in t ? (i.x = t.x || 0, i.y = t.y || 0, i.z = t.z || 0) : (i.x = t || 0, i.y = e || 0, i.z = n || 0), i;
          }, dispose: function dispose(t) {
            this.pool.push(t);
          } },
            o = i.get(0, 1, 0),
            s = function s(t, e) {
          var n = i.get(e.x, e.y, e.z);a(n, o), a(n, e), c(n), c(e), t.setOrientation(e.x, e.y, e.z, n.x, n.y, n.z), i.dispose(e), i.dispose(n);
        },
            r = function r(t, e) {
          t.setPosition(e.x, e.y, e.z), i.dispose(e);
        },
            u = function u(t, e) {
          t.setVelocity(e.x, e.y, e.z), i.dispose(e);
        },
            a = function a(t, e) {
          var n = t.x,
              i = t.y,
              o = t.z,
              s = e.x,
              r = e.y,
              u = e.z;t.x = i * u - o * r, t.y = o * s - n * u, t.z = n * r - i * s;
        },
            c = function c(t) {
          if (0 === t.x && 0 === t.y && 0 === t.z) return t;var e = Math.sqrt(t.x * t.x + t.y * t.y + t.z * t.z),
              n = 1 / e;return t.x *= n, t.y *= n, t.z *= n, t;
        };return e.setX = function (t) {
          var n = Math.PI / 4,
              i = 2 * n,
              o = t * n,
              s = o + i;s > i && (s = Math.PI - s), o = Math.sin(o), s = Math.sin(s), e.setPosition(o, 0, s);
        }, e.setSourcePosition = function (t, n, o) {
          r(e, i.get(t, n, o));
        }, e.setSourceOrientation = function (t, n, o) {
          s(e, i.get(t, n, o));
        }, e.setSourceVelocity = function (t, n, o) {
          u(e, i.get(t, n, o));
        }, e.setListenerPosition = function (e, n, o) {
          r(t.listener, i.get(e, n, o));
        }, e.setListenerOrientation = function (e, n, o) {
          s(t.listener, i.get(e, n, o));
        }, e.setListenerVelocity = function (e, n, o) {
          u(t.listener, i.get(e, n, o));
        }, e.calculateVelocity = function (t, e, n) {
          var o = t.x - e.x,
              s = t.y - e.y,
              r = t.z - e.z;return i.get(o / n, s / n, r / n);
        }, e.setDefaults = function (t) {
          Object.keys(t).forEach(function (e) {
            n.defaults[e] = t[e];
          });
        }, e;
      }n.defaults = { panningModel: "HRTF", distanceModel: "linear", refDistance: 1, maxDistance: 1e3, rolloffFactor: 1, coneInnerAngle: 360, coneOuterAngle: 0, coneOuterGain: 0 }, e.exports = n;
    }, {}], 11: [function (t, e) {
      "use strict";
      function n(t, e) {
        e = e || {};var n,
            i = e.stages || 8,
            o = e.frequency || .5,
            s = e.gain || 300,
            r = e.feedback || .5,
            u = [],
            a = t.createGain(),
            c = t.createGain(),
            h = t.createOscillator(),
            d = t.createGain(),
            l = t.createGain();c.gain.value = r, h.type = "sine", h.frequency.value = o, d.gain.value = s;for (var f = 0; i > f; f++) {
          n = t.createBiquadFilter(), n.type = "allpass", n.frequency.value = 1e3 * f, f > 0 && u[f - 1].connect(n), d.connect(n.frequency), u.push(n);
        }var p = u[0],
            _ = u[u.length - 1];a.connect(p), a.connect(l), _.connect(l), _.connect(c), c.connect(p), h.connect(d), h.start(0);var g = a;return g.name = "Phaser", g._output = l, Object.defineProperties(g, { lfoFrequency: { get: function get() {
              return h.frequency.value;
            }, set: function set(t) {
              h.frequency.value = t;
            } }, lfoGain: { get: function get() {
              return d.gain.value;
            }, set: function set(t) {
              d.gain.value = t;
            } }, feedback: { get: function get() {
              return c.gain.value;
            }, set: function set(t) {
              c.gain.value = t;
            } } }), g;
      }e.exports = n;
    }, {}], 12: [function (t, e) {
      "use strict";
      function n(t, e) {
        var n = [],
            i = [],
            o = 0,
            s = 0,
            r = t.createGain(),
            u = t.createGain(),
            a = t.createScriptProcessor(4096, 2, 2);r.connect(a), a.connect(t.destination), a.connect(u);var c = r;c.name = "Recorder", c._output = u, c.isRecording = !1;var h = function h() {
          if (!n.length) return t.createBuffer(2, 4096, t.sampleRate);var e = t.createBuffer(2, n.length, t.sampleRate);return e.getChannelData(0).set(n), e.getChannelData(1).set(i), e;
        };return c.start = function () {
          n.length = 0, i.length = 0, o = t.currentTime, s = 0, this.isRecording = !0;
        }, c.stop = function () {
          return s = t.currentTime, this.isRecording = !1, h();
        }, c.getDuration = function () {
          return this.isRecording ? t.currentTime - o : s - o;
        }, a.onaudioprocess = function (t) {
          var o = t.inputBuffer.getChannelData(0),
              s = t.inputBuffer.getChannelData(0),
              r = t.outputBuffer.getChannelData(0),
              u = t.outputBuffer.getChannelData(0);if (e && (r.set(o), u.set(s)), c.isRecording) for (var a = 0; a < o.length; a++) {
            n.push(o[a]), i.push(s[a]);
          }
        }, c;
      }e.exports = n;
    }, {}], 13: [function (t, e) {
      "use strict";
      function n(t, e) {
        e = e || {};var n,
            i,
            o = e.time || 1,
            s = e.decay || 5,
            r = !!e.reverse,
            u = t.sampleRate,
            a = t.createGain(),
            c = t.createConvolver(),
            h = t.createGain();a.connect(c), a.connect(h), c.connect(h);var d = a;return d.name = "Reverb", d._output = h, d.update = function (e) {
          void 0 !== e.time && (o = e.time, n = u * o, i = t.createBuffer(2, n, u)), void 0 !== e.decay && (s = e.decay), void 0 !== e.reverse && (r = e.reverse);for (var a, h, d = i.getChannelData(0), l = i.getChannelData(1), f = 0; n > f; f++) {
            a = r ? n - f : f, h = Math.pow(1 - a / n, s), d[f] = (2 * Math.random() - 1) * h, l[f] = (2 * Math.random() - 1) * h;
          }c.buffer = i;
        }, d.update({ time: o, decay: s, reverse: r }), Object.defineProperties(d, { time: { get: function get() {
              return o;
            }, set: function set(t) {
              t !== o && this.update({ time: o });
            } }, decay: { get: function get() {
              return s;
            }, set: function set(t) {
              t !== s && this.update({ decay: s });
            } }, reverse: { get: function get() {
              return r;
            }, set: function set(t) {
              t !== r && this.update({ reverse: !!t });
            } } }), d;
      }e.exports = n;
    }, {}], 14: [function (t, e) {
      "use strict";
      function n(t, e) {
        this._sounds = [], this._context = t, this._effect = new i(this._context), this._gain = this._effect.gain(), this._context && (this._effect.setSource(this._gain), this._effect.setDestination(e || this._context.destination));
      }var i = t("./effect.js");n.prototype.add = function (t) {
        t.gain.disconnect(), t.gain.connect(this._gain), this._sounds.push(t);
      }, n.prototype.remove = function (t) {
        this._sounds.some(function (e, n, i) {
          return e === t || e.id === t ? (i.splice(n, 1), !0) : void 0;
        });
      }, n.prototype.play = function (t, e) {
        this._sounds.forEach(function (n) {
          n.play(t, e);
        });
      }, n.prototype.pause = function () {
        this._sounds.forEach(function (t) {
          t.playing && t.pause();
        });
      }, n.prototype.resume = function () {
        this._sounds.forEach(function (t) {
          t.paused && t.play();
        });
      }, n.prototype.stop = function () {
        this._sounds.forEach(function (t) {
          t.stop();
        });
      }, n.prototype.seek = function (t) {
        this._sounds.forEach(function (e) {
          e.seek(t);
        });
      }, n.prototype.mute = function () {
        this._preMuteVolume = this.volume, this.volume = 0;
      }, n.prototype.unMute = function () {
        this.volume = this._preMuteVolume || 1;
      }, Object.defineProperty(n.prototype, "volume", { get: function get() {
          return this._gain.gain.value;
        }, set: function set(t) {
          isNaN(t) || (this._context ? (this._gain.gain.cancelScheduledValues(this._context.currentTime), this._gain.gain.value = t, this._gain.gain.setValueAtTime(t, this._context.currentTime)) : this._gain.gain.value = t, this._sounds.forEach(function (e) {
            e.context || (e.volume = t);
          }));
        } }), n.prototype.fade = function (t, e) {
        if (this._context) {
          var n = this._gain.gain,
              i = this._context.currentTime;n.cancelScheduledValues(i), n.setValueAtTime(n.value, i), n.linearRampToValueAtTime(t, i + e);
        } else this._sounds.forEach(function (n) {
          n.fade(t, e);
        });return this;
      }, n.prototype.destroy = function () {
        for (; this._sounds.length;) {
          this._sounds.pop().destroy();
        }
      }, Object.defineProperties(n.prototype, { effect: { get: function get() {
            return this._effect;
          } }, gain: { get: function get() {
            return this._gain;
          } }, sounds: { get: function get() {
            return this._sounds;
          } } }), e.exports = n;
    }, { "./effect.js": 3 }], 15: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._context = t, this._data = null, this._endedCallback = null, this._isTouchLocked = !1, this._loop = !1, this._pausedAt = 0, this._playbackRate = 1, this._playWhenReady = null, this._source = null, this._startedAt = 0, this._effect = new o(this._context), this._gain = this._effect.gain(), this._context && (this._effect.setDestination(this._gain), this._gain.connect(e || this._context.destination));
      }var i = t("./source/buffer-source.js"),
          o = t("./effect.js"),
          s = t("./utils/file.js"),
          r = t("./source/media-source.js"),
          u = t("./source/microphone-source.js"),
          a = t("./source/oscillator-source.js"),
          c = t("./source/script-source.js");n.prototype.play = function (t, e) {
        return !this._source || this._isTouchLocked ? (this._playWhenReady = function () {
          this.play(t, e);
        }.bind(this), this) : (this._playWhenReady = null, this._effect.setSource(this._source.sourceNode), this._source.loop = this._loop, this._context || (this.volume = this._gain.gain.value), this._source.play(t, e), this);
      }, n.prototype.pause = function () {
        return this._source ? (this._source.pause(), this) : this;
      }, n.prototype.stop = function () {
        return this._source ? (this._source.stop(), this) : this;
      }, n.prototype.seek = function (t) {
        return this._source ? (this.stop(), this.play(0, this._source.duration * t), this) : this;
      }, n.prototype.fade = function (t, e) {
        if (!this._source) return this;if (this._context) {
          var n = this._gain.gain,
              i = this._context.currentTime;n.cancelScheduledValues(i), n.setValueAtTime(n.value, i), n.linearRampToValueAtTime(t, i + e);
        } else "function" == typeof this._source.fade && this._source.fade(t, e);return this;
      }, n.prototype.onEnded = function (t, e) {
        return this._endedCallback = t ? t.bind(e || this) : null, this;
      }, n.prototype._endedHandler = function () {
        "function" == typeof this._endedCallback && this._endedCallback(this);
      }, n.prototype.destroy = function () {
        this._source && this._source.destroy(), this._effect && this._effect.destroy(), this._gain && this._gain.disconnect(), this._gain = null, this._context = null, this._data = null, this._endedCallback = null, this._playWhenReady = null, this._source = null, this._effect = null;
      }, n.prototype._createSource = function (t) {
        if (s.isAudioBuffer(t)) this._source = new i(t, this._context);else if (s.isMediaElement(t)) this._source = new r(t, this._context);else if (s.isMediaStream(t)) this._source = new u(t, this._context);else if (s.isOscillatorType(t)) this._source = new a(t, this._context);else {
          if (!s.isScriptConfig(t)) throw new Error("Cannot detect data type: " + t);this._source = new c(t, this._context);
        }this._effect.setSource(this._source.sourceNode), "function" == typeof this._source.onEnded && this._source.onEnded(this._endedHandler, this), this._playWhenReady && this._playWhenReady();
      }, Object.defineProperties(n.prototype, { context: { get: function get() {
            return this._context;
          } }, currentTime: { get: function get() {
            return this._source ? this._source.currentTime : 0;
          }, set: function set(t) {
            this.stop(), this.play(0, t);
          } }, data: { get: function get() {
            return this._data;
          }, set: function set(t) {
            t && (this._data = t, this._createSource(this._data));
          } }, duration: { get: function get() {
            return this._source ? this._source.duration : 0;
          } }, effect: { get: function get() {
            return this._effect;
          } }, ended: { get: function get() {
            return this._source ? this._source.ended : !1;
          } }, frequency: { get: function get() {
            return this._source ? this._source.frequency : 0;
          }, set: function set(t) {
            this._source && (this._source.frequency = t);
          } }, gain: { get: function get() {
            return this._gain;
          } }, isTouchLocked: { set: function set(t) {
            this._isTouchLocked = t, !t && this._playWhenReady && this._playWhenReady();
          } }, loop: { get: function get() {
            return this._loop;
          }, set: function set(t) {
            this._loop = !!t, this._source && (this._source.loop = this._loop);
          } }, paused: { get: function get() {
            return this._source ? this._source.paused : !1;
          } }, playing: { get: function get() {
            return this._source ? this._source.playing : !1;
          } }, playbackRate: { get: function get() {
            return this._playbackRate;
          }, set: function set(t) {
            this._playbackRate = t, this._source && (this._source.playbackRate = this._playbackRate);
          } }, progress: { get: function get() {
            return this._source ? this._source.progress : 0;
          } }, volume: { get: function get() {
            return this._context ? this._gain.gain.value : this._data && void 0 !== this._data.volume ? this._data.volume : 1;
          }, set: function set(t) {
            if (!isNaN(t)) {
              var e = this._gain.gain;if (this._context) {
                var n = this._context.currentTime;e.cancelScheduledValues(n), e.value = t, e.setValueAtTime(t, n);
              } else e.value = t, this._source && window.clearTimeout(this._source.fadeTimeout), this._data && void 0 !== this._data.volume && (this._data.volume = t);
            }
          } } }), e.exports = n;
    }, { "./effect.js": 3, "./source/buffer-source.js": 16, "./source/media-source.js": 17, "./source/microphone-source.js": 18, "./source/oscillator-source.js": 19, "./source/script-source.js": 20, "./utils/file.js": 22 }], 16: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._buffer = t, this._context = e, this._ended = !1, this._endedCallback = null, this._loop = !1, this._paused = !1, this._pausedAt = 0, this._playbackRate = 1, this._playing = !1, this._sourceNode = null, this._startedAt = 0;
      }n.prototype.play = function (t, e) {
        if (!this._playing) {
          for (void 0 === t && (t = 0), t > 0 && (t = this._context.currentTime + t), void 0 === e && (e = 0), e > 0 && (this._pausedAt = 0), this._pausedAt > 0 && (e = this._pausedAt); e > this.duration;) {
            e %= this.duration;
          }this.sourceNode.loop = this._loop, this.sourceNode.onended = this._endedHandler.bind(this), this.sourceNode.start(t, e), this.sourceNode.playbackRate.value = this._playbackRate, this._startedAt = this._pausedAt ? this._context.currentTime - this._pausedAt : this._context.currentTime - e, this._ended = !1, this._paused = !1, this._pausedAt = 0, this._playing = !0;
        }
      }, n.prototype.pause = function () {
        var t = this._context.currentTime - this._startedAt;this.stop(), this._pausedAt = t, this._playing = !1, this._paused = !0;
      }, n.prototype.stop = function () {
        if (this._sourceNode) {
          this._sourceNode.onended = null;try {
            this._sourceNode.disconnect(), this._sourceNode.stop(0);
          } catch (t) {}this._sourceNode = null;
        }this._paused = !1, this._pausedAt = 0, this._playing = !1, this._startedAt = 0;
      }, n.prototype.onEnded = function (t, e) {
        this._endedCallback = t ? t.bind(e || this) : null;
      }, n.prototype._endedHandler = function () {
        this.stop(), this._ended = !0, "function" == typeof this._endedCallback && this._endedCallback(this);
      }, n.prototype.destroy = function () {
        this.stop(), this._buffer = null, this._context = null, this._endedCallback = null, this._sourceNode = null;
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            if (this._pausedAt) return this._pausedAt;if (this._startedAt) {
              var t = this._context.currentTime - this._startedAt;return t > this.duration && (t %= this.duration), t;
            }return 0;
          } }, duration: { get: function get() {
            return this._buffer ? this._buffer.duration : 0;
          } }, ended: { get: function get() {
            return this._ended;
          } }, loop: { get: function get() {
            return this._loop;
          }, set: function set(t) {
            this._loop = !!t;
          } }, paused: { get: function get() {
            return this._paused;
          } }, playbackRate: { get: function get() {
            return this._playbackRate;
          }, set: function set(t) {
            this._playbackRate = t, this._sourceNode && (this._sourceNode.playbackRate.value = this._playbackRate);
          } }, playing: { get: function get() {
            return this._playing;
          } }, progress: { get: function get() {
            return this.duration ? this.currentTime / this.duration : 0;
          } }, sourceNode: { get: function get() {
            return this._sourceNode || (this._sourceNode = this._context.createBufferSource(), this._sourceNode.buffer = this._buffer), this._sourceNode;
          } } }), e.exports = n;
    }, {}], 17: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._context = e, this._el = t, this._ended = !1, this._endedCallback = null, this._endedHandlerBound = this._endedHandler.bind(this), this._loop = !1, this._paused = !1, this._playbackRate = 1, this._playing = !1, this._sourceNode = null;
      }n.prototype.play = function (t, e) {
        clearTimeout(this._delayTimeout), this.playbackRate = this._playbackRate, e && (this._el.currentTime = e), t ? this._delayTimeout = setTimeout(this.play.bind(this), t) : this._el.play(), this._ended = !1, this._paused = !1, this._playing = !0, this._el.removeEventListener("ended", this._endedHandlerBound), this._el.addEventListener("ended", this._endedHandlerBound, !1);
      }, n.prototype.pause = function () {
        clearTimeout(this._delayTimeout), this._el && (this._el.pause(), this._playing = !1, this._paused = !0);
      }, n.prototype.stop = function () {
        if (clearTimeout(this._delayTimeout), this._el) {
          this._el.pause();try {
            this._el.currentTime = 0, this._el.currentTime > 0 && this._el.load();
          } catch (t) {}this._playing = !1, this._paused = !1;
        }
      }, n.prototype.fade = function (t, e) {
        if (!this._el) return this;if (this._context) return this;var n = function n(t, e, i) {
          var o = i._el;i.fadeTimeout = setTimeout(function () {
            return o.volume = o.volume + .2 * (t - o.volume), Math.abs(o.volume - t) > .05 ? n(t, e, i) : void (o.volume = t);
          }, 1e3 * e);
        };return window.clearTimeout(this.fadeTimeout), n(t, e / 10, this), this;
      }, n.prototype.onEnded = function (t, e) {
        this._endedCallback = t ? t.bind(e || this) : null;
      }, n.prototype._endedHandler = function () {
        this._ended = !0, this._paused = !1, this._playing = !1, this._loop ? (this._el.currentTime = 0, this._el.currentTime > 0 && this._el.load(), this.play()) : "function" == typeof this._endedCallback && this._endedCallback(this);
      }, n.prototype.destroy = function () {
        this.stop(), this._el = null, this._context = null, this._endedCallback = null, this._endedHandlerBound = null, this._sourceNode = null;
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            return this._el ? this._el.currentTime : 0;
          } }, duration: { get: function get() {
            return this._el ? this._el.duration : 0;
          } }, ended: { get: function get() {
            return this._ended;
          } }, loop: { get: function get() {
            return this._loop;
          }, set: function set(t) {
            this._loop = !!t;
          } }, paused: { get: function get() {
            return this._paused;
          } }, playbackRate: { get: function get() {
            return this._playbackRate;
          }, set: function set(t) {
            this._playbackRate = t, this._el && (this._el.playbackRate = this._playbackRate);
          } }, playing: { get: function get() {
            return this._playing;
          } }, progress: { get: function get() {
            return this.duration ? this.currentTime / this.duration : 0;
          } }, sourceNode: { get: function get() {
            return !this._sourceNode && this._context && (this._sourceNode = this._context.createMediaElementSource(this._el)), this._sourceNode;
          } } }), e.exports = n;
    }, {}], 18: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._context = e, this._ended = !1, this._paused = !1, this._pausedAt = 0, this._playing = !1, this._sourceNode = null, this._startedAt = 0, this._stream = t;
      }n.prototype.play = function (t) {
        void 0 === t && (t = 0), t > 0 && (t = this._context.currentTime + t), this.sourceNode.start(t), this._startedAt = this._pausedAt ? this._context.currentTime - this._pausedAt : this._context.currentTime, this._ended = !1, this._playing = !0, this._paused = !1, this._pausedAt = 0;
      }, n.prototype.pause = function () {
        var t = this._context.currentTime - this._startedAt;this.stop(), this._pausedAt = t, this._playing = !1, this._paused = !0;
      }, n.prototype.stop = function () {
        if (this._sourceNode) {
          try {
            this._sourceNode.stop(0);
          } catch (t) {}this._sourceNode = null;
        }this._ended = !0, this._paused = !1, this._pausedAt = 0, this._playing = !1, this._startedAt = 0;
      }, n.prototype.destroy = function () {
        this.stop(), this._context = null, this._sourceNode = null, this._stream = null, window.mozHack = null;
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            return this._pausedAt ? this._pausedAt : this._startedAt ? this._context.currentTime - this._startedAt : 0;
          } }, duration: { get: function get() {
            return 0;
          } }, ended: { get: function get() {
            return this._ended;
          } }, frequency: { get: function get() {
            return this._frequency;
          }, set: function set(t) {
            this._frequency = t, this._sourceNode && (this._sourceNode.frequency.value = t);
          } }, paused: { get: function get() {
            return this._paused;
          } }, playing: { get: function get() {
            return this._playing;
          } }, progress: { get: function get() {
            return 0;
          } }, sourceNode: { get: function get() {
            return this._sourceNode || (this._sourceNode = this._context.createMediaStreamSource(this._stream), navigator.mozGetUserMedia && (window.mozHack = this._sourceNode)), this._sourceNode;
          } } }), e.exports = n;
    }, {}], 19: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._context = e, this._ended = !1, this._paused = !1, this._pausedAt = 0, this._playing = !1, this._sourceNode = null, this._startedAt = 0, this._type = t, this._frequency = 200;
      }n.prototype.play = function (t) {
        void 0 === t && (t = 0), t > 0 && (t = this._context.currentTime + t), this.sourceNode.start(t), this._startedAt = this._pausedAt ? this._context.currentTime - this._pausedAt : this._context.currentTime, this._ended = !1, this._playing = !0, this._paused = !1, this._pausedAt = 0;
      }, n.prototype.pause = function () {
        var t = this._context.currentTime - this._startedAt;this.stop(), this._pausedAt = t, this._playing = !1, this._paused = !0;
      }, n.prototype.stop = function () {
        if (this._sourceNode) {
          try {
            this._sourceNode.stop(0);
          } catch (t) {}this._sourceNode = null;
        }this._ended = !0, this._paused = !1, this._pausedAt = 0, this._playing = !1, this._startedAt = 0;
      }, n.prototype.destroy = function () {
        this.stop(), this._context = null, this._sourceNode = null;
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            return this._pausedAt ? this._pausedAt : this._startedAt ? this._context.currentTime - this._startedAt : 0;
          } }, duration: { get: function get() {
            return 0;
          } }, ended: { get: function get() {
            return this._ended;
          } }, frequency: { get: function get() {
            return this._frequency;
          }, set: function set(t) {
            this._frequency = t, this._sourceNode && (this._sourceNode.frequency.value = t);
          } }, paused: { get: function get() {
            return this._paused;
          } }, playing: { get: function get() {
            return this._playing;
          } }, progress: { get: function get() {
            return 0;
          } }, sourceNode: { get: function get() {
            return !this._sourceNode && this._context && (this._sourceNode = this._context.createOscillator(), this._sourceNode.type = this._type, this._sourceNode.frequency.value = this._frequency), this._sourceNode;
          } } }), e.exports = n;
    }, {}], 20: [function (t, e) {
      "use strict";
      function n(t, e) {
        this.id = "", this._bufferSize = t.bufferSize || 1024, this._channels = t.channels || 1, this._context = e, this._ended = !1, this._onProcess = t.callback.bind(t.thisArg || this), this._paused = !1, this._pausedAt = 0, this._playing = !1, this._sourceNode = null, this._startedAt = 0;
      }n.prototype.play = function (t) {
        void 0 === t && (t = 0), t > 0 && (t = this._context.currentTime + t), this.sourceNode.onaudioprocess = this._onProcess, this._startedAt = this._pausedAt ? this._context.currentTime - this._pausedAt : this._context.currentTime, this._ended = !1, this._paused = !1, this._pausedAt = 0, this._playing = !0;
      }, n.prototype.pause = function () {
        var t = this._context.currentTime - this._startedAt;this.stop(), this._pausedAt = t, this._playing = !1, this._paused = !0;
      }, n.prototype.stop = function () {
        this._sourceNode && (this._sourceNode.onaudioprocess = this._onPaused), this._ended = !0, this._paused = !1, this._pausedAt = 0, this._playing = !1, this._startedAt = 0;
      }, n.prototype._onPaused = function (t) {
        for (var e = t.outputBuffer, n = 0, i = e.numberOfChannels; i > n; n++) {
          for (var o = e.getChannelData(n), s = 0, r = o.length; r > s; s++) {
            o[s] = 0;
          }
        }
      }, n.prototype.destroy = function () {
        this.stop(), this._context = null, this._onProcess = null, this._sourceNode = null;
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            return this._pausedAt ? this._pausedAt : this._startedAt ? this._context.currentTime - this._startedAt : 0;
          } }, duration: { get: function get() {
            return 0;
          } }, ended: { get: function get() {
            return this._ended;
          } }, paused: { get: function get() {
            return this._paused;
          } }, playing: { get: function get() {
            return this._playing;
          } }, progress: { get: function get() {
            return 0;
          } }, sourceNode: { get: function get() {
            return !this._sourceNode && this._context && (this._sourceNode = this._context.createScriptProcessor(this._bufferSize, 0, this._channels)), this._sourceNode;
          } } }), e.exports = n;
    }, {}], 21: [function (t, e) {
      "use strict";
      var n = {};n.handlePageVisibility = function (t, e, n) {
        function i() {
          document[o] ? t.call(n) : e.call(n);
        }var o, s;"undefined" != typeof document.hidden ? (o = "hidden", s = "visibilitychange") : "undefined" != typeof document.mozHidden ? (o = "mozHidden", s = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (o = "msHidden", s = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (o = "webkitHidden", s = "webkitvisibilitychange"), void 0 !== s && document.addEventListener(s, i, !1);
      }, n.handleTouchLock = function (t, e) {
        var n = navigator.userAgent,
            i = !!n.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i),
            o = function () {
          if (document.body.removeEventListener("touchstart", o), this._context) {
            var n = this._context.createBuffer(1, 1, 22050),
                i = this._context.createBufferSource();i.buffer = n, i.connect(this._context.destination), i.start(0);
          }t.call(e);
        }.bind(this);return i && document.body.addEventListener("touchstart", o, !1), i;
      }, e.exports = n;
    }, {}], 22: [function (t, e) {
      "use strict";
      var n = { extensions: [], canPlay: {} },
          i = [{ ext: "ogg", type: 'audio/ogg; codecs="vorbis"' }, { ext: "mp3", type: "audio/mpeg;" }, { ext: "opus", type: 'audio/ogg; codecs="opus"' }, { ext: "wav", type: 'audio/wav; codecs="1"' }, { ext: "m4a", type: "audio/x-m4a;" }, { ext: "m4a", type: "audio/aac;" }],
          o = document.createElement("audio");o && i.forEach(function (t) {
        var e = !!o.canPlayType(t.type);e && n.extensions.push(t.ext), n.canPlay[t.ext] = e;
      }), n.getFileExtension = function (t) {
        t = t.split("?")[0], t = t.substr(t.lastIndexOf("/") + 1);var e = t.split(".");return 1 === e.length || "" === e[0] && 2 === e.length ? "" : e.pop().toLowerCase();
      }, n.getSupportedFile = function (t) {
        var e;return Array.isArray(t) ? t.some(function (t) {
          e = t;var n = this.getFileExtension(t);return this.extensions.indexOf(n) > -1;
        }, this) : "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && Object.keys(t).some(function (n) {
          e = t[n];var i = this.getFileExtension(e);return this.extensions.indexOf(i) > -1;
        }, this), e || t;
      }, n.isAudioBuffer = function (t) {
        return !!(t && window.AudioBuffer && t instanceof window.AudioBuffer);
      }, n.isMediaElement = function (t) {
        return !!(t && window.HTMLMediaElement && t instanceof window.HTMLMediaElement);
      }, n.isMediaStream = function (t) {
        return !!(t && "function" == typeof t.getAudioTracks && t.getAudioTracks().length && window.MediaStreamTrack && t.getAudioTracks()[0] instanceof window.MediaStreamTrack);
      }, n.isOscillatorType = function (t) {
        return !(!t || "string" != typeof t || "sine" !== t && "square" !== t && "sawtooth" !== t && "triangle" !== t);
      }, n.isScriptConfig = function (t) {
        return !!(t && "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && t.bufferSize && t.channels && t.callback);
      }, n.isURL = function (t) {
        return !!(t && "string" == typeof t && t.indexOf(".") > -1);
      }, n.containsURL = function (t) {
        if (!t) return !1;var e = t.url || t;return this.isURL(e) || Array.isArray(e) && this.isURL(e[0]);
      }, e.exports = n;
    }, {}], 23: [function (t, e) {
      "use strict";
      function n(t) {
        var e,
            n,
            o,
            s,
            r,
            u = new i.Signal(),
            a = new i.Signal(),
            c = new i.Signal(),
            h = new i.Signal(),
            d = 0,
            l = function l() {
          e ? f() : p();
        },
            f = function f() {
          o = new XMLHttpRequest(), o.open("GET", t, !0), o.responseType = "arraybuffer", o.onprogress = function (t) {
            t.lengthComputable && (d = t.loaded / t.total, u.dispatch(d));
          }, o.onload = function () {
            e.decodeAudioData(o.response, function (t) {
              r = t, o = null, d = 1, u.dispatch(1), a.dispatch(t), c.dispatch(t);
            }, function (t) {
              h.dispatch(t);
            });
          }, o.onerror = function (t) {
            h.dispatch(t);
          }, o.send();
        },
            p = function p() {
          r = new Audio(), r.preload = "auto", r.src = t, n ? (u.dispatch(1), a.dispatch(r), c.dispatch(r)) : (window.clearTimeout(s), s = window.setTimeout(_, 4e3), r.addEventListener("canplaythrough", _, !1), r.onerror = function (t) {
            window.clearTimeout(s), h.dispatch(t);
          }, r.load());
        },
            _ = function _() {
          window.clearTimeout(s), r && (r.removeEventListener("canplaythrough", _), d = 1, u.dispatch(1), a.dispatch(r), c.dispatch(r));
        },
            g = function g() {
          o && 4 !== o.readyState && o.abort(), r && "function" == typeof r.removeEventListener && r.removeEventListener("canplaythrough", _), window.clearTimeout(s);
        },
            y = function y() {
          g(), u.removeAll(), c.removeAll(), a.removeAll(), h.removeAll(), o = null, r = null, e = null;
        },
            v = { start: l, cancel: g, destroy: y, onProgress: u, onComplete: c, onBeforeComplete: a, onError: h };return Object.defineProperties(v, { data: { get: function get() {
              return r;
            } }, progress: { get: function get() {
              return d;
            } }, audioContext: { set: function set(t) {
              e = t;
            } }, isTouchLocked: { set: function set(t) {
              n = t;
            } } }), Object.freeze(v);
      }var i = t("signals");n.Group = function () {
        var t = [],
            e = 0,
            n = 0,
            o = new i.Signal(),
            s = new i.Signal(),
            r = new i.Signal(),
            u = function u(e) {
          return t.push(e), n++, e;
        },
            a = function a() {
          n = t.length, c();
        },
            c = function c() {
          if (0 === t.length) return void o.dispatch();var e = t.pop();e.onProgress.add(h), e.onBeforeComplete.addOnce(d), e.onError.addOnce(l), e.start();
        },
            h = function h(t) {
          var i = e + t;s.dispatch(i / n);
        },
            d = function d() {
          e++, s.dispatch(e / n), c();
        },
            l = function l(t) {
          r.dispatch(t), c();
        };return Object.freeze({ add: u, start: a, onProgress: s, onComplete: o, onError: r });
      }, e.exports = n;
    }, { signals: 2 }], 24: [function (t, e) {
      "use strict";
      function n(t, e, n, i) {
        navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia, this._isSupported = !!navigator.getUserMedia_, this._stream = null, this._onConnected = t.bind(i || this), this._onDenied = e ? e.bind(i || this) : function () {}, this._onError = n ? n.bind(i || this) : function () {};
      }n.prototype.connect = function () {
        if (this._isSupported) {
          var t = this;return navigator.getUserMedia_({ audio: !0 }, function (e) {
            t._stream = e, t._onConnected(e);
          }, function (e) {
            "PermissionDeniedError" === e.name || "PERMISSION_DENIED" === e ? t._onDenied() : t._onError(e.message || e);
          }), this;
        }
      }, n.prototype.disconnect = function () {
        return this._stream && (this._stream.stop(), this._stream = null), this;
      }, Object.defineProperties(n.prototype, { stream: { get: function get() {
            return this._stream;
          } }, isSupported: { get: function get() {
            return this._isSupported;
          } } }), e.exports = n;
    }, {}], 25: [function (t, e) {
      "use strict";
      function n(t, e) {
        i.call(this, t, e), this._src = null;
      }var i = t("../group.js");n.prototype = Object.create(i.prototype), n.prototype.constructor = n, n.prototype.add = function (t) {
        i.prototype.add.call(this, t), this._getSource();
      }, n.prototype.remove = function (t) {
        i.prototype.remove.call(this, t), this._getSource();
      }, n.prototype._getSource = function () {
        this._sounds.length && (this._sounds.sort(function (t, e) {
          return e.duration - t.duration;
        }), this._src = this._sounds[0]);
      }, Object.defineProperties(n.prototype, { currentTime: { get: function get() {
            return this._src ? this._src.currentTime : 0;
          }, set: function set(t) {
            this.stop(), this.play(0, t);
          } }, duration: { get: function get() {
            return this._src ? this._src.duration : 0;
          } }, loop: { get: function get() {
            return this._loop;
          }, set: function set(t) {
            this._loop = !!t, this._sounds.forEach(function (t) {
              t.loop = this._loop;
            });
          } }, paused: { get: function get() {
            return this._src ? this._src.paused : !1;
          } }, progress: { get: function get() {
            return this._src ? this._src.progress : 0;
          } }, playbackRate: { get: function get() {
            return this._playbackRate;
          }, set: function set(t) {
            this._playbackRate = t, this._sounds.forEach(function (t) {
              t.playbackRate = this._playbackRate;
            });
          } }, playing: { get: function get() {
            return this._src ? this._src.playing : !1;
          } } }), e.exports = n;
    }, { "../group.js": 14 }], 26: [function (t, e) {
      "use strict";
      var n = t("./microphone.js"),
          i = t("./waveform.js"),
          o = {};o.setContext = function (t) {
        this._context = t;
      }, o.cloneBuffer = function (t) {
        if (!this._context) return t;for (var e = t.numberOfChannels, n = this._context.createBuffer(e, t.length, t.sampleRate), i = 0; e > i; i++) {
          n.getChannelData(i).set(t.getChannelData(i));
        }return n;
      }, o.reverseBuffer = function (t) {
        for (var e = t.numberOfChannels, n = 0; e > n; n++) {
          Array.prototype.reverse.call(t.getChannelData(n));
        }return t;
      }, o.ramp = function (t, e, n, i) {
        this._context && (t.setValueAtTime(e, this._context.currentTime), t.linearRampToValueAtTime(n, this._context.currentTime + i));
      }, o.getFrequency = function (t) {
        if (!this._context) return 0;var e = 40,
            n = this._context.sampleRate / 2,
            i = Math.log(n / e) / Math.LN2,
            o = Math.pow(2, i * (t - 1));return n * o;
      }, o.microphone = function (t, e, i, o) {
        return new n(t, e, i, o);
      }, o.timeCode = function (t, e) {
        void 0 === e && (e = ":");var n = Math.floor(t / 3600),
            i = Math.floor(t % 3600 / 60),
            o = Math.floor(t % 3600 % 60),
            s = 0 === n ? "" : 10 > n ? "0" + n + e : n + e,
            r = (10 > i ? "0" + i : i) + e,
            u = 10 > o ? "0" + o : o;return s + r + u;
      }, o.waveform = function (t, e) {
        return new i(t, e);
      }, e.exports = o;
    }, { "./microphone.js": 24, "./waveform.js": 27 }], 27: [function (t, e) {
      "use strict";
      function n() {
        var t,
            e,
            n = function n(_n, i) {
          if (!window.Float32Array || !window.AudioBuffer) return [];var o = _n === t,
              s = e && e.length === i;if (o && s) return e;var r = new Float32Array(i),
              u = Math.floor(_n.length / i),
              a = 5,
              c = Math.floor(u / a),
              h = 0;1 > c && (c = 1);for (var d = 0, l = _n.numberOfChannels; l > d; d++) {
            for (var f = _n.getChannelData(d), p = 0; i > p; p++) {
              for (var _ = p * u, g = _ + u; g > _; _ += c) {
                var y = f[_];0 > y && (y = -y), y > r[p] && (r[p] = y), y > h && (h = y);
              }
            }
          }var v = 1 / h,
              m = r.length;for (d = 0; m > d; d++) {
            r[d] *= v;
          }return t = _n, e = r, r;
        },
            i = function i(e) {
          var n,
              i,
              o = e.canvas || document.createElement("canvas"),
              s = e.width || o.width,
              r = e.height || o.height,
              u = e.color || "#333333",
              a = e.bgColor || "#dddddd",
              c = e.sound ? e.sound.data : e.buffer || t,
              h = this.compute(c, s),
              d = o.getContext("2d");d.strokeStyle = u, d.fillStyle = a, d.fillRect(0, 0, s, r), d.beginPath();for (var l = 0; l < h.length; l++) {
            n = l + .5, i = r - Math.round(r * h[l]), d.moveTo(n, i), d.lineTo(n, r);
          }return d.stroke(), o;
        };return Object.freeze({ compute: n, draw: i });
      }e.exports = n;
    }, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[10]);

//# sourceMappingURL=bundle.js.map
