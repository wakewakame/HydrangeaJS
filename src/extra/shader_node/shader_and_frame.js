import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const ShaderAndFrameNode = class extends Node {
	constructor(name, x, y, compileLatency = -1) {
		super("shader", name, x, y);
		this.shader = null;
		this.previewShader = null;
		this.frameBuffer = null;
		this.outputFrameNodeParam = null;
		this.default_code = `
{
	"width": 512,
	"height": 512,
	"type": "UNSIGNED_BYTE",
	"code": \`
		precision highp float;
		uniform ivec2 output_resolution;
		uniform sampler2D texture;
		uniform ivec2 texture_resolution;
		varying vec2 vUv;

		void main(void){
			vec2 area = vec2(
				float(texture_resolution.x) / exp2(ceil(log2(float(texture_resolution.x)))),
				float(texture_resolution.y) / exp2(ceil(log2(float(texture_resolution.y))))
			);
			vec2 p = vUv;
			gl_FragColor = texture2D(texture, p);
		}
	\`,
	"preview": \`
		precision highp float;
		uniform sampler2D texture;
		uniform vec2 textureArea;
		varying vec2 vUv;
		varying vec4 vColor;

		void main(void){
			gl_FragColor = texture2D(texture, vUv * textureArea);
		}
	\`
}
	
		`;
		this.frameBufferState = {
			width: 1,
			height: 1,
			type: null,
		};
		this.compileState = {
			initialized: false,
			lastChangeTime: Date.now(),
			isCompiled: false,
			code: this.default_code,
			error: "",
			latency: compileLatency
		};
	}
	setup(){
		super.setup();
		this.outputFrameNodeParam = this.outputs.add(new ValueNodeParam("frame", "output"));
		this.shader = this.graphics.createShader();
		this.shader.loadDefaultShader();
		this.previewShader = this.graphics.createShader();
		this.previewShader.loadDefaultShader();
		this.frameBuffer = this.graphics.createFrame(
			this.frameBufferState.width,
			this.frameBufferState.height,
			null,
			this.frameBufferState.type
		);
		this.resize(this.w, this.w * this.frameBuffer.height / this.frameBuffer.width);
	}
	deleted(){
		super.deleted();
		this.shader.delete();
		this.previewShader.delete();
		this.frameBuffer.delete();
	}
	resizeFrame(width, height, type = null){
		this.frameBuffer.resize(
			width,
			height,
			null,
			type
		);
		this.frameBufferState = {
			width: this.frameBuffer.width,
			height: this.frameBuffer.height,
			type: this.frameBuffer.texture.type,
		};
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
			(this.compileState.initialized) && (
				(this.compileState.isCompiled) ||
				(Date.now() - this.compileState.lastChangeTime < this.compileState.latency)
			)
		) return;

		this.compileState.error = "";

		this.compileState.code = this.compileState.code.replace(/\n/g, "").replace(/`/g, "\"");
		console.log(this.compileState.code);
		const p = JSON.parse(this.compileState.code);

		try{
			if (!p.hasOwnProperty("width")) throw new RangeError('width is not defined');
			if (typeof(p["width"]) !== "number") throw new TypeError('width is not number');
			if (!p.hasOwnProperty("height")) throw new RangeError('height is not defined');
			if (typeof(p["height"]) !== "number") throw new TypeError('height is not number');
			if (!p.hasOwnProperty("type")) throw new RangeError('type is not defined');
			if (!this.frameBuffer.gl.hasOwnProperty(p["type"])) throw new RangeError('type is wrong value. you can select only "UNSIGNED_BYTE" or "FLOAT"');
			p["type"] = this.frameBuffer.gl[p["type"]];
			if (!p.hasOwnProperty("code")) throw new RangeError('code is not defined');
			if (!p.hasOwnProperty("preview")) p["preview"] = JSON.parse(this.default_code)["preview"];
		}
		catch(e){
			this.compileState.error = e.message;
			console.log(e.message);
			this.check_error();
			return;
		}

		// shader compile
		this.compileState.error = this.shader.loadShader(
			this.shader.default_shader.vertex, p["code"]
		);
		if (check_error()) return;

		// preview compile
		this.compileState.error = this.previewShader.loadShader(
			this.shader.default_shader.vertex, p["preview"]
		);
		if (check_error()) return;

		// reload input params
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

		this.resizeFrame(
			p["width"],
			p["height"],
			null,
			p["type"]
		);
	}
	check_error()
	{
		this.compileState.initialized = true;
		this.compileState.isCompiled = true;
		if (this.compileState.error !== "") {
			if (this.color !== {r: 1.0, g: 0.0, b: 0.2}) {
				this.color = {r: 1.0, g: 0.0, b: 0.2};
				this.resize(this.w, this.h);
			}
			return true;
		}
		if (this.color !== {r: 0.3, g: 0.3, b: 0.3}) {
			this.color = {r: 0.3, g: 0.3, b: 0.3};
			this.resize(this.w, this.h);
		}
		return false;
	}
	update(){
		super.update();
		this.setCode_();
	}
	draw(){
		super.draw();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(this.previewShader);
		this.previewShader.set("texture", this.frameBuffer.texture);
		this.previewShader.set(
			"textureArea",
			this.frameBuffer.texture.width  / this.frameBuffer.texture.pow2_width,
			this.frameBuffer.texture.height / this.frameBuffer.texture.pow2_height
		);
		this.graphics.shape(this.inner_shape);
		this.graphics.shader(tmp_current_shader);
	}
	job(){
		super.job();

		// shader process
		for(let c of this.inputs.childs) {
			if(c.output === null) {
				if (c.type === "frame") return;
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
						return;
						continue;
					}
					this.shader.set(
						c.name,
						c.output.value.texture
					);
					break;
			}
		}

		// frame process
		this.resizeFrame(
			this.frameBufferState.width,
			this.frameBufferState.height,
			null,
			this.frameBufferState.type
		);
		this.outputFrameNodeParam.value.texture = this.frameBuffer.texture;
		this.frameBuffer.beginDraw();
		const isEnableBlend = this.frameBuffer.gl.isEnabled(this.frameBuffer.gl.DITHER);
		this.frameBuffer.gl.disable(this.frameBuffer.gl.BLEND);
		this.graphics.clear();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(this.shader);
		this.graphics.rect(0, this.frameBuffer.height, this.frameBuffer.width, -this.frameBuffer.height);
		this.graphics.shader(tmp_current_shader);
		this.frameBuffer.endDraw();
		if (isEnableBlend) this.frameBuffer.gl.enable(this.frameBuffer.gl.BLEND);
	}
};