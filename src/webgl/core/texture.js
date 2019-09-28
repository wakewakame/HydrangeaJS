import { App } from "./app.js";

export const Texture = class {
	constructor(app, width, height, format = null, type = null) {
		if (typeof (app) != "object") { console.error("argument type is wrong."); return; }
		if (!(app instanceof App)) { console.error("argument type is wrong."); return; }
		this.app = app;
		this.gl = this.app.gl;
		this.texture_buffer = null;
		this.resize(width, height, format, type);
	}
	resize(width = 1, height = 1, format = null, type = null) {
		if ((typeof (width) != "number") || (typeof (height) != "number")) { console.error("argument type is wrong."); return; }
		if ((this.width === width) && (this.height === height)) return;
		this.width = width;
		this.height = height;
		this.pow2_width = parseInt(Math.pow(2, Math.ceil(Math.log2(this.width))));
		this.pow2_height = parseInt(Math.pow(2, Math.ceil(Math.log2(this.height))));
		this.format = (format === null) ? this.gl.RGBA : format;
		this.type = (type === null) ? this.gl.UNSIGNED_BYTE : type;
		if (this.texture_buffer != null) this.delete();
		this.texture_buffer = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.pow2_width, this.pow2_height, 0, this.format, this.type, null);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	update(pixels, left = 0, top = 0, width = this.width, height = this.height) {
		if ((typeof (left) != "number") || (typeof (top) != "number") || (typeof (width) != "number") || (typeof (height) != "number")) { console.error("argument type is wrong."); return; }
		if (this.texture_buffer === null) return;
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
		this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, left, top, width, height, this.format, this.type, pixels);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	loadImg(src, callback = null) {
		if (this.texture_buffer != null) this.delete();
		this.texture_buffer = this.gl.createTexture();
		let img = new Image();
		img.onload = () => {
			this.resize(img.width, img.height);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
			this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, img);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.width = img.width;
			this.height = img.height;
			if (callback !== null) callback();
		}
		img.src = src;
	}
	delete() {
		this.gl.deleteTexture(this.texture_buffer);
		this.texture_buffer = null;
	}
};