// distance.js

const fields = ['x', 'y', 'z'];

export default function(a, b) {
	let dist;
	let sum = 0;

	if(a instanceof Array || a instanceof Float32Array) {
		for(let i=0; i<a.length; i++) {
			sum += (b[i] - a[i]) * (b[i] - a[i]);
		} 
	} else {
		fields.forEach( f => {
			if(a[f] !== undefined) {
				sum += (b[f] - a[f]) * (b[f] - a[f]);
			}
		});
	}

	sum = Math.sqrt(sum);

	return sum;
}