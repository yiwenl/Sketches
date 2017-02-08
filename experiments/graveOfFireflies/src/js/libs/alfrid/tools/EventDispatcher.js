// EventDispatcher.js

let supportsCustomEvents = true;
try {
	let newTestCustomEvent = document.createEvent('CustomEvent');
	newTestCustomEvent = null;
} catch(e) {
	supportsCustomEvents = false;
}

class EventDispatcher {

	constructor() {
		this._eventListeners = {};
	}


	addEventListener(aEventType, aFunction) {

		if(this._eventListeners === null || this._eventListeners === undefined) {
			this._eventListeners = {};
		}

		if(!this._eventListeners[aEventType]) {
			this._eventListeners[aEventType] = [];
		}
		this._eventListeners[aEventType].push(aFunction);
		
		return this;

	}

	on(aEventType, aFunction) {	return this.addEventListener(aEventType, aFunction);	}

	removeEventListener(aEventType, aFunction) {
		if(this._eventListeners === null || this._eventListeners === undefined) {
			this._eventListeners = {};
		}
		const currentArray = this._eventListeners[aEventType];
		
		if (typeof(currentArray) === 'undefined') {
			return this;
		}
		
		let currentArrayLength = currentArray.length;
		for(let i = 0; i < currentArrayLength; i++) {
			if(currentArray[i] === aFunction) {
				currentArray.splice(i, 1);
				i--;
				currentArrayLength--;
			}
		}
		return this;
	}

	off(aEventType, aFunction) {	return this.removeEventListener(aEventType, aFunction);	}

	dispatchEvent(aEvent) {
		if(this._eventListeners === null || this._eventListeners === undefined) {
			this._eventListeners = {};
		}
		const eventType = aEvent.type;
		
		try {
			if(aEvent.target === null) {
				aEvent.target = this;
			}
			aEvent.currentTarget = this;
		} catch(theError) {
			const newEvent = { type: eventType, detail: aEvent.detail, dispatcher: this };
			return this.dispatchEvent(newEvent);
		}
		
		const currentEventListeners = this._eventListeners[eventType];
		if(currentEventListeners !== null && currentEventListeners !== undefined) {
			const currentArray = this._copyArray(currentEventListeners);
			const currentArrayLength = currentArray.length;
			for(let i = 0; i < currentArrayLength; i++) {
				const currentFunction = currentArray[i];
				currentFunction.call(this, aEvent);
			}
		}
		return this;
	}

	dispatchCustomEvent(aEventType, aDetail) {
		let newEvent;
		if (supportsCustomEvents) {
			newEvent = document.createEvent('CustomEvent');
			newEvent.dispatcher = this;
			newEvent.initCustomEvent(aEventType, false, false, aDetail);
		} else {
			newEvent = { type: aEventType, detail: aDetail, dispatcher: this };
		}
		return this.dispatchEvent(newEvent);
	}

	trigger(aEventType, aDetail) {	return this.dispatchCustomEvent(aEventType, aDetail);	}

	_destroy() {
		if(this._eventListeners !== null) {
			for(const objectName in this._eventListeners) {
				if(this._eventListeners.hasOwnProperty(objectName)) {
					const currentArray = this._eventListeners[objectName];
					const currentArrayLength = currentArray.length;
					for(let i = 0; i < currentArrayLength; i++) {
						currentArray[i] = null;
					}
					delete this._eventListeners[objectName];	
				}
			}
			this._eventListeners = null;
		}
	}

	_copyArray(aArray) {
		const currentArray = new Array(aArray.length);
		const currentArrayLength = currentArray.length;
		for(let i = 0; i < currentArrayLength; i++) {
			currentArray[i] = aArray[i];
		}
		return currentArray;
	}
}


export default EventDispatcher;