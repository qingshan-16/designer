import {BezierEdge as LFBezierEdge, h} from "@logicflow/core";
import {JOINT_NODE, MULTICAST_NODE, PLUS_NODE,} from "@/constant/ComponentType";
import BezierEdge from "./BezierEdge.vue";
import {createVNode, render, type VNode} from "vue";
import {
    BASE_EDGE_LENGTH,
    BASE_EDGE_TEXT_HEIGHT,
    BASE_EDGE_TEXT_WIDTH,
    BASE_NODE_HEIGHT,
    BASE_NODE_WIDTH
} from "@/constant";

class BezierEdgeView extends LFBezierEdge {
    root: HTMLDivElement | undefined;

    vNode: VNode | undefined;

    isMounted = false;

    constructor(props: any) {
        super();
        const {model, graphModel} = props;
        this.root = document.createElement("div");
        // 创建虚拟节点，绑定父实例的上下文
        this.vNode = createVNode(BezierEdge, {
            model: model,
            graphModel: graphModel,
        });
        // 将主应用vue实例的_context 设置到虚拟节点的 appContext 上
        this.vNode.appContext = window.__VUE_APP_CONTEXT__;
    }

    componentWillUnmount() {
        // super.componentWillUnmount();
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

    toFront() {
    }

    componentDidMount() {
        const {model} = this.props;
        const {id} = model;
        this.root = document.querySelector(`#base-edge-${id}`) as HTMLDivElement;
        if (this.root?.childNodes.length === 0 && !this.isMounted && this.vNode) {
            render(this.vNode, this.root);
            this.isMounted = true;
        }
    }


    /**
     * 返回连线的自定义按钮
     * @returns 返回连线上的文本（此处为加号按钮）的dom
     */
    getText(): h.JSX.Element | null {
        const {model} = this.props;
        const {id} = model;

        // 连线的目标节点时"plus-node"，则不挂载添加按钮
        if ((model.targetNode.type as string) === PLUS_NODE) {
            return null;
        }

        const {
            customWidth = BASE_EDGE_TEXT_WIDTH,
            customHeight = BASE_EDGE_TEXT_HEIGHT,
        } = model.getProperties();

        const {startPoint, endPoint} = model;
        let positionData = {};
        if (
            (model.sourceNode.type as string) === MULTICAST_NODE ||
            (model.targetNode.type as string) === JOINT_NODE
        ) {
            // 不存在拐点，是个直线，且直线的源节点的类型是"multicast-node"、"joint-node"
            positionData = {
                // 如果是水平布局，即纵向坐标y值相等。则以目标节点x坐标为参照坐标计算
                x:
                    model.sourceNode.y === model.targetNode.y
                        ? model.targetNode.x -
                        (BASE_NODE_WIDTH / 2 + BASE_EDGE_LENGTH / 2) -
                        customWidth / 2
                        : (startPoint.x + endPoint.x - customWidth) / 2,
                // 如果是垂直布局，即横向坐标x值相等。则以目标节点y坐标为参照坐标计算
                y:
                    model.sourceNode.x === model.targetNode.x
                        ? model.targetNode.y -
                        (BASE_NODE_HEIGHT / 2 + BASE_EDGE_LENGTH / 2) -
                        customHeight / 2
                        : (startPoint.y + endPoint.y - customHeight) / 2,
                width: customWidth,
                height: customHeight,
            };
        } else {
            // 不存在拐点，单纯的正常情况下的直线
            positionData = {
                x: (startPoint.x + endPoint.x - customWidth) / 2,
                y: (startPoint.y + endPoint.y - customHeight) / 2,
                width: customWidth,
                height: customHeight,
            };
        }

        return h("foreignObject", {...positionData}, [
            h("div", {style: `display: flex; height: 100%; width: 100%`}, [
                h("div", {
                    id: `base-edge-${id}`,
                    className: "lf-custom-edge-wrapper x-bezier-edge",
                }),
            ]),
        ]);
    }
}

export default BezierEdgeView;

