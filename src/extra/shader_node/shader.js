import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const ShaderNode = class extends Node {
	constructor(name, x, y) {
		super("shader", name, x, y);
		this.shader = null;
		this.inputFrameNodeParam = null;
		this.outputFrameNodeParam = null;
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
		let result = this.shader.loadShader(this.shader.default_shader.vertex, fragmentShader);
		if (result !== "") return result;
		for(let i of this.inputs.childs) this.inputs.remove(i);
		Object.keys(this.shader.uniforms_type).forEach((key) => {
			if (key === "matrix") return;
			let type = this.shader.uniforms_type[key];
			if (type === "sampler2D") {
				this.inputs.add(new ValueNodeParam("frame", key));
			}
			else {
				this.inputs.add(new ValueNodeParam(type, key));
			}
		});
		return "";
	}
	job(){
		super.job();
		this.outputFrameNodeParam.value.shader = this.shader;
		for(let c of this.inputs.childs) {
			if(c.output === null) continue;
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
					this.shader.set(
						c.name,
						c.output.value.texture
					);
					break;
			}
		}
	}
};