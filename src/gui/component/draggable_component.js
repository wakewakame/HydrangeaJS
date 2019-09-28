import { Component } from "./component.js";

export const DraggableComponent = class extends Component {
	constructor(){
		super(0, 0, 0, 0);
		this.name = "Draggable area";
	}
	checkHit(px, py){
		/*
		if (
			0 < px &&
			0 < py &&
			px < this.parent.w &&
			py < this.parent.h
		) return true;
		*/
		return true;
		
		for(let c of this.childs){
			if(c.checkHit(px - this.x, py - this.y)) return true;
		}
		return false;
	}
};