import { ConvertibleNode } from "../../gui/templates/convertible_node_component.js";
import { ValueNodeParam } from "./param.js";

export const FrameNode = class extends ConvertibleNode {
	constructor(name = "", x = 0, y = 0, width = 1, height = 1, format = null, type = null) {
		super();
		this.type = "frame";
		this.name = name;
		this.x = x;
		this.y = y;
		this.frameBuffer = null;
		this.json["custom"].frameBufferState = {
			width: width,
			height: height,
			format: format,
			type: type,
		};
		this.inputShaderNodeParam = null;
		this.inputResolutionNodeParam = null;
		this.outputShaderNodeParam = null;
		this.outputResolutionNodeParam = null;
		this.previewShader = null;
	}
	setup(){
		super.setup();
		this.inputShaderNodeParam = this.inputs.add(new ValueNodeParam("shader", "input shader"));
		this.inputResolutionNodeParam = this.inputs.add(new ValueNodeParam("ivec2", "input resolution"));
		this.outputShaderNodeParam = this.outputs.add(new ValueNodeParam("frame", "output frame"));
		this.outputResolutionNodeParam = this.outputs.add(new ValueNodeParam("ivec2", "output resolution"));
		this.frameBuffer = this.graphics.createFrame(
			this.json["custom"].frameBufferState.width,
			this.json["custom"].frameBufferState.height,
			this.json["custom"].frameBufferState.format,
			this.json["custom"].frameBufferState.type
		);
		this.previewShader = this.graphics.createShader();
		this.previewShader.loadShader(this.previewShader.default_shader.vertex, `
			precision highp float;
			uniform sampler2D texture;
			uniform vec2 textureArea;
			varying vec2 v_uv;
			varying vec4 v_color;

			void main(void){
				gl_FragColor = texture2D(texture, v_uv * textureArea);
			}
		`);
		this.resize(this.w, this.w * this.frameBuffer.height / this.frameBuffer.width);
	}
	deleted(){
		super.deleted();
		this.frameBuffer.delete();
		this.previewShader.delete();
	}
	resizeFrame(width, height, format = null, type = null){
		this.frameBuffer.resize(
			width,
			height,
			format,
			type
		);
		this.json["custom"].frameBufferState = {
			width: this.frameBuffer.width,
			height: this.frameBuffer.height,
			format: this.frameBuffer.texture.format,
			type: this.frameBuffer.texture.type,
		};
	}
	job(){
		super.job();
		if (this.inputResolutionNodeParam.output !== null) {
			this.resizeFrame(
				this.inputResolutionNodeParam.output.value.x,
				this.inputResolutionNodeParam.output.value.y
			);
		}
		this.outputShaderNodeParam.value.frame = this.frameBuffer;
		this.outputResolutionNodeParam.value.x = this.frameBuffer.texture.width;
		this.outputResolutionNodeParam.value.y = this.frameBuffer.texture.height;
		if (this.inputShaderNodeParam.output === null) return;
		let shader = this.inputShaderNodeParam.output.value.shader;
		if (shader === null) return;
		this.frameBuffer.beginDraw();
		const isEnableBlend = this.frameBuffer.gl.isEnabled(this.frameBuffer.gl.DITHER);
		this.frameBuffer.gl.disable(this.frameBuffer.gl.BLEND);
		this.graphics.clear();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(shader);
		this.graphics.rect(0, this.frameBuffer.height, this.frameBuffer.width, -this.frameBuffer.height);
		this.graphics.shader(tmp_current_shader);
		this.frameBuffer.endDraw();
		if (isEnableBlend) this.frameBuffer.gl.enable(this.frameBuffer.gl.BLEND);
	}
	update(){
		super.update();
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
};