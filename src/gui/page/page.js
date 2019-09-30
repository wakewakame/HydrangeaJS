import { Component } from "../component/component.js";
import { RootComponent } from "../component/root_component.js";

export const Page = class {
	constructor(
		initCallback = (page) => {},
		loopCallback = (page) => {},
		fps = 60.0,
		dropCallback = (page, files) => {}
	) {
		this.loopCallback = loopCallback;
		this.dropCallback = dropCallback;
		this.fps = fps;
		this.rootElement = null;
		this.canvasElement = null;
		this.rootComponent = null;
		this.subRootComponent = null;
		this.childElements = [];

		const init = (e) => {
			document.body.style["position"] = "fixed";
			document.body.style["left"] = "0%";
			document.body.style["top"] = "0%";
			document.body.style["width"] = "100%";
			document.body.style["height"] = "100%";

			this.rootElement = document.createElement("div");
			this.rootElement.style["position"] = "fixed";
			this.rootElement.style["left"] = "0%";
			this.rootElement.style["top"] = "0%";
			this.rootElement.style["width"] = "100%";
			this.rootElement.style["height"] = "100%";
			document.body.appendChild(this.rootElement);

			this.canvasElement = this.addElement("canvas");

			this.rootComponent = new RootComponent(this.canvasElement);
			window.addEventListener("resize", (e) => {
				this.rootComponent.graphics.resize(window.innerWidth, window.innerHeight);
			});
			this.rootComponent.graphics.resize(window.innerWidth, window.innerHeight);

			const SubRootComponent = class extends Component {
				constructor(childElements) {
					super(0, 0, 0, 0);
					this.childElements = childElements;
				}
				update() {
					this.x = parent.x;
					this.y = parent.y;
					this.w = parent.w;
					this.h = parent.h;
					this.min_w = parent.min_w;
					this.min_h = parent.min_h;
					super.update();
				}
				mouseEvent(type, x, y, start_x, start_y){
					super.mouseEvent(type, x, y, start_x, start_y);
					if (type === "DOWN") this.childElements.forEach((e) => { e.style["pointer-events"] = "none"; });
					if (type === "UP")   this.childElements.forEach((e) => { e.style["pointer-events"] = "auto"; });
				}
			};
			this.subRootComponent = this.rootComponent.add(new SubRootComponent(this.childElements));

			document.body.addEventListener('dragover', (e) => {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}, false);
			document.body.addEventListener("drop", (e) => {
				e.stopPropagation();
				e.preventDefault();
				this.dropCallback(this, e.dataTransfer.files);
			}, false);

			initCallback(this);

			this.loop();
		};

		if (document.readyState !== "loading") init();
		else document.addEventListener("DOMContentLoaded", init);
	}

	loop() {
		this.rootComponent.graphics.clear();

		this.rootComponent.graphics.stroke(1.0, 1.0, 1.0, 0.0);
		this.rootComponent.graphics.fill(1.0, 1.0, 1.0, 1.0);
		this.rootComponent.graphics.rect(0, 0, this.rootComponent.w, this.rootComponent.h);

		this.loopCallback(this);

		this.rootComponent.update();
		this.rootComponent.draw();

		setTimeout(this.loop.bind(this), 1000.0 / this.fps);
	}

	addElement(name = "div", left = 0.0, top = 0.0, right = 1.0, bottom = 1.0, style = {}){
		let element = document.createElement("canvas");
		element.style["position"] = "fixed";
		element.style["left"] = "" + (left * 100.0) + "%";
		element.style["top"] = "" + (top * 100.0) + "%";
		element.style["width"] = "" + ((right - left) * 100.0) + "%";
		element.style["height"] = "" + ((bottom - top) * 100.0) + "%";
		for(let key of Object.keys(style)) {
			element.style[key] = style[key];
		}
		this.rootElement.appendChild(element);
		this.childElements.push(element);
		return element;
	}

	addComponent(component){
		return this.subRootComponent.add(component);
	}
};