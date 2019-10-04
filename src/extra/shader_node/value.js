import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const ValueNode = class extends Node {
	constructor(type, name, x, y, compileLatency = -1) {
		super(type, name, x, y);
		switch(this.type){
			case "int":
			case "float":
			case "ivec2":
			case "vec2":
			case "ivec3":
			case "vec3":
			case "ivec4":
			case "vec4":
				break;
			default:
				this.type = "float";
				break;
		}
		this.outputFrameNodeParam = null;
		this.compileState = {
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: "",
			error: "",
			latency: compileLatency
		};
	}
	setup(){
		super.setup();
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam(this.type, "output"));
		this.compileState.code = '{';
		Object.keys(this.outputFrameNodeParam.value).forEach(key => {
			this.compileState.code += '\n\t"' + key + '": 0.0,';
		});
		this.compileState.code = this.compileState.code.slice(0, -1);
		this.compileState.code += '\n}';
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
			Object.keys(this.outputFrameNodeParam.value).forEach(key => {
				if (!p.hasOwnProperty(key)) throw new RangeError('"' + key + '" is not defined');
				if (typeof(p[key]) !== "number") throw new TypeError('"' + key + '" is not number');
			});
			Object.keys(this.outputFrameNodeParam.value).forEach(key => {
				this.outputFrameNodeParam.value[key] = p[key];
			});
		}
		catch(e){
			this.compileState.error = e.message;
			console.log(e.message);
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