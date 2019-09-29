import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";
import { FrameNode } from "./frame.js";

export const PictureNode = class extends FrameNode {
	constructor(name, img_url, x, y) {
		super(name, x, y);
		this.img_url = img_url;
		this.frameBuffer = null;
	}
	setup(){
		super.setup();
		let img = this.graphics.createTexture(0, 0);
		img.loadImg(this.img_url, () => {
			this.resizeFrame(img.width, img.height);
			this.frameBuffer.beginDraw();
			this.graphics.image(img, 0, 0, img.width, img.height);
			this.frameBuffer.endDraw();
			this.resizeBox.target.y = this.w * this.frameBuffer.height / this.frameBuffer.width;
		});
		this.inputs.remove(this.inputShaderNodeParam);
		img.delete();
	}
};