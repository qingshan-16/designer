import {h, HtmlNode} from "@logicflow/core";
import {createVNode, render, type VNode} from "vue";
import BaseNode from "./BaseNode.vue";

class BaseNodeView extends HtmlNode {
    root: HTMLDivElement | undefined;

    vNode: VNode | undefined;

    isMounted = false;

    constructor(props: any) {
        super(props);
        const {model, graphModel} = props;
        this.root = document.createElement("div");
        this.root.className = "lf-custom-node-wrapper";
        this.root.id = model.id;
        // 创建虚拟节点，绑定父实例的上下文
        this.vNode = createVNode(BaseNode, {
            model: model,
            graphModel: graphModel,
            isSelected: props.model.isSelected,
            isHovered: model.isHovered,
        });
        // 将主应用vue实例的_context 设置到虚拟节点的 appContext 上
        this.vNode.appContext = window.__VUE_APP_CONTEXT__;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.isMounted && this.root) {
            // 卸载时销毁虚拟节点
            render(null, this.root);
            this.root.innerHTML = "";
            this.vNode = undefined;
        }
        if (this.root) {
            this.root.innerHTML = "";
        }
    }

    /**
     * 此方法回去调用model.setZIndex()方法
     * 此方法(setZIndex())会导致动画效果再次被触发，所以重写了
     */
    toFront() {
    }

    // 目前只比较properties中的locale属性的是否变化，
    // shouldUpdate(): boolean {
    //   if (
    //     this.preProperties &&
    //     JSON.parse(this.preProperties).locale ===
    //       this.props.model.properties.locale
    //   ) {
    //     this.preProperties = this.currentProperties;
    //     return false;
    //   }
    //   this.preProperties = this.currentProperties;
    //   return true;
    // }

    setHtml(rootEl: SVGForeignObjectElement): void {
        if (!this.root) return;
        rootEl.appendChild(this.root);
        if (!this.isMounted && this.vNode) {
            // 直接渲染到 DOM，共享父实例上下文
            render(this.vNode, this.root);
            this.isMounted = true;
        }
    }

    getAnchorShape(anchorData: any) {
        const {x, y, type} = anchorData;
        return h("rect", {
            x: x - 3,
            y: y - 3,
            width: 6,
            height: 6,
            className: `custom-anchor ${type === "in" ? "in-anchor" : "out-anchor"}`,
        });
    }
}

export default BaseNodeView;
