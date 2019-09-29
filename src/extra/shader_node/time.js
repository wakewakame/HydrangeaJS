import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const TimeNode = class extends Node {
	constructor(x, y) {
		super("float", "time", x, y);
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
	}
	draw(){
		super.draw();
	}
};