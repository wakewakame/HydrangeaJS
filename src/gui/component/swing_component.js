import { DefaultComponent, ResizeBox } from "./default_component.js";

export const SwingResizeBox = class extends ResizeBox {
	constructor(){
		super();
		this.name = "SwingResizeBox";

		this.accelerator = {x: 0.0, y: 0.0};
		this.velocity = {x: 0.0, y: 0.0};
		this.target = {x: 0.0, y: 0.0};
	}
	setup() {
		super.setup();
		this.w = this.h = 20.0;
		this.x = this.parent.w - this.w;
		this.y = this.parent.h - this.h;
		this.target = {x: this.x, y: this.y};
	}
	update() {
		super.update();
		this.velocity.x *= this.parent.param1; this.velocity.y *= this.parent.param1;
		this.accelerator = {x: this.target.x, y: this.target.y};
		this.accelerator.x -= this.x; this.accelerator.y -= this.y;
		this.accelerator.x *= this.parent.param2; this.accelerator.y *= this.parent.param2;
		this.velocity.x += this.accelerator.x; this.velocity.y += this.accelerator.y;
		this.x += this.velocity.x; this.y += this.velocity.y;
		this.target.x = Math.max(0.0, this.target.x);
		this.target.y = Math.max(0.0, this.target.y);
		this.target.x = Math.max(this.parent.min_w - this.w, this.target.x);
		this.target.y = Math.max(this.parent.min_h - this.h, this.target.y);
	}
	mouseEvent(type, x, y, start_x, start_y) {
		if (this.mouseEventToChild(type, x, y, start_x, start_y)) return;
		switch(type) {
		case "HIT":
			break;
		case "DOWN":
			this.dragStartCompX = this.target.x;
			this.dragStartCompY = this.target.y;
			break;
		case "UP":
			break;
		case "CLICK":
			break;
		case "MOVE":
			break;
		case "DRAG":
			this.target.x = this.dragStartCompX + x - start_x;
			this.target.y = this.dragStartCompY + y - start_y;
			break;
		}
	}
};

export const SwingComponent = class extends DefaultComponent {
	constructor(x, y, w, h, r = 12.0, param1 = 0.74, param2 = 0.1){
		super(x, y, w, h, r);
		this.name = "Swing Node";

		this.param1 = param1;
		this.param2 = param2;

		this.accelerator = {x: 0.0, y: 0.0};
		this.velocity = {x: 0.0, y: 0.0};
		this.target = {x: 0.0, y: 0.0};
	}
	setup() {
		super.setup();
		this.target = {x: this.x, y: this.y};
		this.remove(this.resizeBox);
		this.resizeBox = this.add(new SwingResizeBox());
	}
	update() {
		super.update();
		this.velocity.x *= this.param1; this.velocity.y *= this.param1;
		this.accelerator = {x: this.target.x, y: this.target.y};
		this.accelerator.x -= this.x; this.accelerator.y -= this.y;
		this.accelerator.x *= this.param2; this.accelerator.y *= this.param2;
		this.velocity.x += this.accelerator.x; this.velocity.y += this.accelerator.y;
		this.x += this.velocity.x; this.y += this.velocity.y;
		if (
			(Math.abs(this.w - (this.resizeBox.x + this.resizeBox.w)) >= 1.0) || 
			(Math.abs(this.h - (this.resizeBox.y + this.resizeBox.h)) >= 1.0)
		) {
			super.resize(this.resizeBox.x + this.resizeBox.w, this.resizeBox.y + this.resizeBox.h);
		}
	}
	resize(w, h){
		if (!(this.resizeBox instanceof SwingResizeBox)) {
			super.resize(w, h);
			return;
		}
		super.resize(this.w, this.h);
		this.resizeBox.target.x = w - this.resizeBox.w;
		this.resizeBox.target.y = h - this.resizeBox.h;
	}
	mouseEvent(type, x, y, start_x, start_y) {
		if (this.mouseEventToChild(type, x, y, start_x, start_y)) return;
		this.trigger(type, {
			component: this, x: x, y: y, start_x: start_x, start_y: start_y
		});
		switch(type) {
		case "HIT":
			break;
		case "DOWN":
			this.dragStartCompX = this.target.x;
			this.dragStartCompY = this.target.y;
			break;
		case "UP":
			break;
		case "CLICK":
			break;
		case "MOVE":
			break;
		case "DRAG":
			this.target.x = this.dragStartCompX + x - start_x;
			this.target.y = this.dragStartCompY + y - start_y;
			break;
		}
	}
};