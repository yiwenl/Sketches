import { vec3 } from "gl-matrix";

function Ray(mOrigin, mDirection) {
  this.origin = mOrigin;
  this.direction = mDirection;

  // private properties
  const a = vec3.create();
  const b = vec3.create();
  const c = vec3.create();
  const target = vec3.create();
  const edge1 = vec3.create();
  const edge2 = vec3.create();
  const normal = vec3.create();
  const diff = vec3.create();

  this.at = function(t) {
    vec3.copy(target, this.direction);
    vec3.scale(target, target, t);
    vec3.add(target, target, this.origin);

    return target;
  };

  this.lookAt = function(mTarget) {
    vec3.sub(this.direction, mTarget, this.origin);
    vec3.normalize(this.origin, this.origin);
  };

  this.closestPointToPoint = function(mPoint) {
    const result = vec3.create();
    vec3.sub(mPoint, this.origin);
    const directionDistance = vec3.dot(result, this.direction);

    if (directionDistance < 0) {
      return vec3.clone(this.origin);
    }

    vec3.copy(result, this.direction);
    vec3.scale(result, result, directionDistance);
    vec3.add(result, result, this.origin);

    return result;
  };

  this.distanceToPoint = function(mPoint) {
    return Math.sqrt(this.distanceSqToPoint(mPoint));
  };

  this.distanceSqToPoint = function(mPoint) {
    const v1 = vec3.create();

    vec3.sub(v1, mPoint, this.origin);
    const directionDistance = vec3.dot(v1, this.direction);

    if (directionDistance < 0) {
      return vec3.squaredDistance(this.origin, mPoint);
    }

    vec3.copy(v1, this.direction);
    vec3.scale(v1, v1, directionDistance);
    vec3.add(v1, v1, this.origin);
    return vec3.squaredDistance(v1, mPoint);
  };

  this.intersectsSphere = function(mCenter, mRadius) {
    return this.distanceToPoint(mCenter) <= mRadius;
  };

  this.intersectSphere = function(mCenter, mRadius) {
    const v1 = vec3.create();
    vec3.sub(v1, mCenter, this.origin);
    const tca = vec3.dot(v1, this.direction);
    const d2 = vec3.dot(v1, v1) - tca * tca;
    const radius2 = mRadius * mRadius;

    if (d2 > radius2) return null;

    const thc = Math.sqrt(radius2 - d2);

    const t0 = tca - thc;

    const t1 = tca + thc;

    if (t0 < 0 && t1 < 0) return null;

    if (t0 < 0) return this.at(t1);

    return this.at(t0);
  };

  this.intersectTriangle = function(mPA, mPB, mPC, backfaceCulling = true) {
    vec3.copy(a, mPA);
    vec3.copy(b, mPB);
    vec3.copy(c, mPC);

    vec3.sub(edge1, b, a);
    vec3.sub(edge2, c, a);
    vec3.cross(normal, edge1, edge2);

    let DdN = vec3.dot(this.direction, normal);
    let sign;

    if (DdN > 0) {
      if (backfaceCulling) {
        return null;
      }
      sign = 1;
    } else if (DdN < 0) {
      sign = -1;
      DdN = -DdN;
    } else {
      return null;
    }

    vec3.sub(diff, this.origin, a);

    vec3.cross(edge2, diff, edge2);
    const DdQxE2 = sign * vec3.dot(this.direction, edge2);
    if (DdQxE2 < 0) {
      return null;
    }

    vec3.cross(edge1, edge1, diff);
    const DdE1xQ = sign * vec3.dot(this.direction, edge1);
    if (DdE1xQ < 0) {
      return null;
    }

    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    const Qdn = -sign * vec3.dot(diff, normal);
    if (Qdn < 0) {
      return null;
    }

    return this.at(Qdn / DdN);
  };
}

export { Ray };
