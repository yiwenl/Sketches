// index.js

const path = require('path');
const fs = require('fs-extra');


const SOURCES = [
	"pacific.csv",
	"atlantic.csv"
];

const output = path.resolve('./src/js/typhoons.json');

console.log('Load files', SOURCES);
console.log(output);
let typhoons = [];

const removeStringEnd = str => str.replace('\r', '');
const reformDate = str => {
	const year = parseInt(str.substring(0, 4));
	const month = parseInt(str.substring(4, 6));
	const day = parseInt(str.substring(6));

	return new Date(year, month-1, day-1);
}

const loadFile = (mPath) => new Promise((resolve, reject) => {
	const _path = path.resolve('./data', mPath);
	fs.readFile(_path, (err, data) => {
		if(err) {
			reject(err);
		}
		resolve(data.toString());
	});
});

const formData = (mDataStr) => new Promise((resolve, reject) => {
	const dataRows = mDataStr.split('\n');

	const fieldsStr = dataRows.shift();
	let fields = fieldsStr.split(',');
	fields = fields.map( removeStringEnd );

	const data = dataRows.map( (dataStr, i) => {
		let ary = dataStr.split(',');
		ary = ary.map( removeStringEnd );

		const o = {};
		for(let i=0; i<fields.length; i++) {
			o[fields[i]] = ary[i];
		}

		// if( i === 0) { console.log(o); }

		return o;
	});

	resolve(data);
});


const parseDate = ( mData ) => new Promise((resolve, reject) => {
	const reg = /\s/gi;

	mData.forEach( (oData, i) => {

		oData.DateStr = oData.Date;
		oData.Date = reformDate(oData.Date);
		oData.Name = oData.Name.replace(reg, '');

		if(i === 0) {
			console.log(oData.Date, oData.DateStr);
		}
	});

	resolve(mData);
});

const parseTyphoon = ( mData ) => new Promise((resolve, reject) => {
	
	const findById = (mId) => {
		let results = typhoons.filter( typhoon => typhoon.id === mId);
		return results[0];
	}
	
	mData.forEach( (oData, i) => {
		let typhoon = findById(oData.ID);
		if(!typhoon) {
			typhoon = {
				id:oData.ID,
				name:oData.Name,
				date:oData.Date,
				data:[oData]
			}

			typhoons.push(typhoon);
		} else {
			if(oData.Name !== typhoon.name) {
				console.log('Conflict', oData.Name, typhoon.name);
			}
			typhoon.data.push(oData);
		}
	});

	console.log('Number of typhoons :', typhoons.length);

	resolve(typhoons);
});

const dataFilter = (mData) => new Promise((resolve, reject) => {

	const data = mData.filter( oData => oData.Name.indexOf('UNNAMED') === -1);
	console.log(data.length, '/', mData.length);

	resolve(data);
});


const promises = [Promise.resolve(SOURCES[0]), loadFile, formData, dataFilter, parseTyphoon];



let sequence = Promise.resolve();
let count = 0;

SOURCES.forEach( source => {
	sequence = sequence.then(()=> {
		return loadFile(source)
		.then( formData )
		.then( dataFilter )
		.then( parseDate )
		.then( parseTyphoon )
		.then( () => {
			console.log('Done', source);
			count ++;
			if(count == 2) {
				console.log('All done');
				typhoons.length = Math.min(1000, typhoons.length);
				const json = JSON.stringify(typhoons, null, 4);
				fs.writeFile(output, json, 'utf8', ()=> {
					console.log('Json created :', output);
				});
			}
		})
		.catch( err => {
			console.log('Error ', err);
		});
	});
})	
