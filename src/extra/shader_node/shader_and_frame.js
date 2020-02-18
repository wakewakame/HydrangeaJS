import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const ShaderAndFrameNode = class extends Node {
	constructor(name, x, y, compileLatency = -1) {
		super("shader", name, x, y);
		this.frameShader = null;
		this.previewShader = null;
		this.outputFrameBuffer = null;
		this.outputFrameNodeParam = null;
		this.default_code = `
{
	"width": 512,
	"height": 512,
	"type": "UNSIGNED_BYTE",
	"code": "
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
			vec2 code_json = vUv;
			gl_FragColor = texture2D(texture, code_json);
		}
	",
	"preview": "
		precision highp float;
		uniform sampler2D texture;
		uniform vec2 textureArea;
		varying vec2 vUv;
		varying vec4 vColor;

		void main(void){
			gl_FragColor = texture2D(texture, vUv * textureArea);
		}
	"
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
		this.frameShader = this.graphics.createShader();
		this.frameShader.loadDefaultShader();
		this.previewShader = this.graphics.createShader();
		this.previewShader.loadDefaultShader();
		this.outputFrameBuffer = this.graphics.createFrame(
			this.frameBufferState.width,
			this.frameBufferState.height,
			null,
			this.frameBufferState.type
		);
		this.resize(this.w, this.w * this.outputFrameBuffer.height / this.outputFrameBuffer.width);
	}
	deleted(){
		super.deleted();
		this.frameShader.delete();
		this.previewShader.delete();
		this.outputFrameBuffer.delete();
	}
	resizeFrame(width, height, type = null){
		this.outputFrameBuffer.resize(
			width,
			height,
			null,
			type
		);
		this.frameBufferState = {
			width: this.outputFrameBuffer.width,
			height: this.outputFrameBuffer.height,
			type: this.outputFrameBuffer.texture.type,
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
		// ignore compiling the same code
		if (
			(this.compileState.initialized) && (
				(this.compileState.isCompiled) ||
				(Date.now() - this.compileState.lastChangeTime < this.compileState.latency)
			)
		) return;

		// init
		let code_json = {};
		this.compileState.error = "";

		// parsing this.compileState.code into json
		try{
			code_json = this.json_parse(this.compileState.code);

			// error check
			if (!code_json.hasOwnProperty("width")) throw new RangeError('width is not defined');
			if (typeof(code_json["width"]) !== "number") throw new TypeError('width is not number');
			if (!code_json.hasOwnProperty("height")) throw new RangeError('height is not defined');
			if (typeof(code_json["height"]) !== "number") throw new TypeError('height is not number');
			if (!code_json.hasOwnProperty("type")) throw new RangeError('type is not defined');
			if ((code_json["type"] != "UNSIGNED_BYTE") && (code_json["type"] != "FLOAT")) throw new RangeError('type is wrong value. you can select only "UNSIGNED_BYTE" or "FLOAT"');
			code_json["type"] = this.outputFrameBuffer.gl[code_json["type"]];
			if (!code_json.hasOwnProperty("code")) throw new RangeError('code is not defined');
			if (!code_json.hasOwnProperty("preview")) code_json["preview"] = this.json_parse(this.default_code)["preview"];
		}
		catch(e){
			this.compileState.error = e.message;
			console.log(e.message);
			this.check_error();
			return;
		}

		// compileing frameShader
		this.compileState.error = this.frameShader.loadShader(
			this.frameShader.default_shader.vertex, code_json["code"]
		);
		if (this.check_error()) return;

		// compileing previewShader
		this.compileState.error = this.previewShader.loadShader(
			this.frameShader.default_shader.vertex, code_json["preview"]
		);
		if (this.check_error()) return;

		// reregister input parameters
		const inputs_output = {};
		for(let code_json of this.inputs.childs.concat()) {
			inputs_output[code_json.name] = {type: code_json.type, output: code_json.output};
			this.inputs.remove(code_json);
		}
		Object.keys(this.frameShader.uniforms_type).forEach((key) => {
			if (key === "matrix") return;
			let type = this.frameShader.uniforms_type[key];
			if (type === "sampler2D") type = "frame";
			let param = this.inputs.add(new ValueNodeParam(type, key));
			if (param !== null && inputs_output.hasOwnProperty(key) && inputs_output[key].type === type) {
				param.output = inputs_output[key].output;
			}
		});

		// resize the outputFrameBuffer
		this.resizeFrame(
			code_json["width"],
			code_json["height"],
			null,
			code_json["type"]
		);
	}
	json_parse(code){
		let ret = code;
		// escape 1
		let code_string_list = ret.replace(/\n/g, "\\n").match(/".*?(?<!\\)"/g).map(t => t.replace(/\\n/g, "\n"));
		
		// escape 2
		code_string_list.forEach((code_string) => {
			let excaped_code_string = code_string
				.replace(/\\"/g, '\\\\"')
				.replace(/\\/g, '\\\\')
				.replace(/\//g, '\\/')
				.replace(/\f/g, '\\f')
				.replace(/\n/g, '\\n')
				.replace(/\r/g, '\\r')
				.replace(/\t/g, '\\t');
			ret = ret
				.replace(code_string, excaped_code_string);
		});
		
		// parse
		return JSON.parse(ret);
	}
	check_error(){
		this.compileState.initialized = true;
		this.compileState.isCompiled = true;
		if (this.compileState.error !== "") {
			if (this.color !== {r: 1.0, g: 0.0, b: 0.2}) {
				this.color = {r: 1.0, g: 0.0, b: 0.2};
				this.redraw();
			}
			return true;
		}
		if (this.color !== {r: 0.3, g: 0.3, b: 0.3}) {
			this.color = {r: 0.3, g: 0.3, b: 0.3};
			this.redraw();
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
		this.previewShader.set("texture", this.outputFrameBuffer.texture);
		this.previewShader.set(
			"textureArea",
			this.outputFrameBuffer.texture.width  / this.outputFrameBuffer.texture.pow2_width,
			this.outputFrameBuffer.texture.height / this.outputFrameBuffer.texture.pow2_height
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
					this.frameShader.set(
						c.name,
						c.output.value.x
					);
					break;
				case "ivec2":
				case "vec2":
					this.frameShader.set(
						c.name,
						c.output.value.x,
						c.output.value.y
					);
					break;
				case "ivec3":
				case "vec3":
					this.frameShader.set(
						c.name,
						c.output.value.x,
						c.output.value.y,
						c.output.value.z
					);
					break;
				case "ivec4":
				case "vec4":
					this.frameShader.set(
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
					this.frameShader.set(
						c.name,
						c.output.value.mat
					);
					break;
				case "frame":
					if (c.output.value.texture === null) {
						return;
						continue;
					}
					this.frameShader.set(
						c.name,
						c.output.value.texture
					);
					break;
			}
		}

		// frame buffer process
		this.resizeFrame(
			this.frameBufferState.width,
			this.frameBufferState.height,
			null,
			this.frameBufferState.type
		);
		this.outputFrameNodeParam.value.texture = this.outputFrameBuffer.texture;
		this.outputFrameBuffer.beginDraw();
		const isEnableBlend = this.outputFrameBuffer.gl.isEnabled(this.outputFrameBuffer.gl.DITHER);
		this.outputFrameBuffer.gl.disable(this.outputFrameBuffer.gl.BLEND);
		this.graphics.clear();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(this.frameShader);
		this.graphics.rect(0, this.outputFrameBuffer.height, this.outputFrameBuffer.width, -this.outputFrameBuffer.height);
		this.graphics.shader(tmp_current_shader);
		this.outputFrameBuffer.endDraw();
		if (isEnableBlend) this.outputFrameBuffer.gl.enable(this.outputFrameBuffer.gl.BLEND);
	}
};