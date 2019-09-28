// DrawingUtils using CreateJS. This sets up a drawing stage
// and provides function to draw rectangles, points and triangles, as
// well as face textures.

(function() {
	"use strict";

	var drawing			= brfv4Example.drawing;

	var defaultValue 	= function(arg, val) {
		return typeof arg !== 'undefined' ? arg : val;
	};

	drawing.setup = function(canvas, faceTextures, fps) {

		drawing.stage				= new createjs.Stage(canvas);
		drawing.faceTextures		= faceTextures;

		drawing.container			= new createjs.Container();
		drawing.clickArea			= new createjs.Shape();
		drawing.drawSprite			= new createjs.Shape();
		drawing.imageContainer		= new createjs.Container();
		drawing.draw				= drawing.drawSprite.graphics;
		drawing.onUpdateCallback 	= null;

		drawing.container.addChild(drawing.drawSprite);
		drawing.container.addChild(drawing.imageContainer);
		drawing.container.addChild(drawing.clickArea);
		drawing.stage.addChild(drawing.container);

		// Usually webcams deliver 30 FPS.
		// Or 15 FPS, when it is too dark.
		// So a stage FPS of 30 is just fine.

		if(typeof fps === "undefined") { fps = 30; }

		createjs.Ticker.framerate = fps;
		createjs.Ticker.addEventListener("tick", drawing.stage);
	};

	drawing.updateLayout = function(width, height) {

		drawing.clickArea.graphics.clear();
		drawing.clickArea.graphics.beginFill("#ffffff");
		drawing.clickArea.graphics.drawRect(0, 0, width, height);
		drawing.clickArea.graphics.endFill();
		drawing.clickArea.alpha = 0.01; // will not be rendered if lower than 0.01
		drawing.clickArea.cursor = 'pointer';

		drawing.stage.canvas.width = width;
		drawing.stage.canvas.height = height;
		drawing.faceTextures.width = width;
		drawing.faceTextures.height = height;

		drawing.stage.update();
	};

	drawing.setUpdateCallback = function(updateCallback) {

		// Once BRF and Camera are ready we need to setup an onEnterFrame event.
		// The Ticker helps to get 30 FPS.

		if(drawing.onUpdateCallback != null) {
			drawing.stage.removeEventListener("tick", drawing.onUpdateCallback);
			drawing.onUpdateCallback = null;
		}

		if(updateCallback != null) {
			drawing.onUpdateCallback = updateCallback;
			drawing.stage.addEventListener("tick", drawing.onUpdateCallback);
		}
	};

	// The functions following below are drawing helpers
	// to draw points, rectangles, triangles, textures etc.

	drawing.clear = function() {
		drawing.draw.clear();

		if(drawing.faceTextures) {
			var ctx = drawing.faceTextures.getContext("2d");
			ctx.clearRect(0, 0, drawing.faceTextures.width, drawing.faceTextures.height);
		}
	};

	drawing.getColor = function(color, alpha) {
		return createjs.Graphics.getRGB((color >> 16) & 0xff, (color >> 8) & 0xff, (color) & 0xff, alpha);
	};
	var getColor = drawing.getColor;

	drawing.drawVertices = function(vertices, radius, clear, fillColor, fillAlpha) {
		clear		= defaultValue(clear, false);
		radius		= defaultValue(radius, 2.0);
		fillColor	= defaultValue(fillColor, 0x00a0ff);
		fillAlpha	= defaultValue(fillAlpha, 1.00);

		fillColor	= getColor(fillColor, fillAlpha);

		var g = drawing.draw;

		clear && g.clear();

		var i = 0;
		var l = vertices.length;

		for(; i < l;) {
			var x = vertices[i++];
			var y = vertices[i++];

			g.beginFill(fillColor);
			g.drawCircle(x, y, radius);
			g.endFill();
		}
	};

	drawing.drawTriangles = function(vertices, triangles, clear, lineThickness, lineColor, lineAlpha) {
		clear			= defaultValue(clear, false);
		lineThickness	= defaultValue(lineThickness, 0.5);
		lineColor		= defaultValue(lineColor, 0x00a0ff);
		lineAlpha		= defaultValue(lineAlpha, 0.85);

		lineColor = getColor(lineColor, lineAlpha);

		var g = drawing.draw;

		clear && g.clear();

		var i = 0;
		var l = triangles.length;

		while(i < l) {
			var ti0 = triangles[i];
			var ti1 = triangles[i + 1];
			var ti2 = triangles[i + 2];

			var x0 = vertices[ti0 * 2];
			var y0 = vertices[ti0 * 2 + 1];
			var x1 = vertices[ti1 * 2];
			var y1 = vertices[ti1 * 2 + 1];
			var x2 = vertices[ti2 * 2];
			var y2 = vertices[ti2 * 2 + 1];

			g.setStrokeStyle(lineThickness);
			g.beginStroke(lineColor);

			g.moveTo(x0, y0);
			g.lineTo(x1, y1);
			g.lineTo(x2, y2);
			g.lineTo(x0, y0);

			g.endStroke();

			i+=3;
		}
	};

	drawing.fillTriangles = function(vertices, triangles, clear, fillColor, fillAlpha) {
		clear		= defaultValue(clear, false);
		fillColor	= defaultValue(fillColor, 0x00a0ff);
		fillAlpha	= defaultValue(fillAlpha, 0.85);

		fillColor	= getColor(fillColor, fillAlpha);

		var g = drawing.draw;

		clear && g.clear();

		var i = 0;
		var l = triangles.length;

		while(i < l) {
			var ti0 = triangles[i];
			var ti1 = triangles[i + 1];
			var ti2 = triangles[i + 2];

			var x0 = vertices[ti0 * 2];
			var y0 = vertices[ti0 * 2 + 1];
			var x1 = vertices[ti1 * 2];
			var y1 = vertices[ti1 * 2 + 1];
			var x2 = vertices[ti2 * 2];
			var y2 = vertices[ti2 * 2 + 1];

			g.beginFill(fillColor);

			g.moveTo(x0, y0);
			g.lineTo(x1, y1);
			g.lineTo(x2, y2);
			g.lineTo(x0, y0);

			g.endFill();

			i+=3;
		}
	};

	drawing.drawTexture = function(vertices, triangles, uvData, texture) {

		// Ported from: http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas

		if(drawing.faceTextures) {

			var ctx = drawing.faceTextures.getContext("2d");

			var i = 0;
			var l = triangles.length;

			for(; i < l; i += 3) {

				var i0 = triangles[i];
				var i1 = triangles[i + 1];
				var i2 = triangles[i + 2];

				var x0 = vertices[i0 * 2];
				var y0 = vertices[i0 * 2 + 1];
				var x1 = vertices[i1 * 2];
				var y1 = vertices[i1 * 2 + 1];
				var x2 = vertices[i2 * 2];
				var y2 = vertices[i2 * 2 + 1];

				var u0 = uvData[i0 * 2] * texture.width;
				var v0 = uvData[i0 * 2 + 1] * texture.height;
				var u1 = uvData[i1 * 2] * texture.width;
				var v1 = uvData[i1 * 2 + 1] * texture.height;
				var u2 = uvData[i2 * 2] * texture.width;
				var v2 = uvData[i2 * 2 + 1] * texture.height;

				// Set clipping area so that only pixels inside the triangle will
				// be affected by the image drawing operation
				ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
				ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();

				// Compute matrix transform
				var delta   = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
				var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
				var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
				var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2 - v0*u1*x2 - u0*x1*v2;
				var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
				var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
				var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2 - v0*u1*y2 - u0*y1*v2;

				// Draw the transformed image
				ctx.setTransform(
					delta_a/delta, delta_d/delta,
					delta_b/delta, delta_e/delta,
					delta_c/delta, delta_f/delta);

				ctx.drawImage(texture, 0, 0);
				ctx.restore();
			}
		}
	};

	drawing.drawRect = function(rect, clear, lineThickness, lineColor, lineAlpha) {
		clear			= defaultValue(clear, false);
		lineThickness	= defaultValue(lineThickness, 1.0);
		lineColor		= defaultValue(lineColor, 0x00a0ff);
		lineAlpha		= defaultValue(lineAlpha, 1.0);

		lineColor		= getColor(lineColor, lineAlpha);

		var g = drawing.draw;

		clear && g.clear();

		g.setStrokeStyle(lineThickness);
		g.beginStroke(lineColor);
		g.drawRect(rect.x, rect.y, rect.width, rect.height);
		g.endStroke();
	};

	drawing.drawRects = function(rects, clear, lineThickness, lineColor, lineAlpha) {
		clear 			= defaultValue(clear, false);
		lineThickness 	= defaultValue(lineThickness, 1.0);
		lineColor 		= defaultValue(lineColor, 0x00a0ff);
		lineAlpha 		= defaultValue(lineAlpha, 1.0);

		lineColor		= getColor(lineColor, lineAlpha);

		var g = drawing.draw;

		clear && g.clear();

		g.setStrokeStyle(lineThickness);
		g.beginStroke(lineColor);

		var i = 0;
		var l = rects.length;
		var rect;

		for(; i < l; i++) {
			rect = rects[i];
			g.drawRect(rect.x, rect.y, rect.width, rect.height);
		}

		g.endStroke();
	};

	drawing.drawPoint = function(point, radius, clear, fillColor, fillAlpha) {
		clear 			= defaultValue(clear, false);
		radius			= defaultValue(radius, 2.0);
		fillColor 		= defaultValue(fillColor, 0x00a0ff);
		fillAlpha 		= defaultValue(fillAlpha, 1.0);

		fillColor		= getColor(fillColor, fillAlpha);

		var g = drawing.draw;

		clear && g.clear();

		g.beginFill(fillColor);
		g.drawCircle(point.x, point.y, radius);
		g.endFill();
	};

	drawing.drawPoints = function(points, radius, clear, fillColor, fillAlpha) {
		clear 			= defaultValue(clear, false);
		radius			= defaultValue(radius, 2.0);
		fillColor 		= defaultValue(fillColor, 0x00a0ff);
		fillAlpha 		= defaultValue(fillAlpha, 1.0);

		fillColor		= getColor(fillColor, fillAlpha);

		var g = drawing.draw;

		clear && g.clear();


		var i = 0;
		var l = points.length;
		var point;

		for(; i < l; i++) {
			point = points[i];

			g.beginFill(fillColor);
			g.drawCircle(point.x, point.y, radius);
			g.endFill();
		}
	};
})();
