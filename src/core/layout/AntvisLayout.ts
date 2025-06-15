import {DagreLayout, type DagreLayoutOptions} from "@antv/layout/lib/dagre";
import {Graph} from "@antv/graphlib";
import {LogicFlow} from "@logicflow/core";
import {BASE_NODE_HEIGHT, BASE_NODE_WIDTH,} from "@/constant";
import Designer from "../Designer.ts";
import type {LayoutBase} from "./LayoutBase.ts";
import {Layout} from "@/type";

class AntvisLayout implements LayoutBase {
    /**
     * 优化布局
     * @param data 流程的元数据
     * @returns
     */
    public layoutGraph(data: {
        nodes: LogicFlow.NodeConfig[];
        edges: LogicFlow.EdgeConfig[];
    }): Promise<any> {
        const designer = Designer.getInstance();
        if (designer.layoutType === Layout.HORIZONTAL) {
            const nodes: any[] = [];
            const edges: any[] = [];
            data.nodes.forEach((node: LogicFlow.NodeConfig) => {
                nodes.push({
                    id: node.id,
                    type: node.type,
                    // x: node.x,
                    // y: node.y,
                    data: {
                        width: BASE_NODE_WIDTH,
                        height: BASE_NODE_HEIGHT,
                        // layer: 0,
                    },
                });
            });
            data.edges.forEach((edge: LogicFlow.EdgeConfig) => {
                // 反转连线。原因见链接：https://github.com/antvis/layout/issues/206
                edges.push({
                    id: edge.id,
                    type: edge.type,
                    source: edge.targetNodeId,
                    target: edge.sourceNodeId,
                    data: {
                        // weight: 64,
                    },
                });
            });

            // 关于节点间距的计算规则说明
            // 前提：节点只有位置信息，没有长度和宽度，那么节点间的间距就是点到点之间的距离
            // node.data.width + node.data.height 在本应用中，就代表了节点的位置点之间的距离
            // 总体来说在@antv/layout中点到点之间的真实间距y，和用户的设置间距x。并不是理想的y=x的函数。
            // 而是存在以下形式的函数对应关系：
            // 横向间距函数表达式：【y=2x+10】；纵向间距函数表达式：【y=2x+10+50(nodesep)】
            // 注意：两个方向上的函数表达式略有差距，是因为@antv/layout 中，渲染计算布局时，纵向间距会默认加上nodesep的值，而nodesep的默认值为50
            //      若想统一函数表达式，可以在配置参数时将nodesep的值设置为0；
            // qingshan 2024-04-22

            // 水平布局下的节点的横向（水平）间距（或者说节点的宽度）
            const ranksepFunc = (node: any) => {
                return (node.data.width + node.data.height - 10) / 2;
            };

            // 水平布局下的节点的纵向（垂直）间距（或者说节点的高度）
            const nodesepFunc = (node: any) => {
                // @antv/layout 中，渲染计算布局时，纵向间距会默认加上nodesep的值，而nodesep的默认值为50
                return (node.data.height + node.data.height - 10 - 50) / 2;
            };

            const dagreLayout = new DagreLayout({
                // nodeSize: 0,
                begin: [560, 300],
                rankdir: "RL",
                align: undefined,
                // nodesep: 0,
                // ranksep: 127,
                // controlPoints: true,
                nodesepFunc,
                ranksepFunc,
                // radial: true, // 是否基于 dagre 进行辐射布局
                // focusNode: '0000000', // radial 为 true 时生效，关注的节点
            } as Partial<DagreLayoutOptions>);
            // dagreLayout.layout({})
            const graph = new Graph({
                nodes,
                edges,
            });
            return new Promise((resolve, reject) => {
                dagreLayout
                    .execute(graph)
                    .then((result) => {
                        result.nodes.forEach((node: any) => {
                            Designer.getInstance().lf.graphModel.moveNode2Coordinate(
                                node.id,
                                node.data.x,
                                node.data.y,
                                false,
                            );
                        });
                        return resolve(result);
                    })
                    .catch((result) => {
                        return reject(result);
                    });
            });
        }
        if (designer.layoutType === Layout.VERTICAL) {
            const nodes: any[] = [];
            const edges: any[] = [];
            data.nodes.forEach((node: LogicFlow.NodeConfig) => {
                nodes.push({
                    id: node.id,
                    type: node.type,
                    // x: node.x,
                    // y: node.y,
                    data: {
                        width: BASE_NODE_WIDTH,
                        height: BASE_NODE_HEIGHT,
                        // layer: 0,
                    },
                });
            });
            data.edges.forEach((edge: LogicFlow.EdgeConfig) => {
                // 反转连线
                edges.push({
                    id: edge.id,
                    type: edge.type,
                    source: edge.targetNodeId,
                    target: edge.sourceNodeId,
                    data: {
                        // weight: 64,
                    },
                });
            });

            // 垂直布局下的节点的横向（水平）间距（或者说节点的高度）
            const ranksepFunc = (node: any) => {
                return (node.data.height + node.data.height - 10) / 2;
            };

            // 垂直布局下的节点的纵向（垂直）间距（或者说节点的宽度度）
            const nodesepFunc = (node: any) => {
                // @antv/layout 中，渲染计算布局时，纵向间距会默认加上nodesep的值，而nodesep的默认值为50
                return (node.data.width + node.data.height - 10 - 50) / 2;
            };

            const dagreLayout = new DagreLayout({
                // nodeSize: 0,
                begin: [1000, 300],
                rankdir: "BT",
                align: undefined,
                // nodesep: 0,
                // ranksep: 127,
                // controlPoints: true,
                nodesepFunc,
                ranksepFunc,
                // radial: true, // 是否基于 dagre 进行辐射布局
                // focusNode: '0000000', // radial 为 true 时生效，关注的节点
            } as Partial<DagreLayoutOptions>);
            // dagreLayout.layout({})
            const graph = new Graph({
                nodes,
                edges,
            });
            return new Promise((resolve, reject) => {
                dagreLayout
                    .execute(graph)
                    .then((result) => {
                        result.nodes.forEach((node: any) => {
                            Designer.getInstance().lf.graphModel.moveNode2Coordinate(
                                node.id,
                                node.data.x,
                                node.data.y,
                                false,
                            );
                        });
                        return resolve(result);
                    })
                    .catch((result) => {
                        return reject(result);
                    });
            });
        }
        return new Promise((resolve, reject) => {
            try {
                resolve("布局异常");
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default AntvisLayout;

export {AntvisLayout};
