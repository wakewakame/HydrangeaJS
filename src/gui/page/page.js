import { Component } from "../component/component.js";
import { RootComponent } from "../component/root_component.js";

export const PageEvent = class {
	constructor() {}
	init(page) {}
	loop(page) {}
	dropFiles(page, files) {}
};

export const Page = class {
	constructor(
		pageEvent = new PageEvent(),
		fps = 60.0
	) {
		this.pageEvent = pageEvent;
		this.fps = fps;
		this.rootElement = null;
		this.canvasElement = null;
		this.rootComponent = null;
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

			this.canvasElement.addEventListener("mousedown", (e) => {
				this.childElements.forEach((e) => {
					if (e !== this.canvasElement) e.style["pointer-events"] = "none";
				});
			});
			this.canvasElement.addEventListener("mouseup", (e) => {
				this.childElements.forEach((e) => {
					if (e !== this.canvasElement) e.style["pointer-events"] = "auto";
				});
			});

			document.body.addEventListener('dragover', (e) => {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}, false);
			document.body.addEventListener("drop", (e) => {
				e.stopPropagation();
				e.preventDefault();
				this.pageEvent.dropFiles(this, e.dataTransfer.files);
			}, false);

			this.pageEvent.init(this);

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

		this.pageEvent.loop(this);

		this.rootComponent.update();
		this.rootComponent.draw();

		setTimeout(this.loop.bind(this), 1000.0 / this.fps);
	}

	addElement(name = "div", left = 0.0, top = 0.0, right = 1.0, bottom = 1.0, style = {}){
		let element = document.createElement(name);
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
		return this.rootComponent.add(component);
	}
};