// import "./hash.js";
import { rgb, random, getMonoColor } from "./utils/index.js";
import { targetWidth, targetHeight } from "./features.js";
import setupProject from "./utils/setupProject2D.js";

import Settings from "./Settings.js";
import addControls from "./utils/addControl.js";

import Scheduler from "scheduling";
import Particle from "./utils/Particle.js";
import { vec2 } from "gl-matrix";

// development
if (process.env.NODE_ENV === "development") {
  Settings.init();
  addControls();
}
const { ctx, width, height } = setupProject(targetWidth, targetHeight);

let paused = true;

// init particles
let numParticles = 500;
const particles = [];
for (let i = 0; i < numParticles; i++) {
  const p = new Particle([random(width), random(height)]);
  particles.push(p);
}

const drawParticles = () => {
  particles.forEach((p) => p.draw(ctx));
};

// flocking settings
const radius = 300;
const separationThreshold = 0.3;
const cohesionThreshold = 0.7;

const drawRadius = () => {
  ctx.strokeStyle = rgb(70);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.pos[0], p.pos[1], radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = rgb(200, 0, 0);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.pos[0], p.pos[1], radius * separationThreshold, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = rgb(200, 200, 0);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.pos[0], p.pos[1], radius * cohesionThreshold, 0, Math.PI * 2);
    ctx.stroke();
  });
};

const updateParticles = () => {
  const separation = radius * separationThreshold;
  // const cohesion = radius * cohesionThreshold;
  const cohesion = 1;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const neighbors = particles.filter(
      (p) => p !== particle && p.distanceTo(particle) < radius
    );

    // Separation
    const separationForce = [0, 0];
    for (let j = 0; j < neighbors.length; j++) {
      const neighbor = neighbors[j];
      const distance = particle.distanceTo(neighbor);
      if (distance < separation) {
        const diff = [];
        vec2.sub(diff, particle.pos, neighbor.pos);
        vec2.normalize(diff, diff);
        vec2.scale(diff, diff, (1 / distance) * 150);
        vec2.add(separationForce, separationForce, diff);
      }
    }

    // Alignment
    const alignmentForce = [0, 0];
    if (neighbors.length > 0) {
      const averageVelocity = neighbors.reduce(
        (acc, p) => vec2.add(acc, acc, p.vel),
        [0, 0]
      );
      vec2.scale(averageVelocity, averageVelocity, 1 / neighbors.length);
      vec2.normalize(averageVelocity, averageVelocity);
      vec2.scale(averageVelocity, averageVelocity, cohesion);
      vec2.add(alignmentForce, alignmentForce, averageVelocity);
    }

    // Cohesion
    const cohesionForce = [0, 0];
    if (neighbors.length > 0) {
      const averagePosition = neighbors.reduce(
        (acc, p) => vec2.add(acc, acc, p.pos),
        [0, 0]
      );
      vec2.scale(averagePosition, averagePosition, 1 / neighbors.length);
      const diff = [];
      vec2.sub(diff, averagePosition, particle.pos);
      vec2.normalize(diff, diff);
      vec2.scale(diff, diff, cohesion);
      vec2.add(cohesionForce, cohesionForce, diff);
    }

    // boundaries
    const center = [width / 2, height / 2];
    const maxRadius = vec2.length(center) * 0.5;
    // Boundaries
    const distanceToCenter = vec2.distance(center, particle.pos);
    if (distanceToCenter > maxRadius) {
      const diff = [];
      vec2.sub(diff, center, particle.pos);
      vec2.normalize(diff, diff);
      vec2.scale(diff, diff, (distanceToCenter - maxRadius) / distanceToCenter);
      const boundaryForce = diff;
      particle.applyForce(boundaryForce);
    }

    particle.applyForce(separationForce);
    particle.applyForce(alignmentForce);
    particle.applyForce(cohesionForce);

    particle.update();
  }
};

const loop = (mForce = false) => {
  if (paused && !mForce) return;

  // clear
  ctx.fillStyle = rgb(...getMonoColor(30));
  ctx.fillRect(0, 0, width, height);

  // update
  updateParticles();

  // render particles
  ctx.fillStyle = rgb(...getMonoColor(255));
  drawParticles();
  // drawRadius();
};

Scheduler.addEF(loop);
paused = false;

window.addEventListener("keydown", (e) => {
  console.log(e.code);
  if (e.code === "KeyP") {
    paused = !paused;
  } else if (e.code === "Space") {
    loop(true);
  }
});
