import { Component } from "./component.js";
import { Graphics } from "../../webgl/graphics.js";
import { GLMath } from "../../webgl/utils/math.js";

export const RootComponent = class extends Component {
	constructor(canvas, enableZoom = true) {
		super(0, 0, canvas.width, canvas.height);

		this.graphics = new Graphics(canvas);
		this.name = "Root";
		this.mousePressed = false;
		this.pmousePressed = false;
		this.dragStartMouseX = 0.0;
		this.dragStartMouseY = 0.0;
		this.original = new GLMath.vec2(0.0, 0.0);
		this.mouse = new GLMath.vec2(0.0, 0.0);
		this.pmouse = new GLMath.vec2(0.0, 0.0);
		this.zoom = 1.0;
		this.wheel = 0.0;

		this.mouseX = 0.0;
		this.mouseY = 0.0;
		this.graphics.gapp.canvas.addEventListener("mousedown", (e) => {
			this.mousePressed = true;
		});
		this.graphics.gapp.canvas.addEventListener("mouseup", (e) => {
			this.mousePressed = false;
		});
		this.graphics.gapp.canvas.addEventListener("mousemove", (e) => {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
		});
		if (enableZoom) {
			this.graphics.gapp.canvas.addEventListener("wheel", (e) => {
				this.setZoom(e.deltaY * 0.001);
			});
		}

		this.setup();
	}
	update(){
		this.w = this.graphics.width;
		this.h = this.graphics.height;
		this.pmouse = this.mouse.copy();
		this.mouse.arr[0] = (this.mouseX - this.original.arr[0]) / this.zoom;
		this.mouse.arr[1] = (this.mouseY - this.original.arr[1]) / this.zoom;
		this.sendMouseEvent();
		super.update_sub();
	}
	draw(){
		this.graphics.pushMatrix();
		this.graphics.translate(this.original.arr[0], this.original.arr[1]);
		this.graphics.scale(this.zoom, this.zoom);
		this.draw_sub();
		this.graphics.popMatrix();
	};
	setZoom(wheel){
		this.wheel -= wheel;
		let post_zoom = Math.exp(this.wheel);
		this.original.arr[0] = this.mouseX + (this.original.arr[0] - this.mouseX) * (post_zoom / this.zoom);
		this.original.arr[1] = this.mouseY + (this.original.arr[1] - this.mouseY) * (post_zoom / this.zoom);
		this.zoom = post_zoom;
	}
	sendMouseEvent(){
		if ((!this.mousePressed) && this.dragFlag){
			this.childs[0].mouseEvent("UP", this.mouse.arr[0] - this.childs[0].x, this.mouse.arr[1] - this.childs[0].y, 0, 0);
			if(this.clickFlag) this.childs[0].mouseEvent("CLICK", this.mouse.arr[0] - this.childs[0].x, this.mouse.arr[1] - this.childs[0].y, 0, 0);
			this.dragFlag = false;
			this.clickFlag = false;
		}
		if(this.dragFlag){
			this.childs[0].mouseEvent("HIT", this.mouse.arr[0] - this.childs[0].x, this.mouse.arr[1] - this.childs[0].y, 0, 0);
			if(this.mouse.arr[0] !== this.pmouse.arr[0] || this.mouse.arr[1] !== this.pmouse.arr[1]){
				this.childs[0].mouseEvent("DRAG", this.mouse.arr[0] - this.childs[0].x, this.mouse.arr[1] - this.childs[0].y, this.dragStartMouseX - this.childs[0].x, this.dragStartMouseY - this.childs[0].y);
				this.clickFlag = false;
			}
		}
		else{
			for(let c of this.childs){
				if (c.checkHit(this.mouse.arr[0], this.mouse.arr[1])){
					c.mouseEvent("HIT", this.mouse.arr[0] - c.x, this.mouse.arr[1] - c.y, 0, 0);
					if(this.mouse.arr[0] !== this.pmouse.arr[0] || this.mouse.arr[1] !== this.pmouse.arr[1]){
						c.mouseEvent("MOVE", this.mouse.arr[0] - c.x, this.mouse.arr[1] - c.y, 0, 0);
					}
					if(this.mousePressed && !this.pmousePressed){
						this.activeChilds(c);
						c.mouseEvent("DOWN", this.mouse.arr[0] - c.x, this.mouse.arr[1] - c.y, 0, 0);
						this.dragStartMouseX = this.mouse.arr[0]; this.dragStartMouseY = this.mouse.arr[1];
						this.dragFlag = true;
						this.clickFlag = true;
					}
					break;
				}
				c.update();
			}
		}
		this.pmousePressed = this.mousePressed;
	}
};