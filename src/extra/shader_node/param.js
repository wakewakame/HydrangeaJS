import { NodeParam } from "../../gui/templates/node_component.js";

export const ValueNodeParam = class extends NodeParam {
	constructor(type, name) {
		super(type, name);
		this.value = {
			x: 0.0,
			y: 0.0,
			z: 0.0,
			w: 0.0,
			mat: [],
			texture: [],
			shader: null
		}
	}
};