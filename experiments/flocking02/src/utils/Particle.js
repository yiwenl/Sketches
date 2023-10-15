import { vec2 } from "gl-matrix";
import { random } from ".";

export default class Particle {
  constructor(pos) {
    this.pos = pos;
    this.vel = [random(-1, 1), random(-1, 1)];
    vec2.normalize(this.vel, this.vel);
    this.speed = random(0.5, 2);
  }

  update() {
    const maxSpeed = 10;
    const speed = vec2.length(this.vel);
    if (speed > maxSpeed) {
      vec2.normalize(this.vel, this.vel);
      vec2.scale(this.vel, this.vel, maxSpeed);
    }

    const vel = vec2.scale([], this.vel, this.speed);
    vec2.add(this.pos, this.pos, vel);
    vec2.scale(this.vel, this.vel, 0.92);
  }

  distanceTo(p) {
    return vec2.distance(this.pos, p.pos);
  }

  applyForce(force) {
    this.vel[0] += force[0];
    this.vel[1] += force[1];
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

/*



// Separation
const separationForce = new Vector2D();
for (let j = 0; j < neighbors.length; j++) {
  const neighbor = neighbors[j];
  const distance = particle.position.distanceTo(neighbor.position);
  if (distance < separation) {
    const diff = particle.position.clone().subtract(neighbor.position);
    separationForce.add(diff.normalize().divide(distance));
  }
}

// Alignment
const alignmentForce = new Vector2D();
if (neighbors.length > 0) {
  const averageVelocity = neighbors.reduce((acc, p) => acc.add(p.velocity), new Vector2D()).divide(neighbors.length);
  alignmentForce.add(averageVelocity.normalize().multiply(alignment));
}

// Cohesion
const cohesionForce = new Vector2D();
if (neighbors.length > 0) {
  const averagePosition = neighbors.reduce((acc, p) => acc.add(p.position), new Vector2D()).divide(neighbors.length);
  const diff = averagePosition.clone().subtract(particle.position);
  cohesionForce.add(diff.normalize().multiply(cohesion));
}

// Apply forces
particle.applyForce(separationForce);
particle.applyForce(alignmentForce);
particle.applyForce(cohesionForce);


    */
