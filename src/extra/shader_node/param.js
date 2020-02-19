import { ConvertibleNodeParam } from "../../gui/templates/convertible_node_component.js";

export const ValueNodeParam = class extends ConvertibleNodeParam {
	constructor(type, name) {
		super(type, name);
		this.value = {};
		switch(this.type){
			case "int":
				this.value = {
					x: 0.0
				}
				this.color = {r: 0, g: 0.5568627450980392, b: 0.6666666666666666};
				break;
			case "float":
				this.value = {
					x: 0.0
				}
				this.color = {r: 0, g: 0.4666666666666667, b: 0.7843137254901961};
				break;
			case "ivec2":
				this.value = {
					x: 0.0,
					y: 0.0
				}
				this.color = {r: 0.6470588235294118, g: 0.09411764705882353, b: 0.5647058823529412};
				break;
			case "vec2":
				this.value = {
					x: 0.0,
					y: 0.0
				}
				this.color = {r: 0.8549019607843137, g: 0.09411764705882353, b: 0.5176470588235295};
				break;
			case "ivec3":
				this.value = {
					x: 0.0,
					y: 0.0,
					z: 0.0
				}
				this.color = {r: 0.8941176470588236, g: 0, b: 0.16862745098039217};
				break;
			case "vec3":
				this.value = {
					x: 0.0,
					y: 0.0,
					z: 0.0
				}
				this.color = {r: 0.996078431372549, g: 0.3137254901960784, b: 0};
				break;
			case "ivec4":
				this.value = {
					x: 0.0,
					y: 0.0,
					z: 0.0,
					w: 0.0
				}
				this.color = {r: 0.9372549019607843, g: 0.8745098039215686, b: 0};
				break;
			case "vec4":
				this.value = {
					x: 0.0,
					y: 0.0,
					z: 0.0,
					w: 0.0
				}
				this.color = {r: 0.5176470588235295, g: 0.7411764705882353, b: 0};
				break;
			case "mat2":
				this.value = {
					mat: []
				}
				this.color = {r: 0.5529411764705883, g: 0.7254901960784313, b: 0.792156862745098};
				break;
			case "mat3":
				this.value = {
					mat: []
				}
				this.color = {r: 0, g: 0.12549019607843137, b: 0.3568627450980392};
				break;
			case "mat4":
				this.value = {
					mat: []
				}
				this.color = {r: 0, g: 0.33725490196078434, b: 0.4392156862745098};
				break;
			case "frame":
				this.value = {
					frame: null
				}
				this.color = {r: 0.25882352941176473, g: 0.596078431372549, b: 0.7098039215686275};
				break;
			case "shader":
				this.value = {
					shader: null
				}
				this.color = {r: 0, g: 0.6235294117647059, b: 0.30196078431372547};
				break;
		}
	}
};