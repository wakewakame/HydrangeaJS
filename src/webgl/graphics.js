import { GLCore } from "./core/core.js";
import { GLMath } from "./utils/math.js";

export const Graphics = class {
	constructor(canvas) {
		this.gapp = new GLCore.App(canvas);
		this.width = this.gapp.width;
		this.height = this.gapp.height;
		this.gshape = this.createShape();
		this.shaders = {
			normal: this.createShader(),
			texture: this.createShader()
		};
		this.shaders.normal.loadDefaultShader();
		this.shaders.texture.loadShader(this.shaders.texture.default_shader.vertex, `
					precision highp float;
					uniform sampler2D texture;
					varying vec2 v_uv;
					varying vec4 v_color;

					void main(void){
						gl_FragColor = texture2D(texture, v_uv);
					}
				`);
		this.current_shader = this.shaders.normal;
		this.stroke_weight = 1.0;
		this.colors = {
			fill: { r: 0, g: 0, b: 0, a: 1 },
			stroke: { r: 0, g: 0, b: 0, a: 1 }
		}
		this.current_matrix = new GLMath.mat4();
		this.current_matrix_backup = [];
	}
	createShape() { return new GLCore.Shape(this.gapp); }
	createShader() { return new GLCore.Shader(this.gapp); }
	createTexture(width, height, format = null, type = null) { return new GLCore.Texture(this.gapp, width, height, format, type); }
	createFrame(width, height, format = null, type = null) { return new GLCore.Frame(this.gapp, width, height, format, type); }
	strokeWeight(weight) { this.stroke_weight = weight; }
	fill(r = 0.0, g = 0.0, b = 0.0, a = 1.0) { this.colors.fill = { r, g, b, a }; }
	stroke(r = 0.0, g = 0.0, b = 0.0, a = 1.0) { this.colors.stroke = { r, g, b, a }; }
	shader(shader) { this.current_shader = shader; };
	pushMatrix(){ 
		this.current_matrix_backup.push(new GLMath.mat4());
		this.current_matrix_backup[this.current_matrix_backup.length - 1].set(this.current_matrix);
	}
	popMatrix() { 
		if (this.current_matrix_backup.length === 0) return;
		this.current_matrix.set(this.current_matrix_backup.pop());
	}
	translate(x = 0, y = 0, z = 0){ this.current_matrix.translate(x, y, z); }
	scale(x = 1, y = 1, z = 1, cx = 0, cy = 0, cz = 0){ this.current_matrix.scale(x, y, z, cx, cy, cz); }
	shape(shape) {
		let w, h;
		if (this.gapp.current_frame === null) { w = this.gapp.width; h = this.gapp.height; }
		else { w = this.gapp.current_frame.width; h = this.gapp.current_frame.height; }
		let m = new GLMath.mat4(
			2 / w, 0, 0, -1,
			0, -2 / h, 0, 1,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		m.rmul(this.current_matrix);
		this.current_shader.set("matrix", m.arr);
		shape.drawShape(this.current_shader);
	}
	rect(x, y, width, height, r = 0.0, div = 8) {
		const add_vertecis = () => {
			if (r === 0.0){
				this.gshape.vertex(x, y, 0, 0, 0);
				this.gshape.vertex(x + width, y, 0, 1, 0);
				this.gshape.vertex(x + width, y + height, 0, 1, 1);
				this.gshape.vertex(x, y + height, 0, 0, 1);
			}
			else {
				this.gshape.vertex(x + r, y, 0, 0, 0);
				this.gshape.vertex(x + width - r, y, 0, 1, 0);
				for(let i = 1; i < div - 1; i++) this.gshape.vertex(
					x + width  - r + r * Math.cos(2.0 * Math.PI * (0.75 + i / (div * 4))),
					y		  + r + r * Math.sin(2.0 * Math.PI * (0.75 + i / (div * 4))),
					0, 1, 0
				);
				this.gshape.vertex(x + width, y + r, 0, 1, 0);
				this.gshape.vertex(x + width, y + height - r, 0, 1, 1);
				for(let i = 1; i < div - 1; i++) this.gshape.vertex(
					x + width  - r + r * Math.cos(2.0 * Math.PI * (0.00 + i / (div * 4))),
					y + height - r + r * Math.sin(2.0 * Math.PI * (0.00 + i / (div * 4))),
					0, 1, 0
				);
				this.gshape.vertex(x + width - r, y + height, 0, 1, 1);
				this.gshape.vertex(x + r, y + height, 0, 0, 1);
				for(let i = 1; i < div - 1; i++) this.gshape.vertex(
					x		  + r + r * Math.cos(2.0 * Math.PI * (0.25 + i / (div * 4))),
					y + height - r + r * Math.sin(2.0 * Math.PI * (0.25 + i / (div * 4))),
					0, 1, 0
				);
				this.gshape.vertex(x, y + height - r, 0, 0, 1);
				this.gshape.vertex(x, y + r, 0, 0, 0);
				for(let i = 1; i < div - 1; i++) this.gshape.vertex(
					x		  + r + r * Math.cos(2.0 * Math.PI * (0.50 + i / (div * 4))),
					y		  + r + r * Math.sin(2.0 * Math.PI * (0.50 + i / (div * 4))),
					0, 1, 0
				);
			}
		};
		if (this.colors.fill.a !== 0.0) {
			this.gshape.beginShape(this.gshape.gl.TRIANGLE_FAN);
			this.gshape.color(this.colors.fill.r, this.colors.fill.g, this.colors.fill.b, this.colors.fill.a);
			add_vertecis();
			this.gshape.endShape();
			this.shape(this.gshape);
		}
		if ((this.stroke_weight > 0.0) && (this.colors.stroke.a !== 0.0)) {
			this.gshape.beginWeightShape(this.stroke_weight, true);
			this.gshape.color(this.colors.stroke.r, this.colors.stroke.g, this.colors.stroke.b, this.colors.stroke.a);
			add_vertecis();
			this.gshape.endWeightShape();
			this.shape(this.gshape);
		}
	}
	line(x1, y1, x2, y2) {
		this.gshape.beginWeightShape(this.stroke_weight);
		this.gshape.color(this.colors.stroke.r, this.colors.stroke.g, this.colors.stroke.b, this.colors.stroke.a);
		this.gshape.vertex(x1, y1, 0, 1, 0);
		this.gshape.vertex(x2, y2, 0, 0, 1);
		this.gshape.endWeightShape();
		this.shape(this.gshape);
	}
	bezier(x1, y1, x2, y2, x3, y3, x4, y4, div = 32) {
		this.gshape.beginWeightShape(this.stroke_weight);
		this.gshape.color(this.colors.stroke.r, this.colors.stroke.g, this.colors.stroke.b, this.colors.stroke.a);
		for(let i = 0; i < div + 1; i++){
			let t = i / div;
			this.gshape.vertex(
				(1 - t) * (1 - t) * (1 - t) * x1 + 3 * (1 - t) * (1 - t) * t * x2 + 3 * (1 - t) * t * t * x3 + t * t * t * x4,
				(1 - t) * (1 - t) * (1 - t) * y1 + 3 * (1 - t) * (1 - t) * t * y2 + 3 * (1 - t) * t * t * y3 + t * t * t * y4,
				0, t, 0
			);
		}
		this.gshape.endWeightShape();
		this.shape(this.gshape);
	}
	ellipse(x, y, width, height, div = 32) {
		this.gshape.beginShape(this.gshape.gl.TRIANGLE_FAN);
		this.gshape.color(this.colors.fill.r, this.colors.fill.g, this.colors.fill.b, this.colors.fill.a);
		for (let i = 0; i < div; i++) {
			this.gshape.vertex(
				x + (width / 2) * Math.cos(2 * Math.PI * i / div),
				y + (height / 2) * Math.sin(2 * Math.PI * i / div),
				0, 0, 0
			);
		}
		this.gshape.endShape();
		this.shape(this.gshape);

		this.gshape.beginWeightShape(this.stroke_weight, true);
		this.gshape.color(this.colors.stroke.r, this.colors.stroke.g, this.colors.stroke.b, this.colors.stroke.a);
		for (let i = 0; i < div; i++) {
			this.gshape.vertex(
				x + (width / 2) * Math.cos(2 * Math.PI * i / div),
				y + (height / 2) * Math.sin(2 * Math.PI * i / div),
				0, 0, 0
			);
		}
		this.gshape.endWeightShape();
		this.shape(this.gshape);
	}
	image(texture, x, y, width, height) {
		let tmp_current_shader = this.current_shader;
		this.shader(this.shaders.texture);

		this.shaders.texture.set("texture", texture);

		this.gshape.beginShape(this.gshape.gl.TRIANGLE_FAN);
		this.gshape.vertex(x, y, 0, 0, texture.height / texture.pow2_height);
		this.gshape.vertex(x + width, y, 0, texture.width / texture.pow2_width, texture.height / texture.pow2_height);
		this.gshape.vertex(x + width, y + height, 0, texture.width / texture.pow2_width, 0);
		this.gshape.vertex(x, y + height, 0, 0, 0);
		this.gshape.endShape();
		this.shape(this.gshape);

		this.shader(tmp_current_shader);
	}
	clear() { this.gapp.gl.clear(this.gapp.gl.COLOR_BUFFER_BIT | this.gapp.gl.DEPTH_BUFFER_BIT); }
	render() { this.gapp.render(); }
	resize(width, height) {
		this.gapp.resize(width, height);
		this.width = this.gapp.width;
		this.height = this.gapp.height;
	}
};