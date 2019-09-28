import { App } from "./app.js";
import { Texture } from "./texture.js";

export const Frame = class {
	constructor(app, width, height, format = null, type = null) {
		if (!(app instanceof App)) throw new TypeError();
		this.app = app;
		this.gl = this.app.gl;
		this.frame_buffer = null;
		this.texture = null;
		this.tmp_current_frame = null;
		this.resize(width, height, format, type);
	}
	resize(width, height, format = null, type = null) {
		if ((typeof (width) != "number") || (typeof (height) != "number")) throw new TypeError();
		if ((this.width === width) && (this.height === height)) return;
		this.width = width;
		this.height = height;
		if (this.frame_buffer != null) this.delete();
		this.frame_buffer = this.gl.createFramebuffer();
		this.texture = new Texture(this.app, this.width, this.height, format, type);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frame_buffer);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture.texture_buffer, 0);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	}
	beginDraw() {
		if (this.frame_buffer === null) return;
		this.tmp_current_frame = this.app.current_frame;
		this.app.current_frame = this;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frame_buffer);
		this.gl.viewport(0, 0, this.width, this.height);
	}
	endDraw() {
		this.app.current_frame = this.tmp_current_frame;
		let frame_buffer = (this.app.current_frame != null) ? this.app.current_frame.frame_buffer : null;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frame_buffer);
		this.gl.viewport(0, 0, this.app.width, this.app.height);
	}
	read(pixels, left = 0, top = 0, width = this.width, height = this.height) {
		if (this.frame_buffer === null) return;
		this.beginDraw();
		this.gl.readPixels(left, top, width, height, this.texture.format, this.texture.type, pixels);
		this.endDraw();
	}
	delete() {
		this.gl.deleteFramebuffer(this.frame_buffer);
		this.frame_buffer = null;
		this.texture.delete();
	}
};