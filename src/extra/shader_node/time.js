import { ConvertibleNode } from "../../gui/templates/convertible_node_component.js";
import { ValueNodeParam } from "./param.js";

export const TimeNode = class extends ConvertibleNode {
	constructor(x = 0, y = 0) {
		super();
		this.type = "time";
		this.name = "time";
		this.x = x;
		this.y = y;
		this.outputFloatNodeParam = null;
		this.outputIntNodeParam = null;
		this.time = 0;
	}
	setup(){
		super.setup();
		this.outputFloatNodeParam = this.outputs.add(new ValueNodeParam("float", "output time in seconds"));
		this.outputFloatNodeParam.value.x = 0.0;
		this.outputIntNodeParam = this.outputs.add(new ValueNodeParam("int", "output frame number"));
		this.outputIntNodeParam.value.x = 0.0;
		this.time = Date.now();
	}
	job(){
		super.job();
		this.outputFloatNodeParam.value.x = (Date.now() - this.time) / 1000.0;
		this.outputIntNodeParam.value.x += 1;
	}
	update(){
		super.update();
	}
	draw(){
		super.draw();
	}
};
