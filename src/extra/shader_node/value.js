import { ConvertibleNode } from "../../gui/templates/convertible_node_component.js";
import { ValueNodeParam } from "./param.js";

export const ValueNode = class extends ConvertibleNode {
	constructor(type = 0, name = 0, x = 0, y = 0, compileLatency = -1) {
		super();
		this.type = type;
		this.name = name;
		this.x = x;
		this.y = y;
		this.outputFrameNodeParam = null;
		this.json["custom"].compileState = {
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: "",
			error: "",
			latency: compileLatency
		};
	}
	setup(){
		super.setup();
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
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam(this.type, "output"));
		if (this.json["custom"].compileState.code !== ""){
			this.json["custom"].compileState.code = '{';
			Object.keys(this.outputFrameNodeParam.value).forEach(key => {
				this.json["custom"].compileState.code += '\n\t"' + key + '": 0.0,';
			});
			this.json["custom"].compileState.code = this.json["custom"].compileState.code.slice(0, -1);
			this.json["custom"].compileState.code += '\n}';
		}
		this.json["custom"].compileState = {
			initialized: false,
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: this.json["custom"].compileState.code,
			error: "",
			latency: this.json["custom"].compileState.latency
		};
		this.setCode_();
	}
	setCode(code){
		this.json["custom"].compileState = {
			initialized: this.json["custom"].compileState.initialized,
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: code,
			error: this.json["custom"].compileState.error,
			latency: this.json["custom"].compileState.latency
		};
		this.setCode_();
	}
	setCode_(){
		if (
			(this.json["custom"].compileState.isCompiled) ||
			(Date.now() - this.json["custom"].compileState.lastChangeTime < this.json["custom"].compileState.latency)
		) return;
		this.json["custom"].compileState.error = "";
		try{
			const p = JSON.parse(this.json["custom"].compileState.code);
			Object.keys(this.outputFrameNodeParam.value).forEach(key => {
				if (!p.hasOwnProperty(key)) throw new RangeError('"' + key + '" is not defined');
				if (typeof(p[key]) !== "number") throw new TypeError('"' + key + '" is not number');
			});
			Object.keys(this.outputFrameNodeParam.value).forEach(key => {
				this.outputFrameNodeParam.value[key] = p[key];
			});
		}
		catch(e){
			this.json["custom"].compileState.error = e.message;
			console.log(e.message);
		}
		
		this.json["custom"].compileState.isCompiled = true;
		if (this.json["custom"].compileState.error !== "") {
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