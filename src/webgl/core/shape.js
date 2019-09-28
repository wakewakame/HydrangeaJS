import { App } from "./app.js";
import { GLMath } from "../utils/math.js";
import { Shader } from "./shader.js";

export const Shape = class {
	constructor(app) {
		if (!(app instanceof App)) throw new TypeError();
		this.app = app;
		this.gl = this.app.gl;
		this.mode;
		this.loop;
		this.weight;
		this.vertices = [];
		this.vertices_buffer = this.gl.createBuffer();
		this.r = 0.0; this.g = 0.0; this.b = 0.0; this.a = 1.0;
	}
	// シェイプの描画開始関数(以降に呼ばれるvertex関数で頂点を登録)
	beginShape(mode = this.gl.LINE_STRIP) {
		this.mode = mode;
		this.vertices = [];
	}
	// シェイプの描画終了関数
	endShape() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertices_buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.DYNAMIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}
	// シェイプの描画関数
	drawShape(shader) {
		if (!(shader instanceof Shader)) throw new TypeError();
		if (!("position" in shader.attributes_location)) { console.error("attributes position does not exist in vectex shader."); return; }
		if (!("uv" in shader.attributes_location)) { console.error("attributes uv does not exist in vectex shader."); return; }
		if (!("color" in shader.attributes_location)) { console.error("attributes color does not exist in vectex shader."); return; }
		this.gl.useProgram(shader.program);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertices_buffer);
		this.gl.enableVertexAttribArray(shader.attributes_location["position"]);
		this.gl.enableVertexAttribArray(shader.attributes_location["uv"]);
		this.gl.enableVertexAttribArray(shader.attributes_location["color"]);
		this.gl.vertexAttribPointer(shader.attributes_location["position"], 3, this.gl.FLOAT, false, 9 * 4, 0 * 4);
		this.gl.vertexAttribPointer(shader.attributes_location["uv"], 2, this.gl.FLOAT, false, 9 * 4, 3 * 4);
		this.gl.vertexAttribPointer(shader.attributes_location["color"], 4, this.gl.FLOAT, false, 9 * 4, 5 * 4);
		this.gl.drawArrays(this.mode, 0, this.vertices.length / 9);
		this.gl.disableVertexAttribArray(shader.attributes_location["position"]);
		this.gl.disableVertexAttribArray(shader.attributes_location["uv"]);
		this.gl.disableVertexAttribArray(shader.attributes_location["color"]);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}
	// 頂点追加関数(beginShape()-endShape()の間、もしくはbeginWeightShape()-endWeightShape()の間で実行する)
	vertex(x, y, z, u = 0.0, v = 0.0) {
		x = parseFloat(x);
		y = parseFloat(y);
		z = parseFloat(z);
		u = parseFloat(u);
		v = parseFloat(v);
		Array.prototype.push.apply(this.vertices, [
			x, y, z,
			u, v,
			this.r, this.g, this.b, this.a
		]);
	}
	// 頂点色指定関数(vertex()の直線で実行)
	color(r, g, b, a = 1.0) {
		r = parseFloat(r);
		g = parseFloat(g);
		b = parseFloat(b);
		a = parseFloat(a);
		this.r = r; this.g = g; this.b = b; this.a = a;
	}
	// 太さの指定が可能なbeginShape()
	beginWeightShape(weight, loop = false) {
		this.beginShape(this.gl.TRIANGLE_STRIP);
		this.weight = weight;
		this.loop = loop;
	}
	// beginWeightShape()の終了
	endWeightShape(){

		// 頂点をループさせるかどうかの判定
		if (this.loop) {
			Array.prototype.push.apply(this.vertices, this.vertices.slice(0, 9));
		}

		// 頂点情報を一時変数に代入
		const tmp_vertices = this.vertices.slice();

		// 一旦vertecesを空にしてendShapeを呼び、再度beginShapeを開始
		this.vertices = [];
		this.endShape();
		this.beginShape(this.gl.TRIANGLE_STRIP);

		// 線の本数分ループ
		for (let i = 0; i < (tmp_vertices.length / 9) - 1; i++){

			// 直線の先端の点
			const v1 = tmp_vertices.slice((i + 0) * 9, (i + 1) * 9);
			const p1 = {
				"x": v1[0],
				"y": v1[1]
			};

			// 直線の終端の点
			const v2 = tmp_vertices.slice((i + 1) * 9, (i + 2) * 9);
			const p2 = {
				"x": v2[0],
				"y": v2[1]
			};
			
			// 直線の法線の単位ベクトル
			const normal = GLMath.getNormalVec(p1, p2);

			// 生成される直線の先端の上側
			const p1_up = {
				"x": p1.x + normal.x * this.weight,
				"y": p1.y + normal.y * this.weight,
			};
			const v1_up = v1.slice(); v1_up[0] = p1_up.x; v1_up[1] = p1_up.y;
			Array.prototype.push.apply(this.vertices, v1_up);
			// 生成される直線の先端の下側
			const p1_dw = {
				"x": p1.x - normal.x * this.weight,
				"y": p1.y - normal.y * this.weight,
			};
			const v1_dw = v1.slice(); v1_dw[0] = p1_dw.x; v1_dw[1] = p1_dw.y;
			Array.prototype.push.apply(this.vertices, v1_dw);
			// 生成される直線の終端の上側
			const p2_up = {
				"x": p2.x + normal.x * this.weight,
				"y": p2.y + normal.y * this.weight,
			};
			const v2_up = v2.slice(); v2_up[0] = p2_up.x; v2_up[1] = p2_up.y;
			Array.prototype.push.apply(this.vertices, v2_up);
			// 生成される直線の終端の上側
			const p2_dw = {
				"x": p2.x - normal.x * this.weight,
				"y": p2.y - normal.y * this.weight,
			};
			const v2_dw = v2.slice(); v2_dw[0] = p2_dw.x; v2_dw[1] = p2_dw.y;
			Array.prototype.push.apply(this.vertices, v2_dw);

		}

		// 頂点をループさせる場合、先端と終端を結合する
		if (this.loop) {
			Array.prototype.push.apply(this.vertices, this.vertices.slice(0, 18));
		}

		// 描画
		this.endShape();
	}
	delete() {
		this.gl.deleteBuffer(this.vertices_buffer);
	}
};