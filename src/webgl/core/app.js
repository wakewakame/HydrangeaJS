import { EventListener } from "../utils/event_listener.js";

export const App = class {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
		this.width = this.canvas.width; this.height = this.canvas.height;
		this.current_frame = null;
		this.events = new EventListener();
		this.addEventListener = (name, func) => { this.events.addEventListener(name, func) };

		// enable float texture
		this.oes_texture_float = this.gl.getExtension('OES_texture_float');
		// clear canvas
		this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		// resize
		this.addEventListener("resize", (event) => {
			this.width = event.width; this.height = event.height;
			this.canvas.width = this.width; this.canvas.height = this.height;
			this.gl.viewport(0, 0, this.width, this.height);
		});
		// render
		this.addEventListener("render", (event) => {
			this.gl.finish();
		});
	}
	render() {
		this.events.trigger("render", {});
	}
	resize(width, height) {
		if ((typeof (width) !== "number") || (typeof (height) !== "number")) throw new TypeError();
		this.events.trigger("resize", { width: parseFloat(width), height: parseFloat(height) });
	}
};