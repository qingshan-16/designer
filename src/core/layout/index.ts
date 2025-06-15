import CustomLayout from "@/core/layout/CustomLayout.ts";
import {LogicFlow} from "@logicflow/core";
import Designer from "@/core/Designer.ts";
import {BASE_EDGE, BEZIER_EDGE} from "@/constant/ComponentType.ts";
import {Edit} from "@/type";

// dagre.js 的布局算法
// const layout = new DagreLayout();

// 阿里@antv/layout 的布局算法
// const layout = new AntvisLayout();

// 自定义的布局算法

const layout = new CustomLayout();

export const layoutNow = async (translateCenter: boolean = true) => {
    const designer = Designer.getInstance();
    const edgeType = designer.editType == Edit.RULE
        ? BASE_EDGE
        : BEZIER_EDGE;

    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;

    // 等待布局完成
    const rs = await layout.layoutGraph({
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
    });

    // 移动节点到布局后的位置
    rs.nodes.forEach((node: any) => {
        designer.lf.graphModel.moveNode2Coordinate(
            node.id,
            node.data.x,
            node.data.y,
            false,
        );
    })

    if (!graphData.edges) graphData.edges = [];
    // 节点布局移动到合适位置后。更新连线，主要是连线的开始和结束锚点重新匹配
    graphData.edges.forEach((edge: LogicFlow.EdgeConfig) => {
        designer.lf.graphModel.changeEdgeType(edge.id!, edgeType)
    });

    // 将节点调整至画布居中位置
    if (translateCenter) {
        designer.lf.graphModel.translateCenter();
    }
};
export default layout;

export {layout};
