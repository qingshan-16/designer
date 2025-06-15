import {h, LogicFlow, PolylineEdge} from "@logicflow/core";
import {JOINT_NODE, MULTICAST_NODE, PLUS_NODE,} from "@/constant/ComponentType";
import {createVNode, render, type VNode} from "vue";
import {
    BASE_EDGE_LENGTH,
    BASE_EDGE_TEXT_HEIGHT,
    BASE_EDGE_TEXT_WIDTH,
    BASE_NODE_HEIGHT,
    BASE_NODE_WIDTH,
} from "@/constant";
import BaseEdge from "./BaseEdge.vue";

type DirectionType = "t" | "b" | "l" | "r" | "";
type ArcQuadrantType = "tl" | "tr" | "bl" | "br" | "-";

const directionMap: {
    [key: string]: ArcQuadrantType;
} = {
    tr: "tl",
    lb: "tl",
    tl: "tr",
    rb: "tr",
    br: "bl",
    lt: "bl",
    bl: "br",
    rt: "br",
};

function pointFilter(points: number[][]) {
    const all = points;
    let i = 1;
    while (i < all.length - 1) {
        const [x, y] = all[i - 1];
        const [x1, y1] = all[i];
        const [x2, y2] = all[i + 1];
        if ((x === x1 && x1 === x2) || (y === y1 && y1 === y2)) {
            all.splice(i, 1);
        } else {
            i++;
        }
    }
    return all;
}

function getMidPoints(
    cur: LogicFlow.PointTuple,
    key: string,
    orientation: ArcQuadrantType,
    radius: number,
) {
    const mid1 = [cur[0], cur[1]];
    const mid2 = [cur[0], cur[1]];
    switch (orientation) {
        case "tl": {
            if (key === "tr") {
                mid1[1] += radius;
                mid2[0] += radius;
            } else if (key === "lb") {
                mid1[0] += radius;
                mid2[1] += radius;
            }
            return [mid1, mid2];
        }
        case "tr": {
            if (key === "tl") {
                mid1[1] += radius;
                mid2[0] -= radius;
            } else if (key === "rb") {
                mid1[0] -= radius;
                mid2[1] += radius;
            }
            return [mid1, mid2];
        }
        case "bl": {
            if (key === "br") {
                mid1[1] -= radius;
                mid2[0] += radius;
            } else if (key === "lt") {
                mid1[0] += radius;
                mid2[1] -= radius;
            }
            return [mid1, mid2];
        }
        case "br": {
            if (key === "bl") {
                mid1[1] -= radius;
                mid2[0] -= radius;
            } else if (key === "rt") {
                mid1[0] -= radius;
                mid2[1] -= radius;
            }
            return [mid1, mid2];
        }
        default:
            return [];
    }
}

function getPartialPath(
    prev: LogicFlow.PointTuple,
    cur: LogicFlow.PointTuple,
    next: LogicFlow.PointTuple,
    radius: number,
): string {
    let dir1: DirectionType = "";
    let dir2: DirectionType = "";

    if (prev[0] === cur[0]) {
        dir1 = prev[1] > cur[1] ? "t" : "b";
    } else if (prev[1] === cur[1]) {
        dir1 = prev[0] > cur[0] ? "l" : "r";
    }

    if (cur[0] === next[0]) {
        dir2 = cur[1] > next[1] ? "t" : "b";
    } else if (cur[1] === next[1]) {
        dir2 = cur[0] > next[0] ? "l" : "r";
    }

    const r =
        Math.min(
            Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) / 2,
            Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 2,
            radius,
        ) || (1 / 5) * radius;

    const key = `${dir1}${dir2}`;
    const orientation: ArcQuadrantType = directionMap[key] || "-";
    let path = `L ${prev[0]} ${prev[1]}`;

    if (orientation === "-") {
        path += `L ${cur[0]} ${cur[1]} L ${next[0]} ${next[1]}`;
    } else {
        const [mid1, mid2] = getMidPoints(cur, key, orientation, r);
        if (mid1 && mid2) {
            path += `L ${mid1[0]} ${mid1[1]} Q ${cur[0]} ${cur[1]} ${mid2[0]} ${mid2[1]}`;
            [cur[0], cur[1]] = mid2;
        }
    }
    return path;
}

function getCurvedEdgePath(points: number[][], radius: number): string {
    let i = 0;
    let d = "";
    if (points.length === 2) {
        d += `M${points[i][0]} ${points[i++][1]} L ${points[i][0]} ${points[i][1]}`;
    } else {
        d += `M${points[i][0]} ${points[i++][1]}`;
        for (; i + 1 < points.length;) {
            const prev = points[i - 1] as LogicFlow.PointTuple;
            const cur = points[i] as LogicFlow.PointTuple;
            const next = points[i++ + 1] as LogicFlow.PointTuple;
            d += getPartialPath(prev, cur, next, radius as number);
        }
        d += `L ${points[i][0]} ${points[i][1]}`;
    }
    return d;
}

class BaseEdgeView extends PolylineEdge {
    root: HTMLDivElement | undefined;

    vNode: VNode | undefined;

    isMounted = false;

    constructor(props: any) {
        super();
        const {model, graphModel} = props;
        this.root = document.createElement("div");
        // 创建虚拟节点，绑定父实例的上下文
        this.vNode = createVNode(BaseEdge, {
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

        const {startPoint, endPoint, pointsList} = model;
        let positionData = {};
        // 当出现拐点时，Vue的视图会以foreignObject元素的x、y坐标为原点渲染（我也不知道为什么）
        // 所以想要以foreignObject元素的x、y坐标为中心点渲染，则需要偏移
        // qingshan
        // 存在拐点，是个弯折的线
        if (pointsList.length > 2) {
            positionData = {
                // 使用第一个拐点的位置
                x: pointsList[1].x - BASE_EDGE_TEXT_WIDTH / 2,
                y: pointsList[1].y - BASE_EDGE_TEXT_HEIGHT / 2,
                width: customWidth,
                height: customHeight,
            };
        } else if (
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
                    className: "lf-custom-edge-wrapper x-base-edge",
                }),
            ]),
        ]);
    }

    getEdge(): h.JSX.Element {
        const {model} = this.props;
        const {points: pointsStr, isAnimation, arrowConfig, radius = 16} = model;
        const style = model.getEdgeStyle();
        const animationStyle = model.getEdgeAnimationStyle();
        const points = pointFilter(
            pointsStr.split(" ").map((p) => p.split(",").map((a) => +a)),
        );
        const d = getCurvedEdgePath(points, radius as number);
        const attrs = {
            style: isAnimation ? animationStyle : {},
            ...style,
            ...arrowConfig,
            fill: "none",
        };
        return h("path", {
            d,
            ...attrs,
        });
    }
}

export default BaseEdgeView;
