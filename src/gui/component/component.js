import { GLMath } from "../../webgl/utils/math.js";
import { EventListener } from "../../utils/event_listener.js";

export const Component = class extends EventListener {
	constructor(x, y, w, h) {
		super();
		this.graphics = null;
		this.parent = null;
		this.name = "Empty";
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.min_w = 0.0;
		this.min_h = 0.0;
		this.childs = [];
		this.dragFlag = false;
		this.clickFlag = false;
		this.dragStartCompX = 0.0;
		this.dragStartCompY = 0.0;
	}
	setup(){}
	update(){}
	update_sub(){
		this.w = Math.max(this.min_w, this.w);
		this.h = Math.max(this.min_h, this.h);
		for(let i = 0; i < this.childs.length; i++){
			this.childs[i].update();
			this.childs[i].update_sub();
		}
	}
	draw(){}
	draw_sub(){
		for(let i = this.childs.length - 1; i >= 0; i--){
			this.graphics.pushMatrix();
			this.graphics.translate(this.childs[i].x, this.childs[i].y);
			this.childs[i].draw();
			this.childs[i].draw_sub();
			this.graphics.popMatrix();
		}
	}
	deleted() {}
	add(child){
		this.childs.push(child);
		child.graphics = this.graphics;
		child.parent = this;
		child.setup();
		return child;
	}
	remove(child){
		let index = this.childs.findIndex((c) => c === child);
		if (index !== -1) {
			for(let c of child.childs.concat()) child.remove(c);
			this.childs.splice(index, 1);
			child.deleted();
			child.graphics = null;
			child.parent = null;
		}
	}
	setMinSize(min_w, min_h){
		this.min_w = min_w;
		this.min_h = min_h;
	}
	mouseEvent(type, x, y, start_x, start_y){
		if (this.mouseEventToChild(type, x, y, start_x, start_y)) return;
		this.trigger(type, {
			component: this, x: x, y: y, start_x: start_x, start_y: start_y
		});
		switch(type){
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
				break;
		}
	}
	mouseEventToChild(type, x, y, start_x, start_y){
		if (type === "UP" && (this.dragFlag || this.clickFlag)){
			this.childs[0].mouseEvent(type, x - this.childs[0].x, y - this.childs[0].y, start_x - this.childs[0].x, start_y - this.childs[0].y);
			this.dragFlag = false;
			this.clickFlag = false;
		}
		if(this.dragFlag) {
			this.childs[0].mouseEvent(type, x - this.childs[0].x, y - this.childs[0].y, start_x - this.childs[0].x, start_y - this.childs[0].y);
			return true;
		}
		else{
			for(let c of this.childs){
				if (c.checkHit(x, y)){
					switch(type){
						case "DOWN":
							this.activeChilds(c);
							c.mouseEvent(type, x - c.x, y - c.y, start_x - c.x, start_y - c.y);
							this.dragFlag = true;
							this.clickFlag = true;
							break;
						case "UP":
						case "DRAG":
							break;
						default:
							c.mouseEvent(type, x - c.x, y - c.y, start_x - c.x, start_y - c.y);
							break;
					}
					return true;
				}
			}
		}
		return false;
	}
	checkHit(px, py){
		if (
			this.x < px &&
			this.y < py &&
			px < this.x + this.w &&
			py < this.y + this.h
		) return true;
		for(let c of this.childs){
			if(c.checkHit(px - this.x, py - this.y)) return true;
		}
		return false;
	}
	getHit(px, py){
		for(let c of this.childs){
			if (c.checkHit(px, py)){
				return c.getHit(px - c.x, py - c.y);
			}
		}
		if (0.0 <= px && 0.0 <= py && px < this.w && py < this.h) return this;
		return null;
	}
	getRootComponent(){
		return (this.parent !== null)?this.parent.getRootComponent():this;
	}
	getGrobalPos(px, py){
		if(this.parent === null) return new GLMath.vec2(this.x + px, this.y + py);
		else return this.parent.getGrobalPos(this.x + px, this.y + py);
	}
	activeChilds(c){
		let index = -1;
		for(let i = 0; i < this.childs.length; i++){
			if(c === this.childs[i]) {
				index = i;
				break;
			}
		}
		if(index === -1) return;
		for(let i = 0; i < index; i++){
			this.swapChilds(index - i, index - i - 1);
		}
	}
	swapChilds(index1, index2){
		let tmp = this.childs[index1];
		this.childs[index1] = this.childs[index2];
		this.childs[index2] = tmp;
	}
}