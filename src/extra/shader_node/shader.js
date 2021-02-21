import { ConvertibleNode } from "../../gui/templates/convertible_node_component.js";
import { ValueNodeParam } from "./param.js";

export const ShaderNode = class extends ConvertibleNode {
	constructor(name = "", x = 0, y = 0, compileLatency = -1) {
		super();
		this.type = "shader";
		this.name = name;
		this.x = x;
		this.y = y;
		this.shader = null;
		this.inputFrameNodeParam = null;
		this.outputFrameNodeParam = null;
		this.json["custom"].compileState = {
			initialized: false,
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: `
precision highp float;
uniform sampler2D texture;
uniform ivec2 texture_resolution;
varying vec2 v_uv;

void main(void){
	vec2 area = vec2(
		float(texture_resolution.x) / exp2(ceil(log2(float(texture_resolution.x)))),
		float(texture_resolution.y) / exp2(ceil(log2(float(texture_resolution.y))))
	);
	vec2 p = v_uv;
	gl_FragColor = texture2D(texture, p);
}
			`,
			error: "",
			latency: compileLatency
		};
	}
	setup(){
		super.setup();
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam("shader", "output shader"));
		this.shader = this.graphics.createShader();
		this.shader.loadDefaultShader();
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
	deleted(){
		super.deleted();
		this.shader.delete();
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
			(this.json["custom"].compileState.initialized) && (
				(this.json["custom"].compileState.isCompiled) ||
				(Date.now() - this.json["custom"].compileState.lastChangeTime < this.json["custom"].compileState.latency)
			)
		) return;
		this.json["custom"].compileState.error = this.shader.loadShader(
			this.shader.default_shader.vertex, this.json["custom"].compileState.code
		);
		this.json["custom"].compileState.initialized = true;
		this.json["custom"].compileState.isCompiled = true;
		if (this.json["custom"].compileState.error !== "") {
			if (this.color !== {r: 1.0, g: 0.0, b: 0.2}) {
				this.color = {r: 1.0, g: 0.0, b: 0.2};
				this.redraw();
			}
			return;
		}
		if (this.color !== {r: 0.3, g: 0.3, b: 0.3}) {
			this.color = {r: 0.3, g: 0.3, b: 0.3};
			this.redraw();
		}
		const inputs_output = {};
		for(let p of this.inputs.childs.concat()) {
			inputs_output[p.name] = {type: p.type, output: p.output};
			this.inputs.remove(p);
		}
		Object.keys(this.shader.uniforms_type).forEach((key) => {
			if (key === "matrix") return;
			let type = this.shader.uniforms_type[key];
			if (type === "sampler2D") type = "frame";
			let param = this.inputs.add(new ValueNodeParam(type, key));
			if (param !== null && inputs_output.hasOwnProperty(key) && inputs_output[key].type === type) {
				param.output = inputs_output[key].output;
			}
		});
	}
	update(){
		super.update();
		this.setCode_();
	}
	job(){
		super.job();
		this.setCode_();
		this.outputFrameNodeParam.value.shader = this.shader;
		for(let c of this.inputs.childs) {
			if(c.output === null) {
				if (c.type === "frame") this.outputFrameNodeParam.value.shader = null;
				continue;
			}
			switch(c.type){
				case "int":
				case "float":
					this.shader.set(
						c.name,
						c.output.value.x
					);
					break;
				case "ivec2":
				case "vec2":
					this.shader.set(
						c.name,
						c.output.value.x,
						c.output.value.y
					);
					break;
				case "ivec3":
				case "vec3":
					this.shader.set(
						c.name,
						c.output.value.x,
						c.output.value.y,
						c.output.value.z
					);
					break;
				case "ivec4":
				case "vec4":
					this.shader.set(
						c.name,
						c.output.value.x,
						c.output.value.y,
						c.output.value.z,
						c.output.value.w
					);
					break;
				case "mat2":
				case "mat3":
				case "mat4":
					this.shader.set(
						c.name,
						c.output.value.mat
					);
					break;
				case "frame":
					if (c.output.value.frame === null && c.output.value.frame.texture === null) {
						this.outputFrameNodeParam.value.shader = null;
						continue;
					}
					this.shader.set(
						c.name,
						c.output.value.frame.texture
					);
					break;
			}
		}
		this.finishJob = false;
	}
	load(json) {
		super.load(json);
		this.json["custom"].compileState.initialized = false;
		this.setCode(this.json["custom"].compileState.code);
	}
};
