import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const FloatNode = class extends Node {
	constructor(name, x, y, compileLatency = -1) {
		super("float", name, x, y);
		this.outputFrameNodeParam = null;
		this.compileState = {
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: '{"x": 0.0}',
			error: "",
			latency: compileLatency
		};
	}
	setup(){
		super.setup();
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam("float", "output"));
		this.setCode_();
	}
	setCode(code){
		this.compileState = {
			initialized: this.compileState.initialized,
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: code,
			error: this.compileState.error,
			latency: this.compileState.latency
		};
		this.setCode_();
	}
	setCode_(){
		if (
			(this.compileState.isCompiled) ||
			(Date.now() - this.compileState.lastChangeTime < this.compileState.latency)
		) return;
		this.compileState.error = "";
		try{
			const p = JSON.parse(this.compileState.code);
			if (!p.hasOwnProperty("x")) throw new RangeError('"x" is not defined');
			this.outputFrameNodeParam.value.x = p["x"];
		}
		catch(e){
			this.compileState.error = e.message;
		}
		
		this.compileState.isCompiled = true;
		if (this.compileState.error !== "") {
			if (this.color !== {r: 1.0, g: 0.0, b: 0.2}) {
				this.color = {r: 1.0, g: 0.0, b: 0.2};
				this.resize(this.w, this.h);
			}
			return;
		}
		if (this.color !== {r: 0.3, g: 0.3, b: 0.3}) {
			this.color = {r: 0.3, g: 0.3, b: 0.3};
			this.resize(this.w, this.h);
		}
	}
	update(){
		super.update();
		this.setCode_();
	}
};