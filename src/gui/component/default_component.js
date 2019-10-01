import { Component } from "./component.js";
import { GLCore } from "../../webgl/core/core.js";

export const ResizeBox = class extends Component {
	constructor(){
		super(0.0, 0.0, 0.0, 0.0);
		this.name = "ResizeBox";
	}
	setup(){
		this.w = this.h = 20.0;
		this.x = this.parent.w - this.w;
		this.y = this.parent.h - this.h;
	}

	mouseEvent(type, x, y, start_x, start_y){
		if (this.mouseEventToChild(type, x, y, start_x, start_y)) return;
		switch(type) {
		case "HIT":
			break;
		case "DOWN":
			this.dragStartCompX = this.x;
			this.dragStartCompY = this.y;
			break;
		case "UP":
			
			break;
		case "CLICK":
			break;
		case "MOVE":
			break;
		case "DRAG":
			this.x = this.dragStartCompX + x - start_x;
			this.y = this.dragStartCompY + y - start_y;
			this.x = Math.max(0.0, this.x);
			this.y = Math.max(0.0, this.y);
			this.x = Math.max(this.parent.min_w - this.w, this.x);
			this.y = Math.max(this.parent.min_h - this.h, this.y);
			this.parent.resize(this.x + this.w, this.y + this.h);
			break;
		}
	}
};

export const DefaultComponent = class extends Component {
	constructor(x, y, w, h, r = 12.0, color = {r: 0.3, g: 0.3, b: 0.3}){
		super(x, y, w, h);
		this.name = "Empty Node";
		this.inner_shape = null;
		this.outer_shape = null;
		this.r = r;
		this.color = color;
		this.min_w = this.min_h = this.r * 2.0;
		this.resizeBox = null;
	}
	setup(){
		this.resizeBox = this.add(new ResizeBox());
		this.inner_shape = new GLCore.Shape(this.graphics.gapp);
		this.outer_shape = new GLCore.Shape(this.graphics.gapp);

		this.resize(this.w, this.h);
	}
	deleted(){
		if (this.inner_shape !== null) this.inner_shape.delete();
		if (this.outer_shape !== null) this.outer_shape.delete();
	}
	resize(w, h){
		this.w = Math.max(this.min_w, w);
		this.h = Math.max(this.min_h, h);

		const add_vertices = (shape, x, y, width, height, r, div) => {
			shape.vertex(x + r, y, 0, r / width, 1.0);
			shape.vertex(x + width - r, y, 0, (width - r) / width, 1.0);
			for(let i = 1; i < div; i++) shape.vertex(
				x + width  - r + r * Math.cos(Math.PI * (1.5 + 0.5 * i / div)),
				y          + r + r * Math.sin(Math.PI * (1.5 + 0.5 * i / div)),
				0,
				0.0 + (width  - r + r * Math.cos(Math.PI * (1.5 + 0.5 * i / div))) / width,
				1.0 - (0.0    + r + r * Math.sin(Math.PI * (1.5 + 0.5 * i / div))) / height
			);
			shape.vertex(x + width, y + r, 0, 1, 1.0 - r / height);
			shape.vertex(x + width, y + height - r, 0, 1, 1.0 - (height - r) / height);
			for(let i = 1; i < div; i++) shape.vertex(
				x + width  - r + r * Math.cos(Math.PI * (0.0 + 0.5 * i / div)),
				y + height - r + r * Math.sin(Math.PI * (0.0 + 0.5 * i / div)),
				0,
				0.0 + (width  - r + r * Math.cos(Math.PI * (0.0 + 0.5 * i / div))) / width,
				1.0 - (height - r + r * Math.sin(Math.PI * (0.0 + 0.5 * i / div))) / height
			);
			shape.vertex(x + width - r, y + height, 0, (width - r) / width, 0.0);
			shape.vertex(x + r, y + height, 0, r / width, 0.0);
			for(let i = 1; i < div; i++) shape.vertex(
				x          + r + r * Math.cos(Math.PI * (0.5 + 0.5 * i / div)),
				y + height - r + r * Math.sin(Math.PI * (0.5 + 0.5 * i / div)),
				0,
				0.0 + (0.0    + r + r * Math.cos(Math.PI * (0.5 + 0.5 * i / div))) / width,
				1.0 - (height - r + r * Math.sin(Math.PI * (0.5 + 0.5 * i / div))) / height
			);
			shape.vertex(x, y + height - r, 0, 0, 1.0 - (height - r) / height);
			shape.vertex(x, y + r, 0, 0, 1.0 - r / height);
			for(let i = 1; i < div; i++) shape.vertex(
				x          + r + r * Math.cos(Math.PI * (1.0 + 0.5 * i / div)),
				y          + r + r * Math.sin(Math.PI * (1.0 + 0.5 * i / div)),
				0,
				0.0 + (0.0        + r + r * Math.cos(Math.PI * (1.0 + 0.5 * i / div))) / width,
				1.0 - (0.0        + r + r * Math.sin(Math.PI * (1.0 + 0.5 * i / div))) / height
			);
		};
		const weight = 6.0;
		const div = 8;
		this.inner_shape.beginShape(this.inner_shape.gl.TRIANGLE_FAN);
		this.inner_shape.color(1.0, 1.0, 1.0, 1.0);
		add_vertices(this.inner_shape, weight * 0.5, weight * 0.5, this.w - weight, this.h - weight, this.r, div);
		this.inner_shape.endShape();
		this.outer_shape.beginShape(this.outer_shape.gl.TRIANGLE_FAN);
		this.outer_shape.color(this.color.r, this.color.g, this.color.b, 1.0);
		add_vertices(this.outer_shape, -weight * 0.5, -weight * 0.5, this.w + weight, this.h + weight, this.r + weight, div);
		this.outer_shape.endShape();
	}
	update(){
		/*
		if(this.parent !== null){
			this.x = Math.max(0.0, this.x);
			this.y = Math.max(0.0, this.y);
			this.x = Math.min(this.x, this.parent.w - this.w);
			this.y = Math.min(this.y, this.parent.h - this.h);
		}
		*/
	}
	draw(){
		this.graphics.shape(this.outer_shape);
		this.graphics.shape(this.inner_shape);
	}
};