import { Node } from "../../gui/templates/node_component.js";
import { ValueNodeParam } from "./param.js";

export const TimeNode = class extends Node {
	constructor(x, y) {
		super("float", "time", x, y);
		this.outputFloatNodeParam = null;
		this.time = 0;
	}
	setup(){
		super.setup();
		this.outputFloatNodeParam = this.outputs.add(new ValueNodeParam("float", "output time"));
		this.outputFloatNodeParam.value.x = 0.0;
		this.time = Date.now();
	}
	job(){
		super.job();
		this.outputFloatNodeParam.value.x = (Date.now() - this.time) / 1000.0;
	}
	update(){
		super.update();
	}
	draw(){
		super.draw();
	}
};