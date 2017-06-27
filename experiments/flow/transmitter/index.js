// index.js
'use strict';
const PORT_SOCKET = 9876;
let app    = require('express')();
let server = app.listen(PORT_SOCKET);
let io     = require('socket.io')(server);

const glm = require('gl-matrix');

const scale = 100;

var random = function(min, max) { return min + Math.random() * (max - min);	}

const {vec3, mat4} = glm;


//	OSC EMITTER

const PORT_EMIT_OSC = 8927;
const OscEmitter = require("osc-emitter");

let emitter = new OscEmitter();
emitter.add('localhost', PORT_EMIT_OSC);


//	WEB SOCKETS

io.on('connection', (socket)=>_onConnected(socket));

function _onConnected(socket) {
	console.log('A user is connected : ', socket.id);

	socket.on('disconnect', ()=>_onDisconnected() );
	socket.on('frame', (frame)=>_onFrame(frame));
	socket.on('position', (positions)=>_onPosition(positions));
	socket.on('sphere', (position)=>_onSphere(position));
}


function _onDisconnected() {
	console.log('User disconnected');
}


let _frame = 0;



function _onFrame(frame) {
	console.log('Frame Change : ', frame);
	emitter.emit('/frame', frame);
	emitter.emit('/update');
}


function _onSphere(position) {
	// console.log('Sphere : ', getPrec(position[0] * scale), getPrec(position[1] * scale), getPrec(position[2] * scale));
	emitter.emit('/sphere', getPrec(position[0] * scale), getPrec(position[1] * scale), getPrec(position[2] * scale));
}

function _onPosition(positions) {
	
	const newPos = positions.map( a => getPrec(a*scale));
	const strPosition = getArrayString(newPos);

	emitter.emit('/positions', strPosition);
	console.log('position Sent');
}



const getPrec = (num) => {
	const prec = 100;
	const _num = Math.floor(num * prec) / prec;
	return _num;
}


const getArrayString = (ary) => {
	let str = ary.toString();
	str = str.replace('[', '')
	str = str.replace(']', '')
	str = str.replace(/\,/g, ' ')

	return str;
}

function testPosition() {
	let positions = [];

	const num = Math.pow(10, 2);

	const r = 200;

	for(let i=0; i<num; i++) {
		positions.push(random(-r, r));
		positions.push(random(-r, r));
		positions.push(random(-r, r));
	}

	positions = positions.map( n => getPrec(n) );
	const strPosition = getArrayString(positions);

	emitter.emit('/positions', strPosition);
}


// testPosition();


/*
//	OSC RECEIVER

const PORT_OSC = 7110;
const OscReceiver = require("osc-receiver");

let receiver = new OscReceiver();
receiver.bind(PORT_OSC);


//	OSC MESSAGES HANDLING

receiver.on('/cameraPos', function(x, y, z) {
	console.log('Camera Position : ', x, y, z);
	io.emit('cameraPosition', {x:-x, y:y, z:z})
});

receiver.on('/lightPos', function(x, y, z) {
	console.log('Light Position : ', x, y, z);
	io.emit('lightPosition', {x:-x, y:y, z:z})
});

*/

