export const EventListener = class {
	constructor() {
		this.events = {};
	}
	addEventListener(name, func) {
		// check the type of name is string
		if (typeof (name) !== "string") return;
		// check the type of func is function
		if (typeof (func) !== "function") return;
		// check the name is registered
		if (!this.events.hasOwnProperty(name)) this.events[name] = [];
		// add event listener
		this.events[name].push(func);
	}
	trigger(name, arg) {
		// check the type of name is string
		if (typeof (name) !== "string") return;
		// check the name is registered
		if (!this.events.hasOwnProperty(name)) return;
		// process all events
		for (let f of this.events[name]) {
			f(arg);
		}
	}
	resetEvent(name) {
		// check the type of name is string
		if (typeof (name) !== "string") return;
		// check the name is registered
		if (!this.events.hasOwnProperty(name)) return;
		// reset event listener
		this.events[name] = [];
	}
};