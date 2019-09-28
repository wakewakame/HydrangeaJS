import { App } from "./app.js";
import { Texture } from "./texture.js";

export const Shader = class {
	constructor(app) {
		if (!(app instanceof App)) throw new TypeError();
		this.app = app;
		this.gl = this.app.gl;
		this.program = null;
		this.attributes_type = {};
		this.uniforms_type = {};
		this.attributes_location = {};
		this.uniforms_location = {};
		this.texture_unit_num = {};
		this.default_shader = {
			vertex: `
					precision highp float;
					attribute vec3 position;
					attribute vec2 uv;
					attribute vec4 color;
					uniform mat4 matrix;
					varying vec2 vUv;
					varying vec4 vColor;

					void main(void) {
						vUv = uv;
						vColor = color;
						gl_Position = matrix * vec4(position, 1.0);
					}
				`,
			fragment: `
					precision highp float;
					varying vec2 vUv;
					varying vec4 vColor;

					void main(void){
						gl_FragColor = vColor;
					}
				`
		};
	}
	loadDefaultShader() {
		this.loadShader(this.default_shader.vertex, this.default_shader.fragment);
	}
	loadShader(vertex_source, fragment_source) {
		// check the type of code is string
		if (typeof (vertex_source) !== "string") throw new TypeError();
		if (typeof (fragment_source) !== "string") throw new TypeError();
		// compile shaders
		// vertex
		let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER); // create empty Shader object
		this.gl.shaderSource(vertexShader, vertex_source); // bind Shader source code to empty shader object
		this.gl.compileShader(vertexShader); // compile Shader
		if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) { // get compile response
			let error = "vertex shader : \n" + this.gl.getShaderInfoLog(vertexShader);
			this.gl.deleteShader(vertexShader);
			return error;
		}
		// fragment
		let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fragmentShader, fragment_source);
		this.gl.compileShader(fragmentShader);
		if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
			let error = "fragment shader : \n" + this.gl.getShaderInfoLog(fragmentShader);
			this.gl.deleteShader(vertexShader);
			this.gl.deleteShader(fragmentShader);
			return error;
		}
		// bind Shader to program
		let program = this.gl.createProgram(); // create empty program
		this.gl.attachShader(program, vertexShader); // bind vertex shader
		this.gl.attachShader(program, fragmentShader); // bind fragment shader
		this.gl.deleteShader(vertexShader);
		this.gl.deleteShader(fragmentShader);
		this.gl.linkProgram(program); // link program
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) { // get link response
			let error = "program : \n" + this.gl.getProgramInfoLog(program);
			this.gl.deleteProgram(program);
			return error;
		}
		if (this.program !== null) this.gl.deleteProgram(this.program);
		this.program = program;
		this.gl.useProgram(this.program); // use this progam
		// get variables info
		this.attributes_type = this.findVariable(vertex_source, "attribute");
		this.uniforms_type = this.findVariable(vertex_source + "\n" + fragment_source, "uniform");
		let current_texture_unit = 0;
		for (let i in this.attributes_type) {
			this.attributes_location[i] = this.gl.getAttribLocation(this.program, i);
		}
		for (let i in this.uniforms_type) {
			this.uniforms_location[i] = this.gl.getUniformLocation(this.program, i);
			if (this.uniforms_type[i] === "sampler2D") {
				this.texture_unit_num[i] = parseInt(current_texture_unit);
				current_texture_unit++;
			}
		}

		return "";
	}
	// How to use set()
	//  set(name, x);
	//  set(name, x, y);
	//  set(name, x, y, z);
	//  set(name, x, y, z, w);
	//  set(name, [mat]);
	//  set(name, texture(GLCore.Texture));
	set(name, x, y = null, z = null, w = null) {
		if (!(name in this.uniforms_type)) throw new RangeError();
		this.gl.useProgram(this.program);
		switch (this.uniforms_type[name]) {
			case "int":
				if (typeof (x) !== "number") throw new TypeError();
				this.gl.uniform1i(this.uniforms_location[name], x);
				break;
			case "ivec2":
				if ((typeof (x) !== "number") || (typeof (y) !== "number")) throw new TypeError();
				this.gl.uniform2i(this.uniforms_location[name], x, y);
				break;
			case "ivec3":
				if ((typeof (x) !== "number") || (typeof (y) !== "number") || (typeof (z) !== "number")) throw new TypeError();
				this.gl.uniform3i(this.uniforms_location[name], x, y, z);
				break;
			case "ivec4":
				if ((typeof (x) !== "number") || (typeof (y) !== "number") || (typeof (z) !== "number") || (typeof (w) !== "number")) throw new TypeError();
				this.gl.uniform4i(this.uniforms_location[name], x, y, z, w);
				break;
			case "float":
				if (typeof (x) !== "number") throw new TypeError();
				this.gl.uniform1f(this.uniforms_location[name], x);
				break;
			case "vec2":
				if ((typeof (x) !== "number") || (typeof (y) !== "number")) throw new TypeError();
				this.gl.uniform2f(this.uniforms_location[name], x, y);
				break;
			case "vec3":
				if ((typeof (x) !== "number") || (typeof (y) !== "number") || (typeof (z) !== "number")) throw new TypeError();
				this.gl.uniform3f(this.uniforms_location[name], x, y, z);
				break;
			case "vec4":
				if ((typeof (x) !== "number") || (typeof (y) !== "number") || (typeof (z) !== "number") || (typeof (w) !== "number")) throw new TypeError();
				this.gl.uniform4f(this.uniforms_location[name], x, y, z, w);
				break;
			case "mat2":
				this.gl.uniformMatrix2fv(this.uniforms_location[name], false, x);
				break;
			case "mat3":
				this.gl.uniformMatrix3fv(this.uniforms_location[name], false, x);
				break;
			case "mat4":
				this.gl.uniformMatrix4fv(this.uniforms_location[name], false, x);
				break;
			case "sampler2D":
				if (!(x instanceof Texture)) throw new TypeError();
				if (x.texture_buffer === null) throw new ReferenceError("this texture is empty.");
				this.gl.activeTexture(this.gl["TEXTURE" + this.texture_unit_num[name].toString()]);
				this.gl.bindTexture(this.gl.TEXTURE_2D, x.texture_buffer);
				this.gl.uniform1i(this.uniforms_location[name], this.texture_unit_num[name]);
				break;
		}
		return;
	}
	findVariable(code, modifier) {
		// delete comments
		let comments = /\/\*[\s\S]*?\*\/|\/\/.*/g;
		let tmp_code = code.replace(comments, "");
		// search all variables
		let target = new RegExp(modifier + "[^;]+;", "g");
		let tmp_variables = tmp_code.match(target);
		// get type and name
		let word = /[\w_]+/g;
		let variables = {};
		for (let i of tmp_variables) {
			let tmp = i.match(word);
			if (tmp === null) continue;
			if (tmp.length < 3) continue;
			variables[tmp[2]] = tmp[1];
			if (tmp.length > 3) variables[tmp[2]] += "[" + tmp[3] + "]";
		}
		return variables;
	}
	delete(){
		this.gl.deleteProgram(this.program);
	}
};