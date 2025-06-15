import {LogicFlow} from "@logicflow/core";

interface LayoutBase {
    /**
     * 美化图
     * @param data 图元数据，主要是节点和连线
     */
    layoutGraph(data: {
        nodes: LogicFlow.NodeConfig[];
        edges: LogicFlow.EdgeConfig[];
    }): Promise<any>;
}

// export default Layout;

export type {LayoutBase};
