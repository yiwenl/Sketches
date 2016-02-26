// AudioPlayer.js

let sono = require('./libs/sono/sono');
const NOTES = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

class AudioPlayer {
	constructor() {
		this._isReady = false;
		this._loadAudios();
		this._soundIndex = 0;
		sono.volume = .5;

	}

	_loadAudios() {
		
		this._sounds = [];
		for(let i=0 ;i<NOTES.length; i++) {
			let path = ['assets/audio/'+NOTES[i] + '_0.ogg', 'assets/audio/'+NOTES[i] + '_0.mp3'];

			let s = sono.createSound({
				id:'sound'+i,
				src:path,
				loop:false
			})

			this._sounds.push(s);
		}
	}


	playNextNote() {
		this._sounds[this._soundIndex].play();

		let inc = Math.random() > .5 ? 1 : 2;
		this._soundIndex+= inc;

		if(this._soundIndex >= NOTES.length) this._soundIndex = 0;
	}
}


export default AudioPlayer;