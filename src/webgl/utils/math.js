export const GLMath = {
	vec2: class {
		constructor(x = 0, y = 0) {
			this.arr = new Float32Array(2);
			this.arr[0] = x;
			this.arr[1] = y;
		}
		add(v) {
			this.arr[0] += v.arr[0];
			this.arr[1] += v.arr[1];
		}
		sub(v) {
			this.arr[0] -= v.arr[0];
			this.arr[1] -= v.arr[1];
		}
		mul(x) {
			this.arr[0] *= x;
			this.arr[1] *= x;
		}
		div(x) {
			this.arr[0] /= x;
			this.arr[1] /= x;
		}
		dot(v) {
			return
				this.arr[0] * v.arr[0] +
				this.arr[1] * v.arr[1];
		}
		abs() {
			return Math.sqrt(
				Math.pow(this.arr[0], 2) +
				Math.pow(this.arr[1], 2)
			);
		}
		normalize() {
			this.div(this.abs());
		}
		copy() {
			return new this.constructor(
				this.arr[0],
				this.arr[1]
			);
		}
	},
	vec3: class {
		constructor(x = 0, y = 0, z = 0) {
			this.arr = new Float32Array(3);
			this.arr[0] = x;
			this.arr[1] = y;
			this.arr[2] = z;
		}
		add(v) {
			this.arr[0] += v.arr[0];
			this.arr[1] += v.arr[1];
			this.arr[2] += v.arr[2];
		}
		sub(v) {
			this.arr[0] -= v.arr[0];
			this.arr[1] -= v.arr[1];
			this.arr[2] -= v.arr[2];
		}
		mul(x) {
			this.arr[0] *= x;
			this.arr[1] *= x;
			this.arr[2] *= x;
		}
		div(x) {
			this.arr[0] /= x;
			this.arr[1] /= x;
			this.arr[2] /= x;
		}
		dot(v) {
			return
				this.arr[0] * v.arr[0] +
				this.arr[1] * v.arr[1] +
				this.arr[2] * v.arr[2];
		}
		cross(v){
			this.arr = new Float32Array([
				this.arr[1] * v.arr[2] - this.arr[2] * v.arr[1],
				this.arr[2] * v.arr[0] - this.arr[0] * v.arr[2],
				this.arr[0] * v.arr[1] - this.arr[1] * v.arr[0]
			]);
		}
		abs(){
			return Math.sqrt(
				Math.pow(this.arr[0], 2) +
				Math.pow(this.arr[1], 2) +
				Math.pow(this.arr[2], 2)
			);
		}
		normalize() {
			this.div(this.abs());
		}
		copy() {
			return new this.constructor(
				this.arr[0],
				this.arr[1],
				this.arr[2]
			);
		}
	},
	vec4: class {
		constructor(x = 0, y = 0, z = 0, w = 1) {
			this.arr = new Float32Array(4);
			this.arr[0] = x;
			this.arr[1] = y;
			this.arr[2] = z;
			this.arr[3] = w;
		}
		add(v) {
			this.arr[0] += v.arr[0];
			this.arr[1] += v.arr[1];
			this.arr[2] += v.arr[2];
			this.arr[3] += v.arr[3];
		}
		sub(v) {
			this.arr[0] -= v.arr[0];
			this.arr[1] -= v.arr[1];
			this.arr[2] -= v.arr[2];
			this.arr[3] -= v.arr[3];
		}
		mul(x) {
			this.arr[0] *= x;
			this.arr[1] *= x;
			this.arr[2] *= x;
			this.arr[3] *= x;
		}
		div(x) {
			this.arr[0] /= x;
			this.arr[1] /= x;
			this.arr[2] /= x;
			this.arr[3] /= x;
		}
		dot(v) {
			return
				this.arr[0] * v.arr[0] +
				this.arr[1] * v.arr[1] +
				this.arr[2] * v.arr[2] +
				this.arr[3] * v.arr[3];
		}
		abs() {
			return Math.sqrt(
				Math.pow(this.arr[0], 2) +
				Math.pow(this.arr[1], 2) +
				Math.pow(this.arr[2], 2) +
				Math.pow(this.arr[3], 2)
			);
		}
		normalize() {
			this.div(this.abs());
		}
		copy() {
			return new this.constructor(
				this.arr[0],
				this.arr[1],
				this.arr[2],
				this.arr[3]
			);
		}
	},
	mat4: class {
		constructor(
			m00 = 1.0, m01 = 0.0, m02 = 0.0, m03 = 0.0,
			m10 = 0.0, m11 = 1.0, m12 = 0.0, m13 = 0.0,
			m20 = 0.0, m21 = 0.0, m22 = 1.0, m23 = 0.0,
			m30 = 0.0, m31 = 0.0, m32 = 0.0, m33 = 1.0,
		) {
			this.arr = new Float32Array([
				m00, m10, m20, m30,
				m01, m11, m21, m31,
				m02, m12, m22, m32,
				m03, m13, m23, m33
			]);
		}
		set(m){
			this.arr = this.arr.map((val, index) => m.arr[index]);
		}
		rmul(m) {
			let tmp = new Float32Array(16);
			for(let x = 0; x < 4; x++){
				for (let y = 0; y < 4; y++) {
					tmp[y + x * 4] = 0;
					for(let i = 0; i < 4; i++){
						tmp[y + x * 4] += this.arr[y + i * 4] * m.arr[i + x * 4];
					}
				}
			}
			this.arr = tmp;
		}
		lmul(m) {
			let tmp = new Float32Array(16);
			for (let x = 0; x < 4; x++) {
				for (let y = 0; y < 4; y++) {
					tmp[y + x * 4] = 0;
					for (let i = 0; i < 4; i++) {
						tmp[y + x * 4] += m.arr[y + i * 4] * this.arr[i + x * 4];
					}
				}
			}
			this.arr = tmp;
		}
		translate(x = 0, y = 0, z = 0){
			this.rmul(new GLMath.mat4(
				1, 0, 0, x,
				0, 1, 0, y,
				0, 0, 1, z,
				0, 0, 0, 1
			));
		}
		scale(x = 1, y = 1, z = 1, cx = 0, cy = 0, cz = 0) {
			this.translate(-cx, -cy, -cz);
			this.rmul(new GLMath.mat4(
				x, 0, 0, 0,
				0, y, 0, 0,
				0, 0, z, 0,
				0, 0, 0, 1
			));
			this.translate(cx, cy, cz);
		}
	},
	// 2直線の交点を算出する関数
	getCrossPos: (pa1, pa2, pb1, pb2) => {
		let s1 = ((pb2.x - pb1.x) * (pa1.y - pb1.y) - (pb2.y - pb1.y) * (pa1.x - pb1.x)) / 2;
		let s2 = ((pb2.x - pb1.x) * (pb1.y - pa2.y) - (pb2.y - pb1.y) * (pb1.x - pa2.x)) / 2;
		if (s1 + s2 === 0) return { "x": Infinity, "y": Infinity };
		return {
			"x": pa1.x + (pa2.x - pa1.x) * s1 / (s1 + s2),
			"y": pa1.y + (pa2.y - pa1.y) * s1 / (s1 + s2)
		};
	},
	// 法線の単位ベクトルを算出する関数
	getNormalVec: (p1, p2) => {
		let length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
		if (length === 0) return { "x": Infinity, "y": Infinity };
		return {
			"x": (p1.y - p2.y) / length,
			"y": (p2.x - p1.x) / length
		};
	}
};
