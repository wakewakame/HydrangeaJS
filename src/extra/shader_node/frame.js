import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const FrameNode = class extends Node {
	constructor(name, x, y, width = 1, height = 1, format = null, type = null) {
		super("frame", name, x, y);
		this.frameBuffer = null;
		this.frameBufferState = {
			width: width,
			height: height,
			format: format,
			type: type,
		};
		this.inputShaderNodeParam = null;
		this.outputShaderNodeParam = null;
		this.previewShader = null;
	}
	setup(){
		super.setup();
		this.inputShaderNodeParam = this.inputs.add(new ValueNodeParam("shader", "input"));
		this.outputShaderNodeParam = this.outputs.add(new ValueNodeParam("frame", "output"));
		this.frameBuffer = this.graphics.createFrame(
			this.frameBufferState.width,
			this.frameBufferState.height,
			this.frameBufferState.format,
			this.frameBufferState.type
		);
		this.previewShader = this.graphics.createShader();
		this.previewShader.loadShader(this.previewShader.default_shader.vertex, `
			precision highp float;
			uniform sampler2D texture;
			uniform vec2 textureArea;
			varying vec2 vUv;
			varying vec4 vColor;

			void main(void){
				gl_FragColor = texture2D(texture, vUv * textureArea);
			}
		`);
		this.resizeBox.target.y = this.w * this.frameBuffer.height / this.frameBuffer.width;
	}
	deleted(){
		super.deleted();
		this.frameBuffer.delete();
		this.previewShader.delete();
	}
	resizeFrame(width, height, format = null, type = null){
		this.frameBufferState = {
			width: width,
			height: height,
			format: format,
			type: type,
		};
		this.frameBuffer.resize(
			this.frameBufferState.width,
			this.frameBufferState.height,
			this.frameBufferState.format,
			this.frameBufferState.type
		);
	}
	job(){
		super.job();
		this.outputShaderNodeParam.value.texture = null;
		if (
			(this.inputs.childs.length !== 1) ||
			(!(this.inputs.childs[0] instanceof ValueNodeParam)) ||
			(this.inputs.childs[0].output === null)
		) return;
		let shader = this.inputs.childs[0].output.value.shader;
		if (shader === null) return;
		this.outputShaderNodeParam.value.texture = this.frameBuffer.texture;
		this.frameBuffer.beginDraw();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(shader);
		this.graphics.rect(0, this.frameBuffer.height, this.frameBuffer.width, -this.frameBuffer.height);
		this.graphics.shader(tmp_current_shader);
		this.frameBuffer.endDraw();
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