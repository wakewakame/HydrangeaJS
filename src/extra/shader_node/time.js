import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const TimeNode = class extends Node {
	constructor(name, x, y) {
		super(name, x, y);
		this.outputFloatNodeParam = null;	}
	setup(){
		super.setup();
		this.outputFloatNodeParam = this.outputs.add(new ValueNodeParam("float", "output"));
		this.outputFloatNodeParam.value.x = 0.0;
	}
	job(){
		super.job();
		this.outputFloatNodeParam.value.x += 0.01;
	}
	update(){
		super.update();
		if (this.parent.childs[0] === this)	{
			this.reset();
			this.job();
		}
	}
	draw(){
		super.draw();
		this.graphics.fill(1.0, 0.0, 0.0, 1.0);
		this.graphics.stroke(0.0, 0.0, 0.0, 0.0);
		this.graphics.rect(10, 10, 20, 20);
	}
};