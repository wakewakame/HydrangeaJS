import { App } from "./app.js";

export const Texture = class {
	constructor(app, width, height, format = null, type = null) {
		if (!(app instanceof App)) throw new TypeError();
		this.app = app;
		this.gl = this.app.gl;
		this.texture_buffer = null;
		this.text_canvas = document.createElement("canvas");
		this.text_2d = this.text_canvas.getContext("2d");
		this.resize(width, height, format, type);
	}
	resize(width = 1, height = 1, format = null, type = null) {
		if ((typeof (width) !== "number") || (typeof (height) !== "number")) throw new TypeError();
		if ((this.width === width) && (this.height === height)) return;
		this.width = Math.max(1, width);
		this.height = Math.max(1, height);
		this.pow2_width = parseInt(Math.pow(2, Math.ceil(Math.log2(this.width))));
		this.pow2_height = parseInt(Math.pow(2, Math.ceil(Math.log2(this.height))));
		this.format = (format === null) ? this.gl.RGBA : format;
		this.type = (type === null) ? this.gl.UNSIGNED_BYTE : type;
		if (this.texture_buffer !== null) this.delete();
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
		if ((typeof (left) !== "number") || (typeof (top) !== "number") || (typeof (width) !== "number") || (typeof (height) !== "number")) throw new TypeError();
		if (this.texture_buffer === null) return;
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
		this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, left, top, width, height, this.format, this.type, pixels);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	loadImg(src, callback = null) {
		let img = new Image();
		img.onload = () => {
			this.resize(img.width, img.height);
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
			this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, img);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			if (callback !== null) callback();
		}
		img.crossorigin = "anonymous";
		img.src = src;
	}
	loadText(text, color = "#000000", size = 10, font = "sans-serif", bold = false) {
		this.text_2d.textAlign = "left";
		this.text_2d.textBaseline = "top";
		this.text_2d.fillStyle = color;
		this.text_2d.font = (bold ? "bold " : "") + size + "px " + font;
		const text_stat = this.text_2d.measureText(text);
		const text_width = Math.max(1, Math.ceil(text_stat.width));
		const text_height = Math.max(1, size);
		if ((this.text_canvas.width !== text_width) || (this.text_canvas.height !== text_height)) {
			this.text_canvas.width = text_width;
			this.text_canvas.height = text_height;
		}
		this.text_2d.clearRect(0, 0, text_width, text_height);
		this.text_2d.textAlign = "left";
		this.text_2d.textBaseline = "top";
		this.text_2d.fillStyle = color;
		this.text_2d.font = (bold ? "bold " : "") + size + "px " + font;
		this.text_2d.fillText(text, 0, 0);
		this.resize(this.text_canvas.width, this.text_canvas.height);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_buffer);
		this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, this.text_canvas);
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	delete() {
		this.gl.deleteTexture(this.texture_buffer);
		this.texture_buffer = null;
	}
};