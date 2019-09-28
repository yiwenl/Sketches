/*
BitmapData for EaselJS
Version: 1.11
Author: kudox
http://kudox.jp/
http://twitter.com/u_kudox
Licensed under the MIT License
Copyright (c) 2013 kudox.jp
*/

/**
* @namespace createjs
**/
this.createjs = this.createjs || {};

(function(window) {
	"use strict";

	/**
	* The BitmapData for EaselJS provides the BitmapData class like ActionScript3.0 to the EaselJS. The BitmapData class does not inherit the DisplayObject class of the EaselJS, so that use the Bitmap class to display it on the Stage. This flow is similar to Flash. But please pass the canvas property of the BitmapData instance (instead of BitmapData instance) to the constructor of the Bitmap class.<br><br>
	* BitmapData for EaselJSは、EaselJSにActionScript3.0と同様のBitmapDataクラスを提供します。BitmapDataクラスはDisplayObjectを継承していないため、実際にStage上に表示するにはBitmapクラスを使います。この流れはFlashと同様ですが、BitmapクラスのコンストラクタにはBitmapDataインスタンスではなく、BitmapDataインスタンスのcanvasプロパティを渡して下さい。
	* @class BitmapData
	* @constructor
	* @param [image=null] {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} If you specify an object to this parameter, the object will be drawn to the bitmapdata which is created. The specified object must be finished its loading. If you want to create a bitmapdata by fill, please specify the null.<br>
	* この引数を指定すると指定したオブジェクトが描画されたBitmapDataが作成されます。指定するオブジェクトは、読み込みが終わっている必要があります。塗りのBitmapDataを作成したい場合は、nullを指定して下さい。
	* @param [width=image.width] {uint} The width of the image in pixels. If the image is null, the default value is 300.<br>
	* BitmapDataの幅です。imageがnullの場合のdefault値は300です。
	* @param [height=image.height] {uint} THe height of the image in pixels. If the image is null, the default value is 150.<br>
	* BitmapDataの高さです。imageがnullの場合のdefault値は150です。
	* @param [fillColor=undefined] {String | uint} If you want to create a bitmapdata by fill, please specify this parameter. You can use a CSS compatible color value (ex. "#FF0000", "rgba(255,0,0,0.5)") or a 32-bit ARGB color value(ex. 0x80FF0000). If you want to create a transparent bitmapdata, please omit this parameter.<br>
	* 塗りのBitmapDataを作成する場合に指定します。CSS文字列と0xAARRGGBB形式の16進数値が使えます。透明なBitmapDataを作成したい場合は、この引数を省略して下さい。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(HTMLImageElement);
_bitmap01 = new createjs.Bitmap(_bmd01.canvas);
_stage.addChild(_bitmap01);
var width = 200;
var height = 200;
var fillColor = 0x80FF0000;
_bmd02 = new createjs.BitmapData(null, width, height, fillColor);
_bitmap02 = new createjs.Bitmap(_bmd02.canvas);
_stage.addChild(_bitmap02);</code></pre>
	**/
	function BitmapData(image, width, height, fillColor) {
		width = width >> 0 || image.width || 300;
		height = height >> 0 || image.height || 150;

		/**
		* A HTMLCanvasElement that bitmapdata is drawn.<br>
		* BitmapDataが描画されるHTMLCanvasElementです。
		* @property canvas
		* @type HTMLCanvasElement
		**/
		var cvs = this.canvas = createCanvas(width, height);

		/**
		* A CanvasRenderingContext2D of the canvas.<br>
		* canvasのCanvasRenderingContext2Dです。
		* @property context
		* @type CanvasRenderingContext2D
		**/
		var ctx = this.context = cvs.getContext("2d");

		/**
		* A name of the bitmapdata. It's used in toString().<br>
		* BitmapDataの名前です。toString()で使用されます。
		* @property name
		* @type String
		* @default null
		**/
		this.name = null;

		if (!!image) ctx.drawImage(image, 0, 0);
		if (fillColor !== undefined) this.fillRect(new createjs.Rectangle(0, 0, width, height), fillColor);

		/**
		* private properties
		**/
		this._imageData = ctx.getImageData(0, 0, width, height);
		this._contextChanged = false;
	}

	var s = BitmapData;

	s.VERSION = "1.1.1";

	/**
	* This method gets as a bitmapdata from cache of the DisplayObject. A bitmapData provided by this method is the reference of the DisplayObject's cache. If you called updateCache() at the DisplayObject, you must call updateImageData() at the Bitmapdata.<br>
	* cache()されたDisplayObjectのサブクラスをBitmapDataとして取得します。このメソッドで得られるBitmapDataは、DisplayObjectのcacheの参照です。updateCache()を実行した場合は、取得したBitmapDataも更新されるため、updateImageData()を実行して下さい。
	* @static
	* @method getBitmapData
	* @param object {DisplayObject} The DisplayObject to get as a bitmapdata. The DisplayObject must be called cache().<br>
	* BitmapDataとして取得したいDisplayObjectのサブクラスを指定します。DisplayObjectはcache()されている必要があります。
	* @return {BitmapData} A bitmapdata got from the DisplayObject's cache.<br>
	* DisplayObjectのcacheをBitmapDataとして返します。
	* @example
	* <pre><code>_shape = new createjs.Shape();
var g = _shape.graphics;
g.f(&quot;rgba(0, 0, 255, 1)&quot;).dp(0, 0, 100, 5, 0.6, -90).ef();
_shape.cache(-100, -100, 200, 200);
_bmd01 = createjs.BitmapData.getBitmapData(_shape);
var colorTransform = new createjs.ColorTransform(1, 1, 0, 1, 255);
var rect = new createjs.Rectangle(0, 0, _bmd01.width &gt;&gt; 1, _bmd01.height);
_bmd01.colorTransform(rect, colorTransform);
_stage.addChild(_shape);</code></pre>
	**/
	s.getBitmapData = function(object) {
		var bmd, cvs, ctx;
		if (object instanceof createjs.DisplayObject) {
			if (!!object.cacheCanvas) {
				bmd = Object.create(BitmapData.prototype);
				cvs = bmd.canvas = object.cacheCanvas;
			} else {
				throw new Error("The object must be called DisplayObject.cache().");
			}
		} else {
			return;
		}
		ctx = bmd.context = cvs.getContext("2d");
		bmd._imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
		bmd.name = null;
		bmd._contextChanged = false;
		return bmd;
	};

	var p = BitmapData.prototype = {
		/**
		* [read only] The width of the bitmapdata in pixels.<br>
		* BitmapDataの幅です。
		* @property width
		* @type uint
		* @readOnly
		**/
		get width() {
			return this.canvas.width;
		},

		/**
		* [read only] The height of the bitmapdata in pixels.<br>
		* BitmapDataの高さです。
		* @property height
		* @type uint
		* @readOnly
		**/
		get height() {
			return this.canvas.height;
		},

		/**
		* [read only] A rectangle object that defines the size and location of the bitmapdata.<br>
		* BitmapDataの位置とサイズを示すRectangleです。
		* @property rect
		* @type Rectangle
		* @readOnly
		**/
		get rect() {
			return new createjs.Rectangle(0, 0, this.canvas.width, this.canvas.height);
		}
	};

	p.constructor = BitmapData;

	/**
	* Apply the filter to the source object and generates the filtered image. You can also specify the current bitmapdata as a source.<br>
	* ソースオブジェクトにFilterを適用し、現在のBitmapDataに貼付けます。sourceには、現在のBitmapDataを指定することもできます。
	* @method applyFilter
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to be used as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The point within the destination image that corresponds to the upper-left corner of the source rectangle.<br>
	* Filterを適用したイメージが配置される左上の座標を示すPointです。
	* @param filter {Filter} The filter object that you want to use.<br>
	* 適用するFilterを指定します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var source = _bmd01;
var sourceRect = new createjs.Rectangle(90, 20, 200, 200);
var destPoint = new createjs.Point(90, 20);
var filter = new createjs.BlurFilter(8, 8, 1);
_bmd01.applyFilter(source, sourceRect, destPoint, filter);</code></pre>
	**/
	p.applyFilter = function(source, sourceRect, destPoint, filter) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		if (source instanceof BitmapData || source instanceof createjs.Stage) {
			source = source.canvas;
		} else if (source instanceof createjs.DisplayObject) {
			if (!!source.cacheCanvas) {
				source = source.cacheCanvas;
			} else {
				throw new Error("The source of BitmapData.applyFilter(), must be called DisplayObject.cache().");
			}
		}
		var cvs = createCanvas(sw, sh);
		var ctx = cvs.getContext("2d");
		ctx.drawImage(source, -sx, -sy);
		filter.applyFilter(ctx, 0, 0, sw, sh);
		this.context.drawImage(cvs, dx, dy);
		this._contextChanged = true;
	};

	/**
	* Clears the pixels in the specified area. The color of pixels will be transparent black.<br>
	* 指定された領域のピクセルを透明な黒にして消去します。
	* @method clearRect
	* @param x {Number} The x coordinate of the upper-left corner in the area to be cleared.<br>
	* 消去する領域の左上x座標です。
	* @param y {Number} The y coordinate of the upper-left corner in the area to be cleared.<br>
	* 消去する領域の左上y座標です。
	* @param width {Number} The width of the area to be cleared.<br>
	* 消去する領域の幅です。
	* @param height {Number} The height of the area to be cleared.<br>
	* 消去する領域の高さです。
	* @example
	* <pre><code>var x = 50;
var y = 50;
var width = 100;
var height = 100;
_bmd01.clearRect(x, y, width, height);</code></pre>
	**/
	p.clearRect = function(x, y, width, height) {
		this.context.clearRect(x, y, width, height);
		this._contextChanged = true;
	};

	/**
	* Creates a clone of the current bitmapdata.<br>
	* 現在のBitmapDataのクローンを作成します。
	* @method clone
	* @return {BitmapData} A clone of the current bitmapdata.<br>
	* 現在のBitmapDataのクローンです。
	**/
	p.clone = function() {
		var bmd = Object.create(BitmapData.prototype);
		var w = this.canvas.width;
		var h = this.canvas.height;
		var cvs = bmd.canvas = createCanvas(w, h);
		var ctx = bmd.context = cvs.getContext("2d");
		if (this._contextChanged) this.updateImageData();
		ctx.putImageData(this._imageData, 0, 0);
		bmd._imageData = ctx.getImageData(0, 0, w, h);
		bmd.name = this.name;
		bmd._contextChanged = false;
		return bmd;
	};

	/**
	* Adjusts the color value in a specified area of the bitmapdata by using a ColorTransform object.<br>
	* ColorTransformオブジェクトを使用して、BitmapDataの特定領域のカラー値を調整します。
	* @method colorTransform
	* @param rect {Rectangle} A Rectangle object that defines the area of the bitmapdata in which the ColorTransform is applied.<br>
	* ColorTransformを適用する領域を示すRectangleです。
	* @param colorTransform {ColorTransform} A ColorTransform object to apply.<br>
	* 適用するColorTransformオブジェクトです。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var halfW = _image01.width &gt;&gt; 1;
var rect = new createjs.Rectangle(halfW, 0, halfW, _image01.height);
var colorTransform = new createjs.ColorTransform(0.5, 1.5, 1.5);
_bmd01.colorTransform(rect, colorTransform);</code></pre>
	**/
	p.colorTransform = function(rect, colorTransform) {
		var x = rect.x >> 0;
		var y = rect.y >> 0;
		var w = rect.width >> 0;
		var h = rect.height >> 0;
		var ctx = this.context;
		var imgData = ctx.getImageData(x, y, w, h);
		var data = imgData.data;
		for (var i = 0, l = data.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			data[r] = data[r] * colorTransform.redMultiplier + colorTransform.redOffset;
			data[g] = data[g] * colorTransform.greenMultiplier + colorTransform.greenOffset;
			data[b] = data[b] * colorTransform.blueMultiplier + colorTransform.blueOffset;
			data[a] = data[a] * colorTransform.alphaMultiplier + colorTransform.alphaOffset;
		}
		ctx.putImageData(imgData, x, y);
		this._contextChanged = true;
	};

	/**
	* Compares the current bitmapdata with the object of the 1st parameter, and then returns a new bitmapdata that has the difference between the pixels in the two source objects.<br>
	* 現在のBitmapDataと引数のオブジェクトのピクセルを比較し、その差分ピクセルを持つ新しいBitmapDataを返します。
	* @method compare
	* @param otherSource {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to compare.<br>
	* 比較に使用するオブジェクトです。
	* @return {BitmapData | int} If the two objects have the same dimensions (width and height), the method returns a new bitmapdata that has the difference between the pixels in the two objects.<br>
	If the two objects have the same dimensions and same pixels, the method returns the number 0.<br>
	If the width of the two objects are not equal, the method returns the number -3. Else if the height of the two objects are not equal, the method returns the number -4.<br>
	* 2つのオブジェクトの幅と高さが等しければ、2つのオブジェクトの差分ピクセルを持つ新しいBitmapDataを返します。<br>幅と高さ、及びすべてのピクセルが等しい場合、数値 0 を返します。<br>幅が等しくない場合、数値 -3 を返します。<br>幅が等しく、高さが等しくない場合、数値 -4 を返します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
_bmd03 = new createjs.BitmapData(_image02);
var otherSource = _bmd03;
_bmd02 = _bmd01.compare(otherSource);
_bitmap01 = new createjs.Bitmap(_bmd01.canvas);
_bitmap02 = new createjs.Bitmap(_bmd02.canvas);
_bitmap03 = new createjs.Bitmap(_bmd03.canvas);
_bitmap01.x = 10;
_bitmap02.x = 220;
_bitmap03.x = 430;
_bitmap01.y = _bitmap02.y = _bitmap03.y = 80;</code></pre>
	**/
	p.compare = function(otherSource) {
		var w = otherSource.width;
		var h = otherSource.height;
		if (this.canvas.width !== w) {
			return -3;
		} else if (this.canvas.height !== h) {
			return -4;
		}
		var oContext = getSourceContext(otherSource, w, h);
		var oImgData = oContext.getImageData(0, 0, w, h);
		var oData = oImgData.data;
		if (this._contextChanged) this.updateImageData();
		var cImgData = this._imageData;
		var cData = cImgData.data;
		if (Array.prototype.slice.call(cData).toString() === Array.prototype.slice.call(oData).toString()) {
			return 0;
		}
		var dBmd = Object.create(BitmapData.prototype);
		var dCanvas = dBmd.canvas = createCanvas(w, h);
		var dContext = dBmd.context = dCanvas.getContext("2d");
		var dImgData = dBmd._imageData = dContext.createImageData(w, h);
		var dData = dImgData.data;
		for (var i = 0, l = cData.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			var colorCompare = (cData[r] === oData[r]) && (cData[g] === oData[g]) && (cData[b] === oData[b]);
			var alphaCompare = cData[a] === oData[a];
			if (!colorCompare) {
				dData[r] = (cData[r] - oData[r]) & 0xFF;
				dData[g] = (cData[g] - oData[g]) & 0xFF;
				dData[b] = (cData[b] - oData[b]) & 0xFF;
				dData[a] = 255;
			} else if (!alphaCompare) {
				dData[r] = dData[g] = dData[b] = 255;
				dData[a] = cData[a] - oData[a];
			}
		}
		dContext.putImageData(dImgData, 0, 0);
		return dBmd;
	};

	/**
	* Transfers one of channel in the source object to the current bitmapdata's channel.<br>
	* ソースオブジェクトの1つのチャンネルを現在のBitmapDataのチャンネルに転送します。
	* @method copyChannel
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination bitmapdata.<br>
	* データが配置される左上の座標を示すPointです。
	* @param sourceChannel {uint} A channel of the source object. You can use the constant of the BitmapDataChannel class.<br>
	* ソースオブジェクトのチャンネルを指定します。BitmapDataChannelクラスの定数が使用できます。
	* @param destChannel {uint} A channel of the destination bitmapdata. You can use the constant of the BitmapDataChannel class.<br>
	* 転送先のチャンネルを指定します。BitmapDataChannelクラスの定数が使用できます。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var source = _image02;
var sourceRect = new createjs.Rectangle(0, 0, _image02.width, _image02.height);
var destPoint = new createjs.Point();
var channel = Object.create(createjs.BitmapDataChannel);
var sourceChannel = channel.ALPHA;
var destChannel = channel.BLUE;
_bmd01.copyChannel(source, sourceRect, destPoint, sourceChannel, destChannel);</code></pre>
	**/
	p.copyChannel = function(source, sourceRect, destPoint, sourceChannel, destChannel) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		var sData = sImgData.data;
		var sChannel = BitmapDataChannel.getChannelIndex(sourceChannel);
		var dContext = this.context;
		var dImgData = dContext.getImageData(dx, dy, sw, sh);
		var dData = dImgData.data;
		var dChannel = BitmapDataChannel.getChannelIndex(destChannel);
		for (var i = 0, l = dData.length; i < l; i += 4) {
			dData[i + dChannel] = sData[i + sChannel];
		}
		dContext.putImageData(dImgData, dx, dy);
		this._contextChanged = true;
	};

	/**
	* Copies the pixels from the source object to the current bitmapdata.<br>
	* ソースオブジェクトを現在のBitmapDataに貼り付けます。
	* @method copyPixels
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination bitmapdata.<br>
	* 貼り付け先の左上座標を示すPointです。
	* @param [alphaSource=null] {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source of the alpha channel.<br>
	* アルファチャンネルのソースとなるオブジェクトを指定します。
	* @param [alphaPoint=null] {Point} The point that represents the upper-left corner of the alphaSource.<br>
	* alphaSourceの左上座標を示すPointです。
	* @param [mergeAlpha=false] {Boolean} If you want to use the alpha channel, set the value to true.<br>
	* 貼り付け時にアルファチャンネルを使用するにはtrueを指定します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(null, 640, 360, 0xCCCCCC);
var source = _image01;
var sourceRect = new createjs.Rectangle(0, 0, _image01.width, _image01.height);
var destPoint;
var alphaSource = _maskImage;
var alphaPoint = new createjs.Point();
var mergeAlpha = true;
destPoint = new createjs.Point(10, 80);
_bmd01.copyPixels(source, sourceRect, destPoint);
destPoint = new createjs.Point(220, 80);
_bmd01.copyPixels(source, sourceRect, destPoint, alphaSource);
destPoint = new createjs.Point(430, 80);
_bmd01.copyPixels(source, sourceRect, destPoint, alphaSource, alphaPoint, mergeAlpha);</code></pre>
	**/
	p.copyPixels = function(source, sourceRect, destPoint, alphaSource, alphaPoint, mergeAlpha) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		if (!!alphaSource) {
			var ax, ay;
			if (alphaPoint) {
				ax = alphaPoint.x >> 0;
				ay = alphaPoint.y >> 0;
			} else {
				ax = 0;
				ay = 0;
			}
			var aContext = getSourceContext(alphaSource, ax + sw, ay + sh);
			var aImgData = aContext.getImageData(ax, ay, sw, sh);
			var sData = sImgData.data;
			var aData = aImgData.data;
			for (var i = 3, l = sData.length; i < l; i += 4) {
				sData[i] = aData[i];
			}
			if (mergeAlpha) {
				sContext.putImageData(sImgData, sx, sy);
				this.context.drawImage(sContext.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
			} else {
				this.context.putImageData(sImgData, dx, dy);
			}
		} else {
			this.context.putImageData(sImgData, dx, dy);
		}
		this._contextChanged = true;
	};

	/**
	* Frees the memory that is used to store the bitmapdata.<br>
	* BitmapDataオブジェクトの格納に使用されるメモリを解放します。
	* @method dispose
	**/
	p.dispose = function() {
		delete this._imageData;
		delete this.context;
		delete this.canvas;
	};

	/**
	* Draws the source object to the current bitmapdata.<br>
	* ソースオブジェクトを現在のBitmapDataに描画します。
	* @method draw
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param [matrix=null] {Matrix2D} A Matrix2D object to be applied to the source object. If you don't want to apply the transformation matrix, set the value to null.<br>
	* ソースオブジェクトに適用する変換行列を指定します。変換行列を指定したくない場合はnullを指定して下さい。
	* @param [colorTransform=null] {ColorTransform} A ColorTransform object to be applied to the source object. If you don't want to apply the color transformation, set the value to null.<br>
	* ソースオブジェクトに適用するColorTransformオブジェクトを指定します。ColorTransformを適用したくない場合はnullを指定して下さい。
	* @param [compositeOperation=null] {String} A string value that represents the globalCompositeOperation value of the CanvasRenderingContext2D when drawn.<br>
	* 描画時のcanvasのglobalCompositeOperationの値です。
	* @param [clipRect=null] {Rectangle} A rectangle object that defines the clipping area of the source object.<br>
	* 描画時のクリッピング領域を示すRectangleです。
	* @param [smoothing=false] {Boolean} A Boolean value that determines whether or not to use the smoothing option when drawn.<br>
	* 描画時にスムージングを適用するかをBool値で指定します。
	* @example
	* <pre><code>var matrix = new createjs.Matrix2D(1, 0, 0, 1, -_sourceRect.width &gt;&gt; 1, -_sourceRect.height &gt;&gt; 1);
var rotation = Math.random() * 360 &gt;&gt; 0;
matrix.rotate(rotation * createjs.Matrix2D.DEG_TO_RAD);
var scale = Math.random() * 0.5 + 0.5;
matrix.scale(scale, scale);
var tx = Math.random() * _bmd01.width &gt;&gt; 0;
var ty = Math.random() * _bmd01.height &gt;&gt; 0;
matrix.translate(tx, ty);
var red = (Math.random() * 224 &gt;&gt; 0) + 32;
var green = (Math.random() * 224 &gt;&gt; 0) + 32;
var blue = (Math.random() * 224 &gt;&gt; 0) + 32;
var colorTransform = new createjs.ColorTransform(0, 0, 0, 1, red, green, blue);
var compositeOperation = &quot;lighter&quot;;
var clipRect = null;
var smoothing = true;
_bmd01.draw(_source, matrix, colorTransform, compositeOperation, clipRect, smoothing);</code></pre>
	**/
	p.draw = function(source, matrix, colorTransform, compositeOperation, clipRect, smoothing) {
		if (source instanceof BitmapData || source instanceof createjs.Stage) {
			source = source.canvas;
		} else if (source instanceof createjs.DisplayObject) {
			if (!!source.cacheCanvas) {
				source = source.cacheCanvas;
			} else {
				throw new Error("The source of BitmapData.draw(), must be called DisplayObject.cache().");
			}
		} else if (source instanceof HTMLImageElement || source instanceof HTMLVideoElement) {
			var sCvs = createCanvas(source.width, source.height);
			var sCtx = sCvs.getContext("2d");
			sCtx.drawImage(source, 0, 0);
			source = sCvs;
		}
		matrix = matrix || new createjs.Matrix2D();
		var bmd;
		if (!!colorTransform) {
			var sw = source.width;
			var sh = source.height;
			bmd = new BitmapData(source, sw, sh);
			bmd.colorTransform(new createjs.Rectangle(0, 0, sw, sh), colorTransform);
			source = bmd.canvas;
		}
		smoothing = !!smoothing;
		var ctx = this.context;
		ctx.save();
		if (!!compositeOperation) ctx.globalCompositeOperation = compositeOperation;
		ctx.imageSmoothingEnabled = smoothing;
		ctx.webkitImageSmoothingEnabled = smoothing;
		ctx.mozImageSmoothingEnabled = smoothing;
		if (!!clipRect) {
			ctx.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
			ctx.clip();
		}
		ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		ctx.drawImage(source, 0, 0);
		ctx.restore();
		if (!!bmd) {
			bmd.dispose();
		}
		this._contextChanged = true;
	};

	/**
	* Draws the source object to the current bitmapdata. The method works faster than draw() because it doesn't apply the transformation matrix and the color transfomation. The method provides the same operation as drawImage() of the CanvasRenderingContext2D.<br>
	* ソースオブジェクトを現在のBitmapDataに描画します。変換行列やColorTransformを使用しないので、draw()よりも高速に動作します。このメソッドは、CanvasRenderingContext2DのdrawImage()と同様の動作を提供します。
	* @method drawImage
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param [sx=0] {Number} The x coordinate of the upper-left corner in the source object. If you omit the 6th and subsequent parameters, the value is treated as dx.<br>
	* ソースオブジェクトの左上x座標です。第6引数以降を省略した場合、この引数はdxとして動作します。
	* @param [sy=0] {Number} The y coordinate of the upper-left corner in the source object. If you omit the 6th and subsequent parameters, the value is treated as dy.<br>
	* ソースオブジェクトの左上y座標です。第6引数以降を省略した場合、この引数はdyとして動作します。
	* @param [sw] {Number} The width of the source object. If you omit the 6th and subsequent parameters, the value is treated as dw.<br>
	* ソースオブジェクトの幅です。第6引数以降を省略した場合、この引数はdwとして動作します。
	* @param [sh] {Number} The height of the source object. If you omit the 6th and subsequent parameters, the value is treated as dh.<br>
	* ソースオブジェクトの高さです。第6引数以降を省略した場合、この引数はdhとして動作します。
	* @param [dx] {Number} The x coordinate within the destination image that corresponds to the left side of the source object.<br>
	* 描画先の左上x座標です。
	* @param [dy] {Number} The y coordinate within the destination image that corresponds to the top side of the source object.<br>
	* 描画先の左上y座標です。
	* @param [dw] {Number} The width of the object when drawn.<br>
	* 描画時の幅です。
	* @param [dh] {Number} The height of the object when drawn.<br>
	* 描画時の高さです。
	**/
	p.drawImage = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
		if (source instanceof BitmapData || source instanceof createjs.Stage) {
			source = source.canvas;
		} else if (source instanceof createjs.DisplayObject) {
			if (!!source.cacheCanvas) {
				source = source.cacheCanvas;
			} else {
				throw new Error("The source of BitmapData.drawImage(), must be called DisplayObject.cache().");
			}
		}
		if (dx !== undefined) {
			this.context.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
		} else if (sw !== undefined) {
			dx = sx;
			dy = sy;
			dw = sw;
			dh = sh;
			this.context.drawImage(source, dx, dy, dw, dh);
		} else {
			dx = sx || 0;
			dy = sy || 0;
			this.context.drawImage(source, dx, dy);
		}
		this._contextChanged = true;
	};

	/**
	* Changes the size of the bitmapdata. A rectangle of the parameter correspond to the return value of the Filter.getBounds(). For example, if you want to expand by 8px on all sides (top, bottm, left, right), set the value to new createjs.Rectangle(-8, -8, 16, 16).<br>
	* BitmapDataのサイズを変更します。引数のRectangleは、Filter.getBounds()の戻り値に合わせています。例として、上下左右に8pxずつ拡げたい場合は、new createjs.Rectangle(-8, -8, 16, 16)を指定します。
	* @method expand
	* @param rect {Rectangle} A rectangle object to change the size of the bitmapdata. In case of using a Filter, pass the return value of the Filter.getBounds().<br>
	* BitmapDataのサイズ変更に使用するRectangleです。Filterを使用する場合は、Filter.getBounds()の戻り値をそのまま渡します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var source = _bmd01;
var filter = new createjs.BlurFilter(16, 16, 1);
var rect = filter.getBounds();
_bmd01.expand(rect);
var sourceRect = new createjs.Rectangle(0, 0, _bmd01.width, _bmd01.height);
var destPoint = new createjs.Point();
_bmd01.applyFilter(source, sourceRect, destPoint, filter);</code></pre>
	**/
	p.expand = function(rect) {
		var x = rect.x;
		var y = rect.y;
		var ceil = Math.ceil;
		var w = ceil(rect.width);
		var h = ceil(rect.height);
		var cvs = createCanvas(this.canvas.width + w, this.canvas.height + h);
		var ctx = cvs.getContext("2d");
		ctx.drawImage(this.canvas, -x, -y);
		this.canvas = cvs;
		this.context = ctx;
		this._contextChanged = true;
	};

	/**
	* Fills a rectangular area with a specified color value.<br>
	* BitmapDataの特定領域を指定されたカラー値で塗りつぶします。
	* @method fillRect
	* @param rect {Rectangle} A rectangle object that defines the area to be filled.<br>
	* 塗りつぶす範囲を示すRectangleです。
	* @param color {String | uint} A color value that fills the area. You can use a CSS compatible color value (ex. "#FF0000", "rgba(255,0,0,0.5)") or a 32-bit ARGB color value(ex. 0x80FF0000). In case of using a hexadecimal format, if you set the 0 at the alpha channel, the value is treated as 0xRRGGBB (ex. 0x00FF0000 is treated as 0xFF0000). If you want to set the pixels to transparence, you can use the clearRect().<br>
	* 塗りつぶしのカラー値です。CSS文字列と0xAARRGGBB形式の16進数値が使えます。16進数値で指定する際にアルファ値として0を指定した場合は、0xRRGGBBとして処理を行います。例として、0x00FF0000を指定した場合は、0xFF0000として処理されます。ピクセルを透明にしたい場合はclearRect()を使用して下さい。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(null, 200, 200);
_bmd02 = _bmd01.clone();
var rect = new createjs.Rectangle(0, 0, 200, 200);
var color01 = 0x80FF0000;
_bmd01.fillRect(rect, color01);
var color02 = createjs.Graphics.getRGB(0, 0, 255, 0.5)
_bmd02.fillRect(rect, color02);</code></pre>
	**/
	p.fillRect = function(rect, color) {
		if (!isNaN(color)) {
			var r = color >> 16 & 0xFF;
			var g = color >> 8 & 0xFF;
			var b = color & 0xFF;
			var a = (color >> 24 & 0xFF) / 255;
			if (a === 0) {
				color = "rgb(" + r + "," + g + "," + b + ")";
			} else {
				color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
			}
		}
		var ctx = this.context;
		ctx.save();
		ctx.fillStyle = color;
		ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		ctx.restore();
		this._contextChanged = true;
	};

	/**
	* Fills the certain color from the specified point. It's similar to the paint bucket tool in various paint programs.<br>
	* 指定した座標を始点として、上下左右に連続した色をバケツツールのように塗りつぶします。
	* @method floodFill
	* @param x {uint} The x coordinate of starting point to fill.<br>
	* 塗りつぶしの始点となるx座標です。
	* @param y {uint} The y coordinate of starting point to fill<br>
	* 塗りつぶしの始点となるy座標です。
	* @param color {uint} A color value to use as fill. You can use only a 32-bit ARGB color value (ex. 0xAARRGGBB).<br>
	* 塗りつぶしのカラー値です。0xAARRGGBB形式の16進数値のみ使用できます。
	* @example
	* <pre><code>function clickHandler(evt) {
  _bmd01.floodFill(evt.stageX, evt.stageY, 0xFFCCCCCC);
  _stage.update();
}</code></pre>
	**/
	p.floodFill = function(x, y, color) {
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		x = x >> 0;
		y = y >> 0;
		if (x < 0 || y < 0 || w <= x || h <= y) {
			return;
		}
		var targetColor = this.getPixel32(x, y);
		if (targetColor === color) {
			return;
		}
		var d = imgData.data;
		var buffer = [new createjs.Point(x, y)];
		while (buffer.length) {
			var p = buffer.shift();
			var px = p.x;
			var py = p.y;
			if (this.getPixel32(px, py) === color) {
				continue;
			}
			for (var xl = px; 0 < xl; xl--) {
				if (this.getPixel32(xl - 1, py) !== targetColor) {
					break;
				}
			}
			for (var xr = px; xr < w - 1; xr++) {
				if (this.getPixel32(xr + 1, py) !== targetColor) {
					break;
				}
			}
			for (var i = xl; i <= xr; i++) {
				this.setPixel32(i, py, color);
			}
			if (py + 1 < h) scanLine.call(this, xl, xr, py + 1, targetColor, buffer);
			if (0 <= py - 1) scanLine.call(this, xl, xr, py - 1, targetColor, buffer);
		}
		this.updateContext();
	};

	function scanLine(xl, xr, y, targetColor, buffer) {
		while (xl <= xr) {
			while (xl <= xr) {
				if (this.getPixel32(xl, y) === targetColor) {
					break;
				}
				xl++;
			}
			if (xr < xl) {
				break;
			}
			xl++;
			while (xl <= xr) {
				if (this.getPixel32(xl, y) !== targetColor) {
					break;
				}
				xl++;
			}
			buffer.push(new createjs.Point(xl - 1, y));
		}
	}

	/**
	* If you set the findColor parameter to true, the method returns a rectangle object that is enclosed area with the specified color. If you set the findColor parameter to false, the method returns a rectangle object that is enclosed area with the not specified color.<br>
	* 引数findColorにtrueを指定した場合は、指定された色のピクセルを囲むRectangleを返します。findColorにfalseを指定した場合は、指定された色ではないピクセルを囲むRectangleを返します。
	* @method getColorBoundsRect
	* @param mask {uint} A hexadicimal value to mask the color value of pixels. The color value is combined with this value, by using the & (bitwise AND) operator.<br>
	* ピクセルのカラー値をマスクする16進数値を指定します。ピクセルのカラー値とこの16進数値は、AND論理演算子でつなげられます。
	* @param color {uint} A hexadicimal value to be used as the target color. You can use only a 32-bit ARGB color value (ex. 0xAARRGGBB).<br>
	* 対象とするカラー値を指定します。0xAARRGGBB形式の16進数値のみ使用できます。
	* @param [findColor=false] {Boolean} If you set the value to true, the method returns a rectangle that is enclosed area with the specified color. If you set the value to false, the method returns a rectangle that is enclosed area with the not specified color.<br>
	* trueを指定した場合、指定された色のピクセルを囲むRectangleを返します。falseを指定した場合、指定された色ではないピクセルを囲むRectangleを返します。
	* @return {Rectangle} A rectangle object that is enclosed all pixels that matched the conditions. If no pixel match the conditions, the method returns a Rectangle(0, 0, 0, 0).<br>
	* 条件に合致したすべてのピクセルを囲むRectangleです。条件に合致するピクセルがない場合は、Rectangle(0, 0, 0, 0)を返します。
	**/
	p.getColorBoundsRect = function(mask, color, findColor) {
		if (findColor === undefined) findColor = true;
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		var d = imgData.data;
		var xMin = NaN, xMax = NaN, yMin = NaN, yMax = NaN;
		for (var i = 0, l = d.length; i < l; i += 4) {
			var value = ((d[i + 3] << 24 | d[i] << 16 | d[i + 1] << 8 | d[i + 2]) & mask) >>> 0;
			if ((findColor && (value === color)) || (!findColor && (value !== color))) {
				var p = i / 4;
				var x = p % w;
				var y = p / w >> 0;
				if (isNaN(xMin)) {
					xMin = xMax = x;
					yMin = yMax = y;
				} else {
					if (x < xMin) xMin = x;
					if (xMax < x) xMax = x;
					if (y < yMin) yMin = y;
					if (yMax < y) yMax = y;
				}
			}
			if (xMin === 0 && xMax === w - 1 && yMin === 0 && yMax === h - 1) {
				break;
			}
		}
		if (isNaN(xMin)) {
			return new createjs.Rectangle();
		} else {
			return new createjs.Rectangle(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
		}
	};

	/**
	* Returns a number that represents a RGB color value from the specified point.<br>
	* 指定された座標のRGBカラー値を数値で返します。
	* @method getPixel
	* @param x {uint} The x coordinate to get the color value.<br>
	* カラー値を取得するx座標です。
	* @param y {uint} The y coordinate to get the color value.<br>
	* カラー値を取得するy座標です。
	* @return {uint} A number that represents a RGB color value.<br>
	* RGBカラー値を表す数値です。
	* @example
	* <pre><code>var color = forcemap.getPixel(x, y);</code></pre>
	**/
	p.getPixel = function(x, y) {
		if (x < 0 || y < 0) {
			return 0;
		}
		x = x >> 0;
		y = y >> 0;
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		if (w <= x || h <= y) {
			return 0;
		}
		var d = imgData.data;
		var i = ((w * y) + x) * 4;
		var r = d[i];
		var g = d[++i];
		var b = d[++i];
		return r << 16 | g << 8 | b;
	};

	/**
	* Returns a number that represents a ARGB color value from the specified point.<br>
	* 指定された座標のARGBカラー値を数値で返します。
	* @method getPixel32
	* @param x {uint} The x coordinate to get the color value.<br>
	* カラー値を取得するx座標です。
	* @param y {uint} The y coordinate to get the color value.<br>
	* カラー値を取得するy座標です。
	* @return {uint} A number that represents a ARGB color value.<br>
	* ARGBカラー値を表す数値です。
	**/
	p.getPixel32 = function(x, y) {
		if (x < 0 || y < 0) {
			return 0;
		}
		x = x >> 0;
		y = y >> 0;
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		if (w <= x || h <= y) {
			return 0;
		}
		var d = imgData.data;
		var i = ((w * y) + x) * 4;
		var r = d[i];
		var g = d[++i];
		var b = d[++i];
		var a = d[++i];
		return (a << 24 | r << 16 | g << 8 | b) >>> 0;
	};

	/**
	* Returns the pixel data of the specified area as a Uint8ClampedArray (CanvasPixelArray in the case of the old browser). The pixel data of the return value is stored in the order of R, G, B, A.<br>
	* 引数で指定された領域のピクセルデータをUint8ClampedArray（旧ブラウザではCanvasPixelArray）で返します。戻り値のピクセルデータは、R, G, B, Aの並びになっています。
	* @method getPixels
	* @param rect {Rectangle} A rectangle object that defines the area to get the pixel data.<br>
	* ピクセルデータを取得する範囲を示すRectangleです。
	* @return {Uint8ClampedArray} A Uint8ClampedArray (imageData.data) of the specified area.<br>
	* 指定された範囲のimageData.dataプロパティを返します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
_bmd02 = new createjs.BitmapData(_image02);
var rect = new createjs.Rectangle(20, 20, 160, 160);
var data01 = _bmd01.getPixels(rect);
var data02 = _bmd02.getPixels(rect);
for (var i = 0, l = data01.length; i &lt; l; i += 4) {
  if (i / 4 % 2 !== 0) {
    var r = i;
    var g = i + 1;
    var b = i + 2;
    var a = i + 3;
    data01[r] = data02[r];
    data01[g] = data02[g];
    data01[b] = data02[b];
    data01[a] = data02[a];
  }
}
_bmd01.setPixels(rect, data01);</code></pre>
	**/
	p.getPixels = function(rect) {
		return this.context.getImageData(rect.x >> 0, rect.y >> 0, rect.width >> 0, rect.height >> 0).data;
	};

	/**
	* Returns a two-dimentsional array that represents the histogram of the bitmapdata. The array of the return value contains four arrays with the format [[R], [G], [B], [A]]. Each array contains 256 (from 0 to 255) values that represents the population count of an individual color value.<br>
	* BitmapDataのヒストグラムを2次元配列で返します。戻り値の配列は、[[R], [G], [B], [A]]の形式で4つの配列を格納しています。各カラー値の配列は、0～255のindexを持っており、そこにカラー値のポピュレーションカウントを格納しています。
	* @method histogram
	* @param hRect {Rectangle} A rectangle object that defines the area to get the histogram.<br>
	* ヒストグラムを取得する範囲を示すRectangleです。
	* @return {Array} A two-dimensional array that represents the histogram of the bitmapdata.<br>
	* BitmapDataのヒストグラムを表す2次元配列です。
	**/
	p.histogram = function(hRect) {
		var h = [[], [], [], []];
		for (var i = 0, l = 256; i < l; i++) {
			h[0][i] = 0;
			h[1][i] = 0;
			h[2][i] = 0;
			h[3][i] = 0;
		}
		var imgData = this.context.getImageData(hRect.x >> 0, hRect.y >> 0, hRect.width >> 0, hRect.height >> 0);
		var d = imgData.data;
		for (i = 0, l = d.length; i < l; i += 4) {
			h[0][d[i]]++;
			h[1][d[i + 1]]++;
			h[2][d[i + 2]]++;
			h[3][d[i + 3]]++;
		}
		return h;
	};

	/**
	* Performs pixel-level hit detection including alpha channel. If the 3rd parameter (secondObject) is a Point or a rectangle, The method doesn't need the 4th and subsequent parameters.<br>
	* アルファチャンネルを含めたピクセルレベルの衝突判定を行います。対象オブジェクトがPoint, Rectangleの場合には第4引数以降は必要ありません。
	* @method hitTest
	* @param firstPoint {Point} The point that represents the upper-left corner of the current bitmapdata in an arbitrary coordinate space.<br>
	* 任意の座標空間における現在のBitmapDataの座標を示すPointです。
	* @param firstAlphaThreshold {uint} The threshold value of the alpha channel that is considered opaque within the current bitmapdata.<br>
	* 現在のBitmapDataで不透明とするアルファチャンネルのしきい値です。
	* @param secondObject {Point | Rectangle | BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object that is the target of hit detection.<br>
	* 衝突判定の対象となるオブジェクトです。
	* @param [secondObjectPoint=null] {Point} The point that represents the upper-left corner of the secondObject.<br>
	* secondObjectの座標を示すPointです。
	* @param [secondAlphaThreshold=1] {uint} The threshold value of the alpha channel that is considered opaque within the secondObject.<br>
	* secondObjectで不透明とするアルファチャンネルのしきい値です。
	* @return {Boolean} If a hit occurs, the return value is true, otherwise false.<br>
	* 衝突している場合はtrue、していない場合はfalseを返します。
	* @example
	* <pre><code>var firstPoint = new createjs.Point(_bitmap01.x, _bitmap01.y);
var firstAlphaThreshold = 0xFF;
var secondObject = _shape_bmd;
var secondObjectPoint = new createjs.Point(_shape.x - 20, _shape.y - 20);
var secondAlphaThreshold = 0x80;
if (_bmd01.hitTest(firstPoint, firstAlphaThreshold, secondObject, secondObjectPoint, secondAlphaThreshold)) {
  if (!_isHitting) {
    changeColor(&quot;rgba(0,255,0,0.75)&quot;);
  }
} else {
  if (_isHitting) {
    changeColor(&quot;rgba(0,0,255,0.75)&quot;);
  }
}</code></pre>
	**/
	p.hitTest = function(firstPoint, firstAlphaThreshold, secondObject, secondObjectPoint, secondAlphaThreshold) {
		var fx = firstPoint.x >> 0;
		var fy = firstPoint.y >> 0;
		var w = this.canvas.width;
		var h = this.canvas.height;
		if (this._contextChanged) this.updateImageData();
		var data = this._imageData.data;
		var sx, sy;
		if (secondObject instanceof createjs.Point) {
			sx = (secondObject.x >> 0) - fx;
			sy = (secondObject.y >> 0) - fy;
			if (w <= sx || h <= sy || sx < 0 || sy < 0) {
				return false;
			}
			return firstAlphaThreshold <= data[((w * sy) + sx) * 4 + 3];
		}
		var area, ax, ay, aw, ah;
		if (secondObject instanceof createjs.Rectangle) {
			secondObject.x = (secondObject.x >> 0) - fx;
			secondObject.y = (secondObject.y >> 0) - fy;
			area = getIntersection(new createjs.Rectangle(0, 0, w, h), secondObject);
			if (area === 0) {
				return false;
			}
			for (ay = area.y, ah = ay + area.height; ay < ah; ay++) {
				for (ax = area.x, aw = ax + area.width; ax < aw; ax++) {
					if (firstAlphaThreshold <= data[((w * ay) + ax) * 4 + 3]) {
						return true;
					}
				}
			}
			return false;
		}
		var sCtx = getSourceContext(secondObject, secondObject.width, secondObject.height);
		if (!sCtx) {
			throw new Error("The secondObject must be Point, Rectangle, BitmapData, cached DisplayObject.");
		}
		secondObjectPoint = secondObjectPoint || new createjs.Point();
		secondAlphaThreshold = secondAlphaThreshold || 1;
		sx = (secondObjectPoint.x >> 0) - fx;
		sy = (secondObjectPoint.y >> 0) - fy;
		var sCvs = sCtx.canvas;
		area = getIntersection(new createjs.Rectangle(0, 0, w, h), new createjs.Rectangle(sx, sy, sCvs.width, sCvs.height));
		if (area === 0) {
			return false;
		}
		var sox = area.x;
		var soy = area.y;
		var sow = area.width;
		var soh = area.height;
		var sImgData = sCtx.getImageData(sox - sx, soy - sy, sow, soh);
		var sData = sImgData.data;
		for (ay = soy, ah = ay + soh; ay < ah; ay++) {
			for (ax = sox, aw = ax + sow; ax < aw; ax++) {
				if (secondAlphaThreshold <= sData[((sow * (ay - soy)) + (ax - sox)) * 4 + 3]) {
					if (firstAlphaThreshold <= data[((w * ay) + ax) * 4 + 3]) {
						return true;
					}
				}
			}
		}
		return false;
	};

	function getIntersection(rect1, rect2) {
		var w1 = rect1.width;
		var h1 = rect1.height;
		var w2 = rect2.width;
		var h2 = rect2.height;
		if (w1 === 0 || h1 === 0 || w2 === 0 || h2 === 0) {
			return 0;
		}
		var l1 = rect1.x;
		var r1 = l1 + w1;
		var t1 = rect1.y;
		var b1 = t1 + h1;
		var l2 = rect2.x;
		var r2 = l2 + w2;
		var t2 = rect2.y;
		var b2 = t2 + h2;
		if (l1 < r2 && t1 < b2 && l2 < r1 && t2 < b1) {
			var l = (l1 < l2) ? l2 : l1;
			var r = (r2 < r1) ? r2 : r1;
			var t = (t1 < t2) ? t2 : t1;
			var b = (b2 < b1) ? b2 : b1;
			return new createjs.Rectangle(l, t, r - l, b - t);
		} else {
			return 0;
		}
	}

	/**
	* Performs per-channel blending from a source object to the current bitmapdata.<br>
	* 現在のBitmapDataとソースオブジェクトをチャンネルごとにブレンドします。
	* @method merge
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination bitmapdata.<br>
	* マージ先の左上座標を示すPointです。
	* @param redMultiplier {uint} A uint value by which to multiply the red channel value.<br>
	* 赤チャンネル値に乗算する数値です。
	* @param greenMultiplier {uint} A uint value by which to multiply the green channel value.<br>
	* 緑チャンネル値に乗算する数値です。
	* @param blueMultiplier {uint} A uint value by which to multiply the blue channel value.<br>
	* 青チャンネル値に乗算する数値です。
	* @param alphaMultiplier {uint} A uint value by which to multiply the alpha channel value.<br>
	* アルファチャンネル値に乗算する数値です。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
_bmd02 = _bmd01.clone();
_bmd03 = new createjs.BitmapData(_image02);
var source = _bmd03;
var sourceRect = new createjs.Rectangle(0, 0, _image02.width, _image02.height);
var destPoint = new createjs.Point();
var redMultiplier = 192;
var greenMultiplier = 64;
var blueMultiplier = 128;
var alphaMultiplier = 128;
_bmd02.merge(source, sourceRect, destPoint, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier);</code></pre>
	**/
	p.merge = function(source, sourceRect, destPoint, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		var sData = sImgData.data;
		var dContext = this.context;
		var dImgData = dContext.getImageData(dx, dy, sw, sh);
		var dData = dImgData.data;
		for (var i = 0, l = dData.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			dData[r] = ((sData[r] * redMultiplier) + (dData[r] * (256 - redMultiplier))) / 256;
			dData[g] = ((sData[g] * greenMultiplier) + (dData[g] * (256 - greenMultiplier))) / 256;
			dData[b] = ((sData[b] * blueMultiplier) + (dData[b] * (256 - blueMultiplier))) / 256;
			dData[a] = ((sData[a] * alphaMultiplier) + (dData[a] * (256 - alphaMultiplier))) / 256;
		}
		dContext.putImageData(dImgData, dx, dy);
		this._contextChanged = true;
	};

	/**
	* Generates a random noise.<br>
	* ランダムノイズを生成します。
	* @method noise
	* @param [low=0] {uint} The lowest value to generate for each channel.<br>
	* チャンネルごとに生成する最小値です。
	* @param [high=255] {uint} The highest value to generate for each channel.<br>
	* チャンネルごとに生成する最大値です。
	* @param [channelOptions=7] {uint} The channel of the target. You can use the constant of the BitmapDataChannel class and use the logical OR operator (|) to combine channel values.<br>
	* 対象とするチャンネルを指定します。BitmapDataChannelクラスの定数が使え、OR論理演算子で複数のチャンネルを組み合わせることができます。
	* @param [grayScale=false] {Boolean} A Boolean value that determines whether or not to generates the grayscale noise. If you set the value to true, all channels set to the same value except the alpha channel.<br>
	* ノイズをグレイスケールにするかをBool値を指定します。trueにした場合、アルファチャンネルを除いたすべてのチャンネルが同じ値となります。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(null, 200, 200);
var low = 128;
var high = 200;
var channel = Object.create(createjs.BitmapDataChannel);
var channelOptions = channel.BLUE | channel.ALPHA;
var grayScale = false;
_bmd01.noise(low, high, channelOptions, grayScale);</code></pre>
	**/
	p.noise = function(low, high, channelOptions, grayScale) {
		low = low || 0;
		high = high || 255;
		var range = high - low;
		channelOptions = channelOptions || 7;
		grayScale = !!grayScale;
		var channel = Object.create(BitmapDataChannel);
		var red = (channelOptions & channel.RED) === channel.RED;
		var green = (channelOptions & channel.GREEN) === channel.GREEN;
		var blue = (channelOptions & channel.BLUE) === channel.BLUE;
		var alpha = (channelOptions & channel.ALPHA) === channel.ALPHA;
		var d = this._imageData.data;
		for (var i = 0, l = d.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			if (grayScale) {
				d[r] = d[g] = d[b] = (Math.random() * range >> 0) + low;
			} else {
				d[r] = (red) ? (Math.random() * range >> 0) + low : 0;
				d[g] = (green) ? (Math.random() * range >> 0) + low : 0;
				d[b] = (blue) ? (Math.random() * range >> 0) + low : 0;
			}
			d[a] = (alpha) ? (Math.random() * range >> 0) + low : 255;
		}
		this.updateContext();
	};

	/**
	* Remaps the color channel values, by using four arrays of the color palette data. If a channel is specified null as the color palette data, be copied from the source object to the destination bitmapdata. Each arrays of the color palette data should contains 256 values.<br>
	* カラーパレットデータ配列を使用して、BitmapDataのカラー値をマッピングします。パレットデータ配列でnullを指定したチャンネルでは、ソースオブジェクトのチャンネルが使用されます。各チャンネルのパレットデータ配列には、256個の値が含まれている必要があります。
	* @method paletteMap
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination bitmapdata.<br>
	* マッピング先の左上座標を示すPointです。
	* @param [redArray=null] {Array} A array of the palette data to be used remapping the red channel.<br>
	* 赤チャンネルのマッピングに使用するパレットデータ配列です。
	* @param [greenArray=null] {Array} A array of the palette data to be used remapping the green channel.<br>
	* 緑チャンネルのマッピングに使用するパレットデータ配列です。
	* @param [blueArray=null] {Array} A array of the palette data to be used remapping the blue channel.<br>
	* 青チャンネルのマッピングに使用するパレットデータ配列です。
	* @param [alphaArray=null] {Array} A array of the palette data to be used remapping the alpha channel.<br>
	* アルファチャンネルのマッピングに使用するパレットデータ配列です。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var source = _bmd01;
var sourceRect = new createjs.Rectangle(64, 48, 256, 144);
var destPoint = new createjs.Point(sourceRect.x, sourceRect.y);
var redArray = [], greenArray = [], blueArray = [], alphaArray = null;
for (var i = 0, l = 256; i &lt; l; i++) {
  redArray[i] = (255 - i) &lt;&lt; 16;
  greenArray[i] = (255 - i) &lt;&lt; 8;
  blueArray[i] = 255 - i;
}
_bmd01.paletteMap(source, sourceRect, destPoint, redArray, greenArray, blueArray, alphaArray);</code></pre>
	**/
	p.paletteMap = function(source, sourceRect, destPoint, redArray, greenArray, blueArray, alphaArray) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		var sData = sImgData.data;
		var dContext = this.context;
		var dImgData = dContext.getImageData(dx, dy, sw, sh);
		var dData = dImgData.data;
		for (var i = 0, l = dData.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			var red = (redArray) ? redArray[sData[r]] : sData[r] << 16;
			var green = (greenArray) ? greenArray[sData[g]] : sData[g] << 8;
			var blue = (blueArray) ? blueArray[sData[b]] : sData[b];
			var alpha = (alphaArray) ? alphaArray[sData[a]] : (sData[a] << 24) >>> 0;
			dData[r] = ((red >> 16 & 0xFF) + (green >> 16 & 0xFF) + (blue >> 16 & 0xFF) + (alpha >> 16 & 0xFF)) % 256;
			dData[g] = ((red >> 8 & 0xFF) + (green >> 8 & 0xFF) + (blue >> 8 & 0xFF) + (alpha >> 8 & 0xFF)) % 256;
			dData[b] = ((red & 0xFF) + (green & 0xFF) + (blue & 0xFF) + (alpha & 0xFF)) % 256;
			dData[a] = ((red >> 24 & 0xFF) + (green >> 24 & 0xFF) + (blue >> 24 & 0xFF) + (alpha >> 24 & 0xFF)) % 256;
		}
		dContext.putImageData(dImgData, dx, dy);
		this._contextChanged = true;
	};

	/**
	* Generates a Perlin noise.<br>
	* PerlinNoiseを生成します。
	* @method perlinNoise
	* @param baseX {Number} Frequency to use in the x direction.<br>
	* x方向で使用する周波数です。
	* @param baseY {Number} Frequency to use in the y direction.<br>
	* y方向で使用する周波数です。
	* @param numOctaves {uint} A Number of octaves to combine to create the noise. Larger number of octaves create images with greater detail, but also require more processing time.<br>
	* PerlinNoiseを作成するために組み合わせるオクターブの数です。オクターブ数を大きくすると、よりきめ細かいノイズを作成できますが、その分、処理に時間がかかります。
	* @param randomSeed {int} The random seed number to use to create the noise. Same random seed creates the same results each time.<br>
	* ノイズの生成に使用するランダムシード（乱数の種）を指定します。同じランダムシードからは、毎回同じ結果が得られます。
	* @param [stitch=false] {Boolean} If you set the value to true, the method attempts to smooth the transition edges of the image to create seamless textures for tiling as a bitmap fill. But also require more processing time.<br>
	* trueを指定した場合、タイリングに適したシームレスなPerlinNoiseを生成しますが、その分、処理に時間がかかります。
	* @param [fractalNoise=false] {Boolean} If you set the value to true, the method generates fractal noise.<br>
	* trueを指定した場合、フラクタルノイズを生成します。
	* @param [channelOptions=7] {uint} The target channels. You can use the constant of the BitmapDataChannel class. And you can use the logical OR operator (|) to combine channel values.<br>
	* 対象とするチャンネルを指定します。BitmapDataChannelクラスの定数が使え、OR論理演算子で複数のチャンネルを組み合わせることができます。
	* @param [grayScale=false] {Boolean} If you set the value to true, a grayscale image is created by setting each of the red, green, blue color channels to identical values. But this value doesn't affects the alpha channel.<br>
	* trueを指定した場合、RGBの各カラーチャンネルに同じ値を設定して、グレースケールのノイズが作成されます。この値はアルファチャンネルには影響しません。
	* @param [offsets=null] {Array} An array of points that correspond to offsets value for each octave.<br>
	* 各オクターブのオフセット値を格納した配列です。オフセット値はPointインスタンスで指定します。
	* @param [interpolateType="linear"] {String} You can choose the type of interpolation from "linear" or "cos", to smoothing the noise. The value "cos" creates smoother result, but also require more processing time. The default value is "linear".<br>
	* ノイズを滑らかにする補間のタイプを"linear"と"cos"から選択できます。"cos"の方が滑らかな結果が得られますが、その分、処理に時間がかかります。デフォルト値は"linear"です。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(null, 320, 240);
var baseX = _bmd01.width;
var baseY = _bmd01.height;
var numOctaves = 5;
var randomSeed = 7;
var stitch = false;
var fractalNoise = false;
var channel = Object.create(createjs.BitmapDataChannel);
var channelOptions = channel.RED | channel.GREEN | channel.BLUE;
var grayScale = true;
var offsets = [new createjs.Point(0, 0), new createjs.Point(0, 0)];
var interpolateType = "cos";
_bmd01.perlinNoise(baseX, baseY, numOctaves, randomSeed, stitch, fractalNoise, channelOptions, grayScale, offsets, interpolateType);</code></pre>
	**/
	p.perlinNoise = function(baseX, baseY, numOctaves, randomSeed, stitch, fractalNoise, channelOptions, grayScale, offsets, interpolateType) {
		if (numOctaves === 0) {
			this.fillRect(new createjs.Rectangle(0, 0, this.canvas.width, this.canvas.height), 0);
			return;
		}
		baseX = baseX || 1;
		baseY = baseY || 1;
		stitch = !!stitch;
		fractalNoise = !!fractalNoise;
		channelOptions = channelOptions || 7;
		grayScale = !!grayScale;
		offsets = offsets || [];
		interpolateType = interpolateType || "linear";
		NoiseGenerator.setProperties(randomSeed, interpolateType);
		var channels = [];
		var bc = Object.create(BitmapDataChannel);
		if (!grayScale) {
			var chR = channels[0] = (channelOptions & bc.RED) === bc.RED;
			var chG = channels[1] = (channelOptions & bc.GREEN) === bc.GREEN;
			var chB = channels[2] = (channelOptions & bc.BLUE) === bc.BLUE;
		}
		var chA = channels[3] = (channelOptions & bc.ALPHA) === bc.ALPHA;
		var data = this._imageData.data;
		for (var y = 0, h = this.canvas.height; y < h; y++) {
			for (var x = 0, w = this.canvas.width; x < w; x++) {
				var noises;
				if (stitch) {
					noises = NoiseGenerator.getStitchNoises(x, y, w, h, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
				} else {
					noises = NoiseGenerator.getNoises(x, y, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
				}
				var r = ((w * y) + x) * 4;
				var g = r + 1;
				var b = r + 2;
				var a = r + 3;
				if (grayScale) {
					data[r] = data[g] = data[b] = noises[0] * 256;
				} else {
					data[r] = (chR) ? noises[0] * 256 : 0;
					data[g] = (chG) ? noises[1] * 256 : 0;
					data[b] = (chB) ? noises[2] * 256 : 0;
				}
				data[a] = (chA) ? noises[3] * 256 : 255;
			}
		}
		this.updateContext();
	};

	var NoiseGenerator = (function() {
		var PERSISTENCE = 0.5;
		var A = 1103515245;
		var B = 12345;
		var M = 2147483647;
		var seed = 1;
		var interpolate;
		function NoiseGenerator () {
		}
		NoiseGenerator.setProperties = function(s, type) {
			if (s !== 0) {
				seed = s % 0xffffff;
			}
			if (type === "cos") {
				interpolate = cosineInterpolate;
			} else {
				interpolate = linearInterpolate;
			}
		};
		NoiseGenerator.getStitchNoises = function(x, y, w, h, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets) {
			var xw = x + w;
			var yh = y + h;
			var n11 = getNoises(x, y, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
			var n12 = getNoises(xw, y, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
			var n21 = getNoises(x, yh, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
			var n22 = getNoises(xw, yh, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets);
			var ratioX = x / w;
			var ratioY = y / h;
			var iRatioX = 1 - ratioX;
			var iRatioY = 1 - ratioY;
			var noises = [0, 0, 0, 0];
			if (grayScale || channels[0]) {
				noises[0] = n11[0] * ratioX * ratioY + n12[0] * iRatioX * ratioY + n21[0] * ratioX * iRatioY + n22[0] * iRatioX * iRatioY;
			}
			if (!grayScale && channels[1]) {
				noises[1] = n11[1] * ratioX * ratioY + n12[1] * iRatioX * ratioY + n21[1] * ratioX * iRatioY + n22[1] * iRatioX * iRatioY;
			}
			if (!grayScale && channels[2]) {
				noises[2] = n11[2] * ratioX * ratioY + n12[2] * iRatioX * ratioY + n21[2] * ratioX * iRatioY + n22[2] * iRatioX * iRatioY;
			}
			if (channels[3]) {
				noises[3] = n11[3] * ratioX * ratioY + n12[3] * iRatioX * ratioY + n21[3] * ratioX * iRatioY + n22[3] * iRatioX * iRatioY;
			}
			return noises;
		};
		function getNoises(x, y, baseX, baseY, numOctaves, fractalNoise, channels, grayScale, offsets) {
			var chR = channels[0];
			var chG = channels[1];
			var chB = channels[2];
			var chA = channels[3];
			var noises = [0, 0, 0, 0];
			var buffers = [];
			for (var i = 0; i < numOctaves; i++) {
				var pow = i + 1;
				var freq = Math.pow(2, pow);
				var amp = Math.pow(PERSISTENCE, pow);
				var ox, oy;
				if (offsets[i]) {
					ox = offsets[i].x;
					oy = offsets[i].y;
				} else {
					ox = oy = 0;
				}
				var tx = (x + ox) / baseX * freq;
				var ty = (y + oy) / baseY * freq;
				if (grayScale) {
					buffers[0] = createNoise(tx, ty, 0);
				} else {
					if (chR) buffers[0] = createNoise(tx, ty, 0);
					if (chG) buffers[1] = createNoise(tx, ty, 1);
					if (chB) buffers[2] = createNoise(tx, ty, 2);
				}
				if (chA) buffers[3] = createNoise(tx, ty, 3);
				for (var j = 0, m = 4; j < m; j++) {
					var v = buffers[j];
					if (v === undefined) {
						continue;
					}
					if (fractalNoise) {
						v = v * 0.6 + 0.2;
					} else {
						v = v * v;
					}
					noises[j] += v * amp;
				}
			}
			return noises;
		}
		NoiseGenerator.getNoises = getNoises;
		function createNoise(x, y, c) {
			var ix1 = x >> 0;
			var iy1 = y >> 0;
			var fx = x - ix1;
			var fy = y - iy1;
			var ix2 = ix1 + 1;
			var iy2 = iy1 + 1;
			var n11 = noise(ix1, iy1, c);
			var n12 = noise(ix2, iy1, c);
			var n21 = noise(ix1, iy2, c);
			var n22 = noise(ix2, iy2, c);
			var n1 = interpolate(n11, n12, fx);
			var n2 = interpolate(n21, n22, fx);
			return interpolate(n1, n2, fy);
		}
		function linearInterpolate(a, b, x) {
			return a * (1 - x) + b * x;
		}
		function cosineInterpolate(a, b, x) {
			var ft = x * Math.PI;
			var f = (1 - Math.cos(ft)) * 0.5;
			return a * (1 - f) + b * f;
		}
		function noise(x, y, c) {
			var r = (seed + x) * ((y + c) ^ B);
			r = ((r << 13) ^ r) & 0xffffffff;
			return ((A * r + B) & M) / (M + 1);
		}
		return NoiseGenerator;
	}());

	/**
	* Performs a pixel-dissolve from the current bitmapdata to a source object.<br>
	* 現在のBitmapDataからソースオブジェクトへのピクセルディゾルブを実行します。
	* @method pixelDissolve
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination object.<br>
	* ディゾルブ先の左上座標を示すPointです。
	* @param [buffer=null] {Array} If you want to performs consecutive pixel-dissolve, please specify the return value of the pixelDissolve().<br>
	* 連続したピクセルディゾルブを実行したい場合は、pixelDissolve()の戻り値のbuffer配列を指定します。
	* @param [numPixels=0] {uint} A number of pixels to be replaced at a single process. The default value is sourceRect.width \* souceRect.height / 30.<br>
	* 1回の処理で置き換えるピクセル数です。デフォルト値は、sourceRect.width \* souceRect.height / 30 です。
	* @param [fillColor=0] {uint} A ARGB color value to fill the pixels, when the source object equals the current bitmapdata.<br>
	* ソースオブジェクトが現在のBitmapDataの場合に使用されるカラー値を0xAARRGGBB形式の16進数値で指定します。
	* @return {Array} Returns the buffer array. If you want to performs consecutive pixel-dissolve, pass the return value as the 4th parameter at the next calling. When the pixel-dissolve is finished, the method returns number 0.<br>
	* buffer配列を返します。この戻り値の配列を第4引数に指定することで連続したピクセルディゾルブを実行できます。ピクセルディゾルブが終了した際には数値 0 を返します。
	* @example
	* <pre><code>function tickHandler(evt) {
  if (_buffer === 0) {
    return;
  }
  var sourceRect = new createjs.Rectangle(0, 0, _source.width, _source.height);
  var destPoint = new createjs.Point(sourceRect.x, sourceRect.y);
  var numPixels = 600;
  var fillColor = null
  _buffer = _bmd01.pixelDissolve(_source, sourceRect, destPoint, _buffer, numPixels, fillColor);
  _stage.update();
}</code></pre>
	**/
	p.pixelDissolve = function(source, sourceRect, destPoint, buffer, numPixels, fillColor) {
		var w = this.canvas.width;
		var h = this.canvas.height;
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		numPixels = numPixels || sw * sh / 30 >> 0;
		fillColor = fillColor || 0;
		var compare = this === source;
		var red, green, blue, alpha;
		if (compare) {
			red = fillColor >> 16 & 0xFF;
			green = fillColor >> 8 & 0xFF;
			blue = fillColor & 0xFF;
			alpha = fillColor >> 24 & 0xFF;
		}
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		var sData = sImgData.data;
		if (this._contextChanged) this.updateImageData();
		var tData = this._imageData.data;
		if (!buffer) {
			buffer = [];
			for (var i = 0, l = sw * sh; i < l; i++) {
				buffer[i] = i;
			}
		}
		while (0 < numPixels) {
			var random = Math.random() * (buffer.length - 1) >> 0;
			var bi = buffer.splice(random, 1)[0];
			var bx = bi % sw;
			var by = bi / sw >> 0;
			var tx = bx + dx;
			var ty = by + dy;
			if (tx < 0 || ty < 0 || w <= tx || h <= ty) {
				continue;
			}
			var ti = ((w * ty) + tx) * 4;
			if (compare) {
				tData[ti] = red;
				tData[++ti] = green;
				tData[++ti] = blue;
				tData[++ti] = alpha;
			} else {
				var si = bi * 4;
				tData[ti] = sData[si];
				tData[++ti] = sData[++si];
				tData[++ti] = sData[++si];
				tData[++ti] = sData[++si];
			}
			if (buffer.length === 0) {
				this.updateContext();
				return 0;
			}
			numPixels--;
		}
		this.updateContext();
		return buffer;
	};

	/**
	* Scrolls an image by a specified pixel amount. Edge regions outside the scrolling area are left unchanged.<br>
	* 指定されたピクセル量だけイメージをスクロールします。スクロール領域外のエッジ領域は変わらずにそのままになります。
	* @method scroll
	* @param x {int} The amount by which to scroll horizontally.<br>
	* x軸方向のスクロール量です。
	* @param y {int}  The amount by which to scroll vertically.<br>
	* y軸方向のスクロール量です。
	**/
	p.scroll = function(x, y) {
		var ctx = this.context;
		if (this._contextChanged) this.updateImageData();
		ctx.putImageData(this._imageData, x >> 0, y >> 0);
		this._contextChanged = true;
	};

	/**
	* Sets the new color value to a pixel of the specified point. The alpha channel value is kept the current value. You must call updateContext() to reflect the results of setPixel() to the bitmapdata.<br>
	* 指定された座標のピクセルに新しいカラー値を設定します。アルファチャンネルの値は現在の値が保たれます。setPixel()の実行結果を実際にBitmapDataに反映させるにはupdateContext()を実行する必要があります。
	* @method setPixel
	* @param x {uint} The x coordinate to set a color value.<br>
	* カラー値を設定するx座標です。
	* @param y {uint} The y coordinate to set a color value.<br>
	* カラー値を設定するy座標です。
	* @param color {uint} A color value to set the pixel. You can use only a RGB color value (ex. 0xRRGGBB).<br>
	* 指定したピクセルに設定するカラー値です。0xRRGGBB形式の16進数値のみ使用できます。
	* @example
	* <pre><code>bmd.setPixel(x, y, 0x0099FF);</code></pre>
	**/
	p.setPixel = function(x, y, color) {
		if (x < 0 || y < 0) {
			return;
		}
		x = x >> 0;
		y = y >> 0;
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		if (w <= x || h <= y) {
			return;
		}
		var d = imgData.data;
		var i = ((w * y) + x) * 4;
		d[i] = color >> 16 & 0xFF;
		d[++i] = color >> 8 & 0xFF;
		d[++i] = color & 0xFF;
	};

	/**
	* Sets the new color value including alpha channel to a pixel of the specified point. You must call updateContext() to reflect the results of setPixel32() to the bitmapdata.<br>
	* 指定された座標のピクセルにアルファチャンネルを含めた新しいカラー値を設定します。setPixel32()の実行結果を実際にBitmapDataに反映させるにはupdateContext()を実行する必要があります。
	* @method setPixel32
	* @param x {uint} The x coordinate to set a color value.<br>
	* カラー値を設定するx座標です。
	* @param y {uint} The y coordinate to set a color value.<br>
	* カラー値を設定するy座標です。
	* @param color {uint} A color value to set the pixel. You can use only a ARGB color value (ex. 0xAARRGGBB).<br>
	* 指定したピクセルに設定するカラー値です。0xAARRGGBB形式の16進数値のみ使用できます。
	**/
	p.setPixel32 = function(x, y, color) {
		if (x < 0 || y < 0) {
			return;
		}
		x = x >> 0;
		y = y >> 0;
		if (this._contextChanged) this.updateImageData();
		var imgData = this._imageData;
		var w = imgData.width;
		var h = imgData.height;
		if (w <= x || h <= y) {
			return;
		}
		var d = imgData.data;
		var i = ((w * y) + x) * 4;
		d[i] = color >> 16 & 0xFF;
		d[++i] = color >> 8 & 0xFF;
		d[++i] = color & 0xFF;
		d[++i] = color >> 24 & 0xFF;
	};

	/**
	* Replaces the pixels of the specified area with the array of 2nd parameter.<br>
	* 指定された範囲のピクセルを指定された配列のデータで差し替えます。
	* @method setPixels
	* @param rect {Rectangle} A rectangle object that defines the area to set the pixel data.<br>
	* ピクセルデータを差し替える範囲を示すRectangleです。
	* @param inputArray {Array} An array to replace the pixel data. The pixel data must be stored in the order of R, G, B, A.<br>
	* 差し替えるピクセルデータを配列で指定します。ピクセルデータの並びは、R, G, B, Aの順番にする必要があります。
	**/
	p.setPixels = function(rect, inputArray) {
		var ctx = this.context;
		var imgData = ctx.createImageData(rect.width >> 0, rect.height >> 0);
		var data = imgData.data;
		for (var i = 0, l = data.length; i < l; i++) {
			data[i] = inputArray[i];
		}
		ctx.putImageData(imgData, rect.x >> 0, rect.y >> 0);
		this._contextChanged = true;
	};

	/**
	* Tests the pixels of the bitmapdata with the specified threshold, and sets a new color value by its result.<br>
	* 指定されたしきい値でBitmapDataのピクセル値をテストし、その合否によってピクセルに新たなカラー値をセットします。
	* @method threshold
	* @param source {BitmapData | DisplayObject | Stage | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} An object to use as a source.<br>
	* ソースとなるオブジェクトを指定します。
	* @param sourceRect {Rectangle} A rectangle object that defines the area of the source.<br>
	* ソースオブジェクトの範囲を示すRectangleです。
	* @param destPoint {Point} The destination Point that represents the upper-left corner of the destination bitmapdata.<br>
	* ピクセルの置き換え先の左上座標を示すPointです。
	* @param operation {String} A string representation of the comparison operator to test the pixels. The valid value are "<", "<=", ">", ">=", "==", "!=".<br>
	* ピクセルのテストに使う比較演算子を文字列で指定します。指定することができる値は、"<", "<=", ">", ">=", "==", "!="です。
	* @param threshold {uint} A color value ​​to be used as a threshold. You can use only a ARGB color value (ex. 0xAARRGGBB).<br>
	* しきい値となるカラー値を指定します。0xAARRGGBB形式の16進数値のみ使用できます。
	* @param [color=0] {uint} A new color value to set the pixels in case of passing the test. You can use only a ARGB color value (ex. 0xAARRGGBB).<br>
	* テストに合格した際にセットされる新しいカラー値を指定します。0xAARRGGBB形式の16進数値のみ使用できます。
	* @param [mask=0] {uint} A value of the mask to use to isolate a color component. You can use only a ARGB color value (ex. 0xAARRGGBB).<br>
	* 範囲を設定するマスク値を指定します。0xAARRGGBB形式の16進数値のみ使用できます。
	* @param [copySource=false] {Boolean} A boolean value that determines whether or not to copy the pixels from the source object to the current bitmapdata, when the threshold test is false.<br>
	* 比較結果がfalseの場合にソースオブジェクトのピクセルを現在のBitmapDataにコピーするかをBool値で指定します。
	* @example
	* <pre><code>_bmd01 = new createjs.BitmapData(_image01);
var source = _bmd01;
var halfW = _bmd01.width >> 1;
var sourceRect = new createjs.Rectangle(halfW, 0, halfW, _bmd01.height);
var destPoint = new createjs.Point(sourceRect.x, sourceRect.y);
var operation = &quot;&lt;&quot;;
var threshold = 0xFFEE0000;
var color = 0x00000000;
var mask = 0xFFFF0000;
var copySource = false;
_bmd01.threshold(source, sourceRect, destPoint, operation, threshold, color, mask, copySource);</code></pre>
	**/
	p.threshold = function(source, sourceRect, destPoint, operation, threshold, color, mask, copySource) {
		var sx = sourceRect.x >> 0;
		var sy = sourceRect.y >> 0;
		var sw = sourceRect.width >> 0;
		var sh = sourceRect.height >> 0;
		var dx = destPoint.x >> 0;
		var dy = destPoint.y >> 0;
		var thresholdMethod = getThresholdMethod(operation);
		color = color || 0;
		var red = color >> 16 & 0xFF;
		var green = color >> 8 & 0xFF;
		var blue = color & 0xFF;
		var alpha = color >> 24 & 0xFF;
		if (mask === undefined) mask = 0xFFFFFFFF;
		var sContext = getSourceContext(source, sx + sw, sy + sh);
		var sImgData = sContext.getImageData(sx, sy, sw, sh);
		var sData = sImgData.data;
		var dContext = this.context;
		var dImgData = dContext.getImageData(dx, dy, sw, sh);
		var dData = dImgData.data;
		for (var i = 0, l = dData.length; i < l; i += 4) {
			var r = i;
			var g = i + 1;
			var b = i + 2;
			var a = i + 3;
			var pixelValue = (sData[a] << 24 | sData[r] << 16 | sData[g] << 8 | sData[b]) >>> 0;
			if (thresholdMethod(pixelValue & mask, threshold & mask)) {
				dData[r] = red;
				dData[g] = green;
				dData[b] = blue;
				dData[a] = alpha;
			} else if (copySource) {
				dData[r] = sData[r];
				dData[g] = sData[g];
				dData[b] = sData[b];
				dData[a] = sData[a];
			}
		}
		dContext.putImageData(dImgData, dx, dy);
		this._contextChanged = true;
	};

	function getThresholdMethod(operation) {
		switch (operation) {
			case "<" :
				return function(pixelValue, threshold) {
					return pixelValue < threshold;
				};
			case "<=" :
				return function(pixelValue, threshold) {
					return pixelValue <= threshold;
				};
			case ">" :
				return function(pixelValue, threshold) {
					return pixelValue > threshold;
				};
			case ">=" :
				return function(pixelValue, threshold) {
					return pixelValue >= threshold;
				};
			case "==" :
				return function(pixelValue, threshold) {
					return pixelValue == threshold;
				};
			case "!=" :
				return function(pixelValue, threshold) {
					return pixelValue != threshold;
				};
		}
	}

	/**
	* Returns a string representation of the bitmapdata. The name property is used by output.<br>
	* BitmapDataの文字列表現を返します。nameプロパティの値が使用されます。
	* @method toString
	* @return {String} A string representation of the bitmapdata.<br>
	* BitmapDataの文字列表現です。
	**/
	p.toString = function() {
		return "[BitmapData (name=" + this.name + ")]";
	};

	/**
	* Updates the context with the imageData (instance property). You must call this method after calling setPixel() or setPixel32(). By calling updateContext(), the bitmapdata is updated with results of setPixel() or setPixel32().<br>
	* 内部に保持しているimageDataの内容でcontextを更新します。setPixel(), setPixel32()の処理を行った後は、このメソッドを実行する必要があります。updateContext()を実行することでsetPixel(), setPixel32()で行った処理がBitmapDataに反映されます。
	* @method updateContext
	**/
	p.updateContext = function() {
		this.context.putImageData(this._imageData, 0, 0);
	};

	/**
	* Updates the imageData of the instance property to the latest state. You must call this method when you operated context directly or you called updateCache() at the cache that got by getBitmapData().<br>
	* 内部に保持しているimageDataを最新の状態に更新します。contextを直接操作した場合やgetBitmapData()で取得したcacheをupdateCache()した場合には、このメソッドを実行する必要があります。
	* @method updateImageData
	**/
	p.updateImageData = function() {
		this._imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this._contextChanged = false;
	};

	function createCanvas(width, height) {
		var c = document.createElement("canvas");
		c.width = width;
		c.height = height;
		return c;
	}

	function getSourceContext(source, width, height) {
		var ctx;
		if (source instanceof BitmapData) {
			ctx = source.context;
		} else if (source instanceof HTMLCanvasElement) {
			ctx = source.getContext("2d");
		} else if (source instanceof createjs.Stage) {
			ctx = source.canvas.getContext("2d");
		} else if (source instanceof createjs.DisplayObject) {
			if (!!source.cacheCanvas) {
				ctx = source.cacheCanvas.getContext("2d");
			} else {
				throw new Error("The source must be called DisplayObject.cache().");
			}
		} else if (source instanceof HTMLImageElement || source instanceof HTMLVideoElement) {
			var cvs = createCanvas(width, height);
			ctx = cvs.getContext("2d");
			ctx.drawImage(source, 0, 0);
		}
		return ctx;
	}

	/**
	* The BitmapDataChannel class is an enumeration of constant values that indicate which channel to use: red, blue, green, alpha. When you call some methods, you can use the bitwise OR operator (|) to combine BitmapDataChannel constants to indicate multiple color channels.<br><br>
	* BitmapDataChannelクラスは、赤、緑、青、アルファのいずれのチャンネルを使用するかを示す際に使用できる定数値を保持しています。メソッドを呼び出すとき、OR論理演算子を使ってBitmapDataChannel定数を結合することにより、複数のカラーチャンネルを同時に指定することができます。
	* @static
	* @class BitmapDataChannel
	**/
	var BitmapDataChannel = {
		/**
		* The value represents alpha channel.<br>
		* アルファチャンネルを表す定数です。
		* @static
		* @property ALPHA
		* @type uint
		* @default 8
		**/
		ALPHA : 8,

		/**
		* The value represents blue channel.<br>
		* 青チャンネルを表す定数です。
		* @static
		* @property BLUE
		* @type uint
		* @default 4
		**/
		BLUE : 4,

		/**
		* The value represents green channel.<br>
		* 緑チャンネルを表す定数です。
		* @static
		* @property GREEN
		* @type uint
		* @default 2
		**/
		GREEN : 2,

		/**
		* The value represents red channel.<br>
		* 赤チャンネルを表す定数です。
		* @static
		* @property RED
		* @type uint
		* @default 1
		**/
		RED : 1,

		getChannelIndex : function(channel) {
			switch (channel) {
				case BitmapDataChannel.RED :
					return 0;
				case BitmapDataChannel.GREEN :
					return 1;
				case BitmapDataChannel.BLUE :
					return 2;
				case BitmapDataChannel.ALPHA :
					return 3;
			}
		}
	};

	/**
	* ColorTransform class can be used to adjust the color values of the bitmapdata. The ColorTransform maintains multiplier and offset in each channel: red, green, blue, alpha. When a ColorTransform is applied to a bitmapdata, a new value for each color channel is calculated like this.<br>New value = (Old value \* Multiplier) + Offset<br><br>
	* ColorTransformクラスは、BitmapDataクラスのカラー値を調整する際に使用することができます。R, G, B, Aの各チャンネルで乗数値（Multiplier）とオフセット値（Offset）を保持します。ColorTransformオブジェクトを適用する際に各チャンネルに設定される値の算出方法は下記の通りです。<br>新しい値 = (古い値 \* Multiplier) + Offset
	* @class ColorTransform
	* @constructor
	* @param [redMultiplier=1] {Number} The value for the red multiplier.<br>
	* 赤チャンネルの乗数値です。
	* @param [greenMultiplier=1] {Number} The value for the green multiplier.<br>
	* 緑チャンネルの乗数値です。
	* @param [blueMultiplier=1] {Number} The value for the blue multiplier.<br>
	* 青チャンネルの乗数値です。
	* @param [alphaMultiplier=1] {Number} The value for the alpha multiplier.<br>
	* アルファチャンネルの乗数値です。
	* @param [redOffset=0] {Number} The offset value for the red color channel.<br>
	* 赤チャンネルのオフセット値です。
	* @param [greenOffset=0] {Number} The offset value for the green color channel.<br>
	* 緑チャンネルのオフセット値です。
	* @param [blueOffset=0] {Number} The offset value for the blue color channel.<br>
	* 青チャンネルのオフセット値です。
	* @param [alphaOffset=0] {Number} The offset value for the alpha channel.<br>
	* アルファチャンネルのオフセット値です。
	**/
	var ColorTransform = (function() {
		function ColorTransform(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
			if (redMultiplier !== undefined) this.redMultiplier = redMultiplier;
			if (greenMultiplier !== undefined) this.greenMultiplier = greenMultiplier;
			if (blueMultiplier !== undefined) this.blueMultiplier = blueMultiplier;
			if (alphaMultiplier !== undefined) this.alphaMultiplier = alphaMultiplier;
			if (redOffset !== undefined) this.redOffset = redOffset;
			if (greenOffset !== undefined) this.greenOffset = greenOffset;
			if (blueOffset !== undefined) this.blueOffset = blueOffset;
			if (alphaOffset !== undefined) this.alphaOffset = alphaOffset;
		}

		var p = ColorTransform.prototype = {
			/**
			* The RGB color value for a ColorTransform object. When you set a value for this property, use the format 0xRRGGBB. it changes the three color offset values (redOffset, greenOffset, blueOffset) accordingly, and it sets the three color multiplier values (redMultiplier, greenMultiplier, blueMultiplier) to 0. The alpha channel's multiplier and offset values don't change.<br>
			* ColortransformオブジェクトのRGBカラー値を返します。このプロパティに値を設定する際には、0xRRGGBB形式の16進数値を使用して下さい。設定された値は、R, G, Bのoffset値として設定され、同時に3つのカラー乗数値 (redMultiplier, greenMultiplier, blueMultiplier) が0に設定されます。アルファチャンネルの乗数値とオフセット値は変更しません。
			* @property color
			* @type uint
			**/
			get color() {
				return (this.redOffset << 16 | this.greenOffset << 8 | this.blueOffset) >>> 0;
			},
			set color(value) {
				this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 0;
				this.redOffset = value >> 16 & 0xFF;
				this.greenOffset = value >> 8 & 0xFF;
				this.blueOffset = value & 0xFF;
			}
		};

		p.constructor = ColorTransform;

		/**
		* The value for the red multiplier.<br>
		* 赤チャンネル値に乗算する数値です。
		* @property redMultiplier
		* @type Number
		* @default 1
		**/
		p.redMultiplier = 1;

		/**
		* The value for the green multiplier.<br>
		* 緑チャンネル値に乗算する数値です。
		* @property greenMultiplier
		* @type Number
		* @default 1
		**/
		p.greenMultiplier = 1;

		/**
		* The value for the blue multiplier.<br>
		* 青チャンネル値に乗算する数値です。
		* @property blueMultiplier
		* @type Number
		* @default 1
		**/
		p.blueMultiplier = 1;

		/**
		* The value for the alpha multiplier.<br>
		* アルファチャンネル値に乗算する数値です。
		* @property alphaMultiplier
		* @type Number
		* @default 1
		**/
		p.alphaMultiplier = 1;

		/**
		* The offset value for the red color channel.<br>
		* 赤チャンネル値にredMultiplier値を乗算した後に加算する数値です。数値の範囲は -255～255です。
		* @property redOffset
		* @type Number
		* @default 0
		**/
		p.redOffset = 0;

		/**
		* The offset value for the green color channel.<br>
		* 緑チャンネル値にgreenMultiplier値を乗算した後に加算する数値です。数値の範囲は -255～255です。
		* @property greenOffset
		* @type Number
		* @default 0
		**/
		p.greenOffset = 0;

		/**
		* The offset value for the blue color channel.<br>
		* 青チャンネル値にblueMultiplier値を乗算した後に加算する数値です。数値の範囲は -255～255です。
		* @property blueOffset
		* @type Number
		* @default 0
		**/
		p.blueOffset = 0;

		/**
		* The offset value for the alpha channel.<br>
		* アルファチャンネル値にalphaMultiplier値を乗算した後に加算する数値です。数値の範囲は -255～255です。
		* @property alphaOffset
		* @type Number
		* @default 0
		**/
		p.alphaOffset = 0;

		/**
		* Creates a clone of the current ColorTransform object.<br>
		* 現在のColorTransformのクローンを作成します。
		* @method clone
		* @return {ColorTransform} A clone of the current ColorTransform object.<br>
		* 現在のColorTransformのクローンです。
		**/
		p.clone = function() {
			var ctf = Object.create(ColorTransform.prototype);
			if (this.hasOwnProperty("redMultiplier")) ctf.redMultiplier = this.redMultiplier;
			if (this.hasOwnProperty("greenMultiplier")) ctf.greenMultiplier = this.greenMultiplier;
			if (this.hasOwnProperty("blueMultiplier")) ctf.blueMultiplier = this.blueMultiplier;
			if (this.hasOwnProperty("alphaMultiplier")) ctf.alphaMultiplier = this.alphaMultiplier;
			if (this.hasOwnProperty("redOffset")) ctf.redOffset = this.redOffset;
			if (this.hasOwnProperty("greenOffset")) ctf.redOffset = this.redOffset;
			if (this.hasOwnProperty("blueOffset")) ctf.redOffset = this.redOffset;
			if (this.hasOwnProperty("alphaOffset")) ctf.redOffset = this.redOffset;
			return ctf;
		};

		/**
		* Concatenates the ColorTranform object specified by the 2nd parameter with the current ColorTransform object.<br>
		* 引数のColorTransformと現在のColorTransformを連結します。
		* @method concat
		* @param second {ColorTransform} A ColorTransform object to be combined with the current ColorTransform object.<br>
		* 現在のColorTransformオブジェクトと結合するColorTransformオブジェクトです。
		**/
		p.concat = function(second) {
			this.redOffset += this.redMultiplier * second.redOffset;
			this.greenOffset += this.greenMultiplier * second.greenOffset;
			this.blueOffset += this.blueMultiplier * second.blueOffset;
			this.alphaOffset += this.alphaMultiplier * second.alphaOffset;
			this.redMultiplier *= second.redMultiplier;
			this.greenMultiplier *= second.greenMultiplier;
			this.blueMultiplier *= second.blueMultiplier;
			this.alphaMultiplier *= second.alphaMultiplier;
		};

		/**
		* Returns a string that describes all of the properties of the ColorTransform object.<br>
		* ColorTransformのすべてのプロパティを列挙した文字列表現を返します。
		* @method toString
		* @return {String} A string representation of the ColorTransform object.<br>
		* ColorTransformの文字列表現です。
		**/
		p.toString = function() {
			return "[ColorTransform (redMultiplier=" + this.redMultiplier + ", greenMultiplier=" + this.greenMultiplier + ", blueMultiplier=" + this.blueMultiplier + ", alphaMultiplier=" + this.alphaMultiplier + ", redOffset=" + this.redOffset + ", greenOffset=" + this.greenOffset + ", blueOffset=" + this.blueOffset + ", alphaOffset=" + this.alphaOffset + ")]";
		};

		return ColorTransform;
	}());

	createjs.BitmapData = BitmapData;
	createjs.BitmapDataChannel = BitmapDataChannel;
	createjs.ColorTransform = ColorTransform;
}(window));