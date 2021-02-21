import { NodeParam } from "../../gui/templates/node_component.js";
import { NodeParams } from "../../gui/templates/node_component.js";
import { Node } from "../../gui/templates/node_component.js";
import { NodeCanvas } from "../../gui/templates/node_component.js";

export const ConvertibleNodeParam = class extends NodeParam {
	constructor(type, name, r = 0.3, g = 0.3, b = 0.3) {
		super(type, name, r, g, b);
	}
};

export const ConvertibleNodeParams = class extends NodeParams {
	constructor(x, y, size, gap, input, node) {
		super(x, y, size, gap, input, node);
	}
	add(child){
		if (!(child instanceof ConvertibleNodeParam)) return null;
		return super.add(child);
	}
};

export const ConvertibleNode = class extends Node {
	constructor() {
		super("", "", 0, 0);

		this.json = {
			"unique_id": 0,
			"type": "empty",
			"name": "",
			"x": 0.0,
			"y": 0.0,
			"w": 0.0,
			"h": 0.0,
			"inputs": [],
			"custom": {}
		};
	}
	setup(){
		super.setup();
		this.remove(this.inputs); this.remove(this.outputs);
		this.inputs = new ConvertibleNodeParams(0.0 - this.paramSize / 2.0, 0, this.paramSize, this.paramGap, true, this);
		this.outputs = new ConvertibleNodeParams(this.w - this.paramSize / 2.0, 0, this.paramSize, this.paramGap, false, this);
		this.add(this.inputs); this.add(this.outputs);
	}
	load(json){
		this.json = json;
		this.type = this.json["type"];
		this.target.x = this.x = this.json["x"];
		this.target.y = this.y = this.json["y"];
		this.resize(this.json["w"], this.json["h"]);
		this.rename(this.json["name"]);
	}
	connectInput(){
		const nodeList = this.parent.childs.filter(c => (c instanceof ConvertibleNode));
		this.json["inputs"].forEach(i => {
			if (i["srcNodeId"] === null) return;
			const node = nodeList.filter(n => (n.json["unique_id"] === i["srcNodeId"]));
			if (node.length !== 0) this.setInput(node[0], i["srcParamName"], i["thisParamName"]);
		});
	}
	save(){
		this.json["unique_id"] = this.parent.childs.indexOf(this);
		this.json["type"] = this.type;
		this.json["name"] = this.name;
		this.json["x"] = this.x;
		this.json["y"] = this.y;
		this.json["w"] = this.w;
		this.json["h"] = this.h;
		this.json["inputs"] = this.inputs.childs.map(c => {
			if (c.output !== null){
				return {
					"srcNodeId": c.output.node.json["unique_id"],
					"srcParamName": c.output.name,
					"thisParamName": c.name
				};
			}
			else{
				return {
					"srcNodeId": null,
					"srcParamName": null,
					"thisParamName": c.name
				};
			}
		});
		return this.json;
	}
};
export const ConvertibleNodeCanvas = class extends NodeCanvas {
	constructor(typeClassPair = {"empty": ConvertibleNode}) {
		super();
		this.json = [];
		this.typeClassPair = typeClassPair;
	}
	add(component){
		if (component instanceof ConvertibleNode) { return super.add(component); }
		else throw new TypeError();
	}
	load(json){
		this.json = json;
		this.json.forEach(j => {
			if (!this.typeClassPair.hasOwnProperty(j["type"])) return;
			const node = new this.typeClassPair[j["type"]];
			this.add(node);
			node.load(j);
		});
		this.childs.filter(c => (c instanceof ConvertibleNode)).forEach(n => n.connectInput());
	}
	save(){
		this.json = this.childs.map(c => c.save());
		return this.json;
	}
};
