import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const FrameNode = class extends Node {
	constructor(name, x, y) {
		super(name, x, y);
		this.frameBuffer = null;
		this.inputShaderNodeParam = null;
		this.outputShaderNodeParam = null;
		this.previewShader = null;
	}
	setup(){
		super.setup();
		this.inputShaderNodeParam = this.inputs.add(new ValueNodeParam("shader", "input"));
		this.outputShaderNodeParam = this.outputs.add(new ValueNodeParam("frame", "output"));
		this.frameBuffer = this.graphics.createFrame(512, 512);
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
	}
	deleted(){
		super.deleted();
		this.frameBuffer.delete();
		this.previewShader.delete();
	}
	job(){
		super.job();
		this.outputShaderNodeParam.value.texture = this.frameBuffer.texture;
		if (
			(this.inputs.childs.length !== 1) ||
			(!(this.inputs.childs[0] instanceof ValueNodeParam)) ||
			(this.inputs.childs[0].output === null)
		) return;
		let shader = this.inputs.childs[0].output.value.shader;
		this.frameBuffer.beginDraw();
		let tmp_current_shader = this.graphics.current_shader;
		this.graphics.shader(shader);
		this.graphics.rect(0, this.frameBuffer.height, this.frameBuffer.width, -this.frameBuffer.height);
		this.graphics.shader(tmp_current_shader);
		this.frameBuffer.endDraw();
	}
	update(){
		super.update();
		if (this.parent.childs[0] === this)	{
			this.reset();
			this.job();
		}
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