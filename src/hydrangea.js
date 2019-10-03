import { EventListener } from "./utils/event_listener.js";
import { Graphics } from "./webgl/graphics.js";
import { GLCore } from "./webgl/core/core.js";
import { GLMath } from "./webgl/utils/math.js";
import { Component } from "./gui/component/component.js";
import { DefaultComponent, ResizeBox } from "./gui/component/default_component.js";
import { DraggableComponent } from "./gui/component/draggable_component.js";
import { RootComponent } from "./gui/component/root_component.js";
import { SwingComponent, SwingResizeBox } from "./gui/component/swing_component.js";
import { NodeCanvas, Node, NodeParams, NodeParam } from "./gui/templates/node_component.js";
import { Page, PageEvent } from "./gui/page/page.js";
import { FrameNode } from "./extra/shader_node/frame.js";
import { ValueNodeParam } from "./extra/shader_node/param.js";
import { PictureNode } from "./extra/shader_node/picture.js";
import { ShaderNode } from "./extra/shader_node/shader.js";
import { TimeNode } from "./extra/shader_node/time.js";
import { FloatNode } from "./extra/shader_node/value.js";

export const HydrangeaJS = {
	Utils: {
		EventListener: EventListener
	},
	WebGL: {
		Graphics: Graphics,
		GLCore: GLCore,
		EventListener: EventListener,
		GLMath: GLMath
	},
	GUI: {
		Component: {
			Component: Component,
			DefaultComponent: DefaultComponent,
			ResizeBox: ResizeBox,
			DraggableComponent: DraggableComponent,
			RootComponent: RootComponent,
			SwingComponent: SwingComponent,
			SwingResizeBox: SwingResizeBox
		},
		Templates: {
			NodeCanvas: NodeCanvas,
			Node: Node,
			NodeParams: NodeParams,
			NodeParam: NodeParam
		},
		Page: {
			Page: Page,
			PageEvent: PageEvent
		}
	},
	Extra: {
		ShaderNode: {
			FrameNode: FrameNode,
			ValueNodeParam: ValueNodeParam,
			PictureNode: PictureNode,
			ShaderNode: ShaderNode,
			TimeNode: TimeNode,
			FloatNode: FloatNode
		}
	}
};

window.HydrangeaJS = HydrangeaJS;