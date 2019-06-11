// CityGenerator.js

var random = function(min, max) { return min + Math.random() * (max - min);	}

const randomFloor = (min, max) => {
	return Math.floor(random(min, max));
}


const hitTest = (ctx, rect) => {
	let hit = false;

	const imageData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
	const { data } = imageData;

	let r
	for(let i=0; i<data.length; i+= 4) {
		r = data[i];

		if(r > 0) {
			hit = true;
			return hit;
		}
	}

	return hit;
}

const mix = (a, b, p) => {
	return a * (1.0 - p) + b * p;
}

class CityGenerator {
	constructor() {
		const Config = {
			numColumns: randomFloor(10, 15),
			numRows: randomFloor(10, 15)
		};

		const size = 2048;
		const dimensions = [size, size];

		this.canvas = document.createElement("canvas");
		this.canvas.width = size;
		this.canvas.height = size;

		this.buildings = [];

		const s = 500;
		// document.body.appendChild(this.canvas);
		this.canvas.style.position = 'fixed';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.canvas.style.width = `${s}px`;
		this.canvas.style.height = `${s}px`;


		let ctx = this.canvas.getContext('2d');
		ctx.fillStyle = 'rgba(0, 0, 0, 255)';
		ctx.fillRect(0, 0, size, size);


		const createRoads = (numRoads) => {
			let roads = [];
			let i = numRoads
			let tmp = 0;
			let sum = 0;

			while(i -- ) {
				let t = random(.25, 2);
				roads.push(t)
				sum += t;
			}

			roads = roads.map( v => {
				let tt = v / sum;
				tmp += tt;

				const width = random(10, 30);

				return {
					pos:Math.floor(tmp * dimensions[0]),
					width
				};
			});

			return roads;
		}


		let columns = createRoads(Config.numColumns);
		let rows = createRoads(Config.numRows);


		const drawRoads = () => {
			columns.forEach( road => {
				ctx.fillStyle = 'rgba(255, 255, 255, 1)';
				ctx.fillRect(road.pos, 0, road.width, dimensions[1]);
			});

			rows.forEach( road => {
				ctx.fillStyle = 'rgba(255, 255, 255, 1)';
				ctx.fillRect(0, road.pos, dimensions[1], road.width);
			});
		}

		drawRoads();


		const drawRect = (rect) => {
			const color = `rgb(255, 0, 0, .5)`;
			// const color = getRandomColor();

			ctx.fillStyle = color;
			// ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		}

		const createRect = () => {
			const width = randomFloor(20, 10);
			const height = randomFloor(20, 10);
			const x = randomFloor(0, dimensions[0] - width);
			const y = randomFloor(0, dimensions[1] - height);

			return {x, y, width, height};
		}


		const r = .5;
		const rotation = random(-r, r);

		const buildings = [];
		let failCount = 0;
		const maxSize = 40;
		while(failCount < 2000) {
			const rect = createRect();
			const hit = hitTest(ctx, rect);


			if(!hit) {
				failCount = 0;
				let numTries = 0;
				let xGrow = Math.random();
				let yGrow = Math.random();

				do {
					rect.x -= xGrow;
					rect.y -= yGrow;
					rect.width += xGrow;
					rect.height += yGrow;
					numTries++;
				} while( !hitTest(ctx, rect) && numTries < 100 && rect.width < maxSize && rect.height < maxSize);


				if(numTries > 0) {
					rect.x += 0.5 * xGrow;
					rect.y += 0.5 * yGrow;
					rect.width -= 0.5 * xGrow;
					rect.height -= 0.5 * yGrow;
				}

				ctx.fillStyle = 'white';
				ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
				buildings.push(rect);
			} else {
				failCount ++;
			}
		}

		const getHeight = (x, y) => {
			let tx = x / size;
			let ty = y / size;

			
			tx = Math.sin(tx * Math.PI);
			ty = Math.sin(ty * Math.PI);

			let tmp = tx * ty;
			tmp = Math.pow(tmp, 50.0);

			tmp = mix(tmp, 1.0, .1);

			const ttmp = mix(tmp, 1.0, .25);
			const maxHeight = 0.3;

			if(Math.random() < .95) {
				return random(.5, 1) * maxHeight * tmp; 
			} else {
				return random(.25, .75) * maxHeight * ttmp;
			}

		}

		const scale = 8;
		this.buildings = buildings.map( rect => {
			const {x, y, width, height} = rect;
			let tx = x + width/2;
			let ty = y + height/2;
			let h = getHeight(tx, ty) * scale;
			return {
				x:(tx/size - 0.5) * scale,
				y:(ty/size - 0.5) * scale,
				width:width/size * scale,
				height:height/size * scale,
				h
			}
		});

		// buildings.forEach( b => drawRect(b) );
	}
}


export default CityGenerator;