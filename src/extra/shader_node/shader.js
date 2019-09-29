import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const ShaderNode = class extends Node {
	constructor(name, x, y) {
		super("shader", name, x, y);
		this.shader = null;
		this.inputFrameNodeParam = null;
		this.outputFrameNodeParam = null;
		this.fragmentShader = "";
	}
	setup(){
		super.setup();
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam("shader", "output"));
		this.shader = this.graphics.createShader();
		this.shader.loadDefaultShader();
	}
	deleted(){
		super.deleted();
		this.shader.delete();
	}
	loadShader(fragmentShader){
		this.fragmentShader = fragmentShader;
		let result = this.shader.loadShader(this.shader.default_shader.vertex, this.fragmentShader);
		if (result !== "") return result;
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
		return "";
	}
	job(){
		super.job();
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
					if (c.output.value.texture === null) {
						this.outputFrameNodeParam.value.shader = null;
						continue;
					}
					this.shader.set(
						c.name,
						c.output.value.texture
					);
					break;
			}
		}
	}
};