import {LogicFlow} from "@logicflow/core";
import {BASE_NODE_HEIGHT, BASE_NODE_WIDTH, END_NODE_ID, START_NODE_ID,} from "@/constant";
import type {LayoutBase} from "./LayoutBase.ts";
import XNode from "@/core/layout/xlayout/XNode.ts";
import XEdge from "@/core/layout/xlayout/XEdge.ts";
import {MULTICAST_NODE} from "@/constant/ComponentType.ts";
import XLayout from "@/core/layout/xlayout/XLayout.ts";
import Designer from "@/core/Designer.ts";
import {Layout} from "@/type";

/**
 * 自定义布局算法
 */
class CustomLayout implements LayoutBase {
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
        const allNodes = new Array<XNode>();
        const allEdges = new Array<XEdge>();
        let startNode = new XNode();
        let endNode = new XNode();
        // 填充节点
        data.nodes.forEach((node: LogicFlow.NodeConfig) => {
            const xNode = new XNode();
            xNode.setId(node.id!);
            xNode.setWidth(BASE_NODE_WIDTH);
            xNode.setHeight(BASE_NODE_HEIGHT);
            xNode.setIsBranch(false);
            xNode.setWeight(
                node.properties && node.properties.weight ? node.properties.weight : 0,
            );
            // 分支节点特殊处理
            if (node.type === MULTICAST_NODE) {
                xNode.setIsBranch(true);
                xNode.setJoinNodeId(node.properties!.jointNodeId);
            }
            allNodes.push(xNode);
            if (node.id === START_NODE_ID) {
                startNode = xNode;
            }
            if (node.id === END_NODE_ID) {
                endNode = xNode;
            }
        });

        // 填充连线
        data.edges.forEach((edge: LogicFlow.EdgeConfig) => {
            const xEdge = new XEdge();
            xEdge.setId(edge.id!);
            xEdge.setSourceId(edge.sourceNodeId);
            xEdge.setTargetId(edge.targetNodeId);
            allEdges.push(xEdge);
        });

        const horizontalSpacing =
            designer.layoutType === Layout.HORIZONTAL
                ? BASE_NODE_WIDTH + 64
                : BASE_NODE_WIDTH + 64;
        const verticalSpacing =
            designer.layoutType === Layout.HORIZONTAL
                ? BASE_NODE_HEIGHT + 64
                : BASE_NODE_HEIGHT + 64;
        const rankdir = designer.layoutType === Layout.HORIZONTAL ? "LR" : "TB";
        const xLayout = new XLayout(
            allNodes,
            allEdges,
            startNode,
            endNode,
            horizontalSpacing,
            verticalSpacing,
            rankdir,
        );

        // 执行布局计算
        const loyoutedXNodes = xLayout.layout();

        loyoutedXNodes.forEach((xNode: XNode) => {
            const newNode = {
                id: xNode.getId(),
                data: {
                    x: xNode.getX(),
                    // y轴坐标反转，以适应屏幕的坐标系（屏幕坐标系右下为正），布局算法在进行计算时，坐标系为数学坐标系，即右上为正
                    // 这个细节很关键
                    y: xNode.getY() * -1,
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

export default CustomLayout;

export {CustomLayout};
