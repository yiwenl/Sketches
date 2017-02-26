// State.js

import alfrid from 'alfrid';

class State extends alfrid.EventDispatcher {
	constructor(mInitState = {}) {
		super();

		this._state = {...mInitState};
		console.log('Init State :', this._state);
	}


	setState(mNewState) {
		function isObject(mObj) {	return (typeof mObj === 'object');	}

		const checkState = (newState, oldState) => {
			let hasChanged = false;
			let changed = {};
			let added = {};

			for (let s in newState) {
				if(newState[s] !== undefined) {
					if(oldState[s] === undefined) {	//	Add new attributes
						hasChanged = true;
						added[s] = newState[s];
						changed[s] = newState[s];
						oldState[s] = newState[s];
					} else {	//	Modify old attributes

						if(isObject(newState[s])) { //	attribute is an object, need to go deeper
							const o = checkState(newState[s], oldState[s]);
							hasChanged = hasChanged || o.hasChanged;
							added = Object.assign(added, o.added);
							changed = Object.assign(changed, o.changed);
						} else {
							if(newState[s] !== oldState[s]) {//	attributes has changed
								hasChanged = true;
								changed[s] = newState[s];
								oldState[s] = newState[s];
							}	
						}
					}
				}
			}

			return {
				hasChanged,
				changed,
				added
			};
		}

		const o = checkState(mNewState, this._state);

		if(o.hasChanged) {
			this.trigger('changed', o);
		}
	}


	getState() {
		return this._state;
	}
}


export default State;