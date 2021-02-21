import { ConvertibleNode } from "../../gui/templates/convertible_node_component.js";
import { ValueNodeParam } from "./param.js";
import { FrameNode } from "./frame.js";

export const PictureNode = class extends FrameNode {
	constructor(name = "", img_url = "", x = 0, y = 0) {
		super();
		this.type = "image";
		this.name = name;
		this.x = x;
		this.y = y;
		this.json["custom"].img_url = img_url;
		this.loading = true;
	}
	update() {
		super.update();
		if (this.loading) {
			this.loading = false;
			let img = this.graphics.createTexture(0, 0);
			img.loadImg(this.json["custom"].img_url, () => {
				this.resizeFrame(img.width, img.height);
				this.frameBuffer.beginDraw();
				this.graphics.image(img, 0, 0, img.width, img.height);
				this.frameBuffer.endDraw();
				this.resizeBox.target.y = this.w * this.frameBuffer.height / this.frameBuffer.width;
			}, () => {
				this.parent.remove(this);
			});
			this.inputs.remove(this.inputShaderNodeParam);
			this.inputs.remove(this.inputResolutionNodeParam);
			img.delete();
		}
	}
	job() {
		super.job();
	}
};
