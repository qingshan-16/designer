import {LogicFlow} from "@logicflow/core";
import * as dagre from "@dagrejs/dagre";
import {BASE_NODE_HEIGHT, BASE_NODE_WIDTH,} from "@/constant";
import Designer from "../Designer.ts";
import type {LayoutBase} from "./LayoutBase.ts";
import {Layout} from "@/type";

class DagreLayout implements LayoutBase {
    /**
     * 优化布局
     * @param data 流程的元数据
     * @returns
     */
    public layoutGraph(data: {
        nodes: LogicFlow.NodeConfig[];
        edges: LogicFlow.EdgeConfig[];
    }): Promise<any> {
        const result = {
            nodes: new Array<any>(),
        };
        const designer = Designer.getInstance();
        let graph = new dagre.graphlib.Graph();
        const rankdir = designer.layoutType === Layout.HORIZONTAL ? "RL" : "BT";
        // Set an object for the graph label
        graph.setGraph({
            rankdir,
            align: "",
            ranker: "longest-path",
            // acyclicer: 'greedy',
            // 距离画布的边界，不是开始节点的x坐标
            marginx: 560 - BASE_NODE_WIDTH / 2,
            // 距离画布的边界，不是开始节点的y坐标
            marginy: 300 - BASE_NODE_HEIGHT / 2,
            nodesep: 64,
            ranksep: 64,
        });

        // Default to assigning a new object as a label for each new edge.
        graph.setDefaultEdgeLabel(() => {
            return {};
        });

        data.nodes.forEach((node: LogicFlow.NodeConfig) => {
            graph.setNode(node.id!, {
                label: node.type,
                width: BASE_NODE_WIDTH,
                height: BASE_NODE_HEIGHT,
            });
        });

        // 反转连线的源节点和目标节点
        data.edges.forEach((edge: LogicFlow.EdgeConfig) => {
            graph.setEdge(edge.targetNodeId, edge.sourceNodeId);
        });

        dagre.layout(graph);
        graph.nodes().forEach((nodeId: string) => {
            const node = graph.node(nodeId);
            const newNode = {
                id: nodeId,
                data: {
                    x: node.x,
                    y: node.y,
                },
            };
            result.nodes.push(newNode);
        });
        return new Promise((resolve, reject) => {
            try {
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default DagreLayout;

export {DagreLayout};
