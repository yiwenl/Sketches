// This adds 6 points to the 68 landmarks. These points cover the forehead,
// but are not actually tracked, they are just estimated depending on the 68 landmarks.

(function(lib) {
	"use strict";

	lib.BRFv4ExtendedFace = function() {

		this.vertices	= [];
		this.triangles	= [];
		this.points		= [];
		this.bounds		= new lib.Rectangle(0, 0, 0, 0);

		this._tmpPoint0 = new lib.Point();
		this._tmpPoint1 = new lib.Point();
		this._tmpPoint2 = new lib.Point();
		this._tmpPoint3 = new lib.Point();
		this._tmpPoint4 = new lib.Point();
		this._tmpPoint5 = new lib.Point();
	};

	lib.BRFv4ExtendedFace.prototype.update = function(face) {

		var i, l;

		for(i = this.points.length, l = face.points.length + 6; i < l; ++i) {
			this.points[i] = new lib.Point(0.0, 0.0);
		}

		this.generateExtendedVertices(face);
		this.generateExtendedTriangles(face);
		this.updateBounds();
		this.updatePoints();
	};

	lib.BRFv4ExtendedFace.prototype.generateExtendedVertices = function(face) {

		var v = face.vertices;
		var i, l;

		this.vertices.length = 0;

		for(i = 0, l = v.length; i < l; i++) {
			this.vertices[i] = v[i];
		}

		this.addUpperForeheadPoints(this.vertices);
	};

	lib.BRFv4ExtendedFace.prototype.generateExtendedTriangles = function(face) {
		if(this.triangles.length === 0) {
			this.triangles = face.triangles.concat();
			this.triangles.push(
				0, 17, 68,
				17, 18, 68,
				18, 19, 69,
				18, 68, 69,
				19, 20, 69,
				20, 23, 71,
				20, 69, 70,
				20, 70, 71,
				23, 24, 72,
				23, 71, 72,
				24, 25, 72,
				25, 26, 73,
				25, 72, 73,
				16, 26, 73
			);
		}
	};

	lib.BRFv4ExtendedFace.prototype.updateBounds = function() {

		var minX = 0;
		var minY = 0;
		var maxX = 9999;
		var maxY = 9999;

		var i, l, value;

		for(i = 0, l = this.vertices.length; i < l; i++) {
			value = this.vertices[i];

			if((i % 2) === 0) {
				if(value < minX) minX = value;
				if(value > maxX) maxX = value;
			} else {
				if(value < minY) minY = value;
				if(value > maxY) maxY = value;
			}
		}

		this.bounds.x = minX;
		this.bounds.y = minY;
		this.bounds.width = maxX - minX;
		this.bounds.height = maxY - minY;
	};

	lib.BRFv4ExtendedFace.prototype.updatePoints = function() {

		var i, k, l, x, y;

		for(i = 0, k = 0, l = this.points.length; i < l; ++i) {
			x = this.vertices[k]; k++;
			y = this.vertices[k]; k++;

			this.points[i].x = x;
			this.points[i].y = y;
		}
	};

	lib.BRFv4ExtendedFace.prototype.addUpperForeheadPoints = function(v) {

		var p0 = this._tmpPoint0;
		var p1 = this._tmpPoint1;
		var p2 = this._tmpPoint2;
		var p3 = this._tmpPoint3;
		var p4 = this._tmpPoint4;
		var p5 = this._tmpPoint5;

		// base distance

		this.setPoint(v, 33, p0); // nose base
		this.setPoint(v, 27, p1); // nose top
		var baseDist = this.calcDistance(p0, p1) * 1.5;

		// eyes as base line for orthogonal vector

		this.setPoint(v, 39, p0); // left eye inner corner
		this.setPoint(v, 42, p1); // right eye inner corner

		var distEyes = this.calcDistance(p0, p1);

		this.calcMovementVectorOrthogonalCCW(p4, p0, p1, baseDist / distEyes);

		// orthogonal line for intersection point calculation

		this.setPoint(v, 27, p2); // nose top
		this.applyMovementVector(p3, p2, p4, 10.95);
		this.applyMovementVector(p2, p2, p4, -10.95);

		this.calcIntersectionPoint(p5, p2, p3, p0, p1);

		// simple head rotation

		var f = 0.5-this.calcDistance(p0, p5) / distEyes;

		// outer left forehead point

		this.setPoint(v, 0, p5); // top left outline point
		var dist = this.calcDistance(p0, p5) * 0.75;

		this.interpolatePoint(		p2, p0, p1, (dist / -distEyes));
		this.applyMovementVector(	p3, p2, p4, 0.75);
		this.addToExtendedVertices(	p3);

		// upper four forehead points

		this.interpolatePoint(		p2, p0, p1, f - 0.65);
		this.applyMovementVector(	p3, p2, p4, 1.02);
		this.addToExtendedVertices(	p3);

		this.interpolatePoint(		p2, p0, p1, f/* + 0.0*/);
		this.applyMovementVector(	p3, p2, p4, 1.10);
		this.addToExtendedVertices(	p3);

		this.interpolatePoint(		p2, p0, p1, f + 1.0);
		this.applyMovementVector(	p3, p2, p4, 1.10);
		this.addToExtendedVertices(	p3);

		this.interpolatePoint(		p2, p0, p1, f + 1.65);
		this.applyMovementVector(	p3, p2, p4, 1.02);
		this.addToExtendedVertices(	p3);

		// outer right forehead point

		this.setPoint(v, 16, p5); // top right outline point
		dist = this.calcDistance(p1, p5) * 0.75;

		this.interpolatePoint(		p2, p1, p0, (dist / -distEyes));
		this.applyMovementVector(	p3, p2, p4, 0.75);
		this.addToExtendedVertices(	p3);
	};

	lib.BRFv4ExtendedFace.prototype.addToExtendedVertices = function(p) {
		this.vertices.push(p.x);
		this.vertices.push(p.y);
	};

	lib.BRFv4ExtendedFace.prototype.setPoint 						= lib.BRFv4PointUtils.setPoint;
	lib.BRFv4ExtendedFace.prototype.applyMovementVector 			= lib.BRFv4PointUtils.applyMovementVector;
	lib.BRFv4ExtendedFace.prototype.interpolatePoint 				= lib.BRFv4PointUtils.interpolatePoint;
	lib.BRFv4ExtendedFace.prototype.calcMovementVector 				= lib.BRFv4PointUtils.calcMovementVector;
	lib.BRFv4ExtendedFace.prototype.calcMovementVectorOrthogonalCW 	= lib.BRFv4PointUtils.calcMovementVectorOrthogonalCW;
	lib.BRFv4ExtendedFace.prototype.calcMovementVectorOrthogonalCCW = lib.BRFv4PointUtils.calcMovementVectorOrthogonalCCW;
	lib.BRFv4ExtendedFace.prototype.calcIntersectionPoint 			= lib.BRFv4PointUtils.calcIntersectionPoint;
	lib.BRFv4ExtendedFace.prototype.calcDistance 					= lib.BRFv4PointUtils.calcDistance;

})(brfv4);