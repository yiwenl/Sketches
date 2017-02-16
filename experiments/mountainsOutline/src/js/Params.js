// Params.js
import alfrid from 'alfrid';

const Params = {
	gamma:2.2,
	exposure:5,
	showFarMountains:true,
	fogOffset:0.01,
	fogDensity:0.03,
	prevFogColor:[254.0, 242.0, 226.0],
	fogColor:[254.0, 242.0, 226.0],
	shaderFogColor:[1, 1, 1],
	postEffect:false,
	terrainSize:45,
	numClouds:10,
	numMountains:100,
	numRainDrops:50,
	numCubes:1500,
	hasPaused:false,
	numSets:5,
	numParticles:200,
	skipCount: 5,
	maxRadius: 12,
	lifeDecrease:0.0075,
	rotationSpeed:0.0015,
	respwanRadius:1.5,
	outlineWidth:0.04,
	outlineNoise:1.0,
	outlineNoiseStrength:0.5,
	speedOffset:new alfrid.TweenNumber(1, 'expInOut'),
	layers: {
		farMountains:true,
		screenDust:false,
		filmGrain:true,
		giant:false,
		bigMountain:true
	},
	giantRender: {
		renderState:'showAll'
	},
	videos: {
		useVideo0:false,
		useVideo1:false,
		useVideo2:false,
		useVideo3:false
	}
}


export default Params;