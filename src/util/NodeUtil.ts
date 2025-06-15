import {BASE_NODE, BRANCHNAME_NODE, JOINT_NODE, PLUS_NODE,} from "@/constant/ComponentType";
import {WEIGHT_START} from "@/constant/index.ts";
import type {Ref} from "vue";
import {BaseEdgeModel, BaseNodeModel, LogicFlow} from "@logicflow/core";
import Designer from "../core/Designer.ts";
import {layout} from "@/core/layout";
import type {CallbackArgs} from "@logicflow/core/src/event/eventEmitter.ts";

/**
 * 布局延迟时间。ms
 */
const LAYOUT_DELAY: number = 5;

/**
 * 从节点上添加（更新）分支节点
 * @param currentModel
 */
export async function addMulticastNode4Node(currentModel: Ref<BaseNodeModel>) {
    const designer = Designer.getInstance();
    const jointNodeId = designer.idGenerator.getId();
    currentModel.value.setProperty("jointNodeId", jointNodeId);
    const {x, y} = currentModel.value
    const branchNameNode1 = {
        id: designer.idGenerator.getId(),
        type: BRANCHNAME_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
        properties: {
            weight: WEIGHT_START,
        },
    };
    const branchNameNode2 = {
        id: designer.idGenerator.getId(),
        type: BRANCHNAME_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
        properties: {
            weight: WEIGHT_START + 1,
        },
    };
    const baseNode1 = {
        id: designer.idGenerator.getId(),
        type: BASE_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
    };
    const baseNode2 = {
        id: designer.idGenerator.getId(),
        type: BASE_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
    };
    const node4Joint = {
        id: jointNodeId,
        type: JOINT_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
    };

    const currentModelNext = designer.lf.graphModel.getNodeOutgoingNode(
        currentModel.value.id,
    )[0];

    const edge4CurrentNodeToBranchNameNode1 = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: currentModel.value.id,
        targetNodeId: branchNameNode1.id,
    };
    const edge4CurrentNodeToBranchNameNode2 = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: currentModel.value.id,
        targetNodeId: branchNameNode2.id,
    };
    const edge4BranchNameNode1ToBaseNode1 = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: branchNameNode1.id,
        targetNodeId: baseNode1.id,
    };
    const edge4BranchNameNode2ToBaseNode2 = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: branchNameNode2.id,
        targetNodeId: baseNode2.id,
    };
    const edge4BaseNode1ToJointNode = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: baseNode1.id,
        targetNodeId: node4Joint.id,
    };
    const edge4BaseNode2ToJointNode = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: baseNode2.id,
        targetNodeId: node4Joint.id,
    };
    const edge4JointNodeToCurrentNodeNext = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: node4Joint.id,
        targetNodeId: currentModelNext.id,
    };

    // 删除以当前接节点起始的线
    designer.lf.graphModel.deleteEdgeBySource(currentModel.value.id);
    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;
    if (!graphData.edges) graphData.edges = [];
    if (!graphData.nodes) graphData.nodes = [];

    // 补充新增的节点和连线。注意：此时，并不时向图中添加，只是用于美化布局
    graphData.nodes.push(branchNameNode1);
    graphData.nodes.push(branchNameNode2);
    graphData.nodes.push(baseNode1);
    graphData.nodes.push(baseNode2);
    graphData.nodes.push(node4Joint);

    graphData.edges.push(edge4CurrentNodeToBranchNameNode1);
    graphData.edges.push(edge4CurrentNodeToBranchNameNode2);
    graphData.edges.push(edge4BranchNameNode1ToBaseNode1);
    graphData.edges.push(edge4BranchNameNode2ToBaseNode2);
    graphData.edges.push(edge4BaseNode1ToJointNode);
    graphData.edges.push(edge4BaseNode2ToJointNode);
    graphData.edges.push(edge4JointNodeToCurrentNodeNext);

    // 添加新的节点
    designer.lf.graphModel.addNode({
        ...branchNameNode1,
        x: x,
        y: y,
    });
    designer.lf.graphModel.addNode({
        ...branchNameNode2,
        x: x,
        y: y,
    });
    designer.lf.graphModel.addNode({
        ...baseNode1,
        x: x,
        y: y,
    });
    designer.lf.graphModel.addNode({
        ...baseNode2,
        x: x,
        y: y,
    });
    designer.lf.graphModel.addNode({
        ...node4Joint,
        x: x,
        y: y,
    });

    // 添加新的连线
    designer.lf.graphModel.addEdge(edge4CurrentNodeToBranchNameNode1);
    designer.lf.graphModel.addEdge(edge4CurrentNodeToBranchNameNode2);
    designer.lf.graphModel.addEdge(edge4BranchNameNode1ToBaseNode1);
    designer.lf.graphModel.addEdge(edge4BranchNameNode2ToBaseNode2);
    designer.lf.graphModel.addEdge(edge4BaseNode1ToJointNode);
    designer.lf.graphModel.addEdge(edge4BaseNode2ToJointNode);
    designer.lf.graphModel.addEdge(edge4JointNodeToCurrentNodeNext);

    // 等待布局完成
    try {
        const rs = await layout.layoutGraph({
            nodes: graphData.nodes || [],
            edges: graphData.edges || [],
        });

        // 移动节点到布局后的位置
        rs.nodes.forEach((node: any) => {
            Designer.getInstance().lf.graphModel.moveNode2Coordinate(
                node.id,
                node.data.x,
                node.data.y,
                false
            );
        });

        // 返回成功状态或其他数据（可选）
        return Promise.resolve();
    } catch (error) {
        console.error('布局失败:', error);
        return Promise.reject(error);
    }
}


/**
 * 从边上添加分支
 * @param edgeModel 边
 */
export async function addMulticastBranch4Edge(edgeModel: BaseEdgeModel) {
    const designer = Designer.getInstance();

    // 获取当前分支树下所有分支节点的最大权重，新增的分支在此基础上递增
    const nodeOutgoingNode = designer.lf.graphModel.getNodeOutgoingNode(
        edgeModel.sourceNodeId,
    );
    const sourceNode = edgeModel.sourceNode;
    const {x, y} = sourceNode;

    let maxWeight = 0;
    nodeOutgoingNode.forEach((node: any) => {
        maxWeight = Math.max(
            node.properties && node.properties.weight
                ? node.properties.weight
                : maxWeight,
            maxWeight,
        );
    });
    const newBranchNameNode = {
        id: designer.idGenerator.getId(),
        type: BRANCHNAME_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
        properties: {
            weight: maxWeight + 1,
        },
    };

    const newBaseNode = {
        id: designer.idGenerator.getId(),
        type: BASE_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
    };

    const multicatNodeToBranchNameNode = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: edgeModel.sourceNodeId,
        targetNodeId: newBranchNameNode.id,
    };
    const branchNameNodeToBaseNode = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: newBranchNameNode.id,
        targetNodeId: newBaseNode.id,
    };
    const baseNodeToJointNode = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: newBaseNode.id,
        targetNodeId: sourceNode.properties.jointNodeId,
    };

    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;
    // 确保 nodes 和 edges 存在
    if (!graphData.nodes) graphData.nodes = [];
    if (!graphData.edges) graphData.edges = [];
    // 补充新增的节点和连线。注意：此时，并不时向图中添加，只是用于美化布局
    // 补充新增的节点和连线
    graphData.nodes.push(newBranchNameNode);
    graphData.nodes.push(newBaseNode);
    graphData.edges.push(multicatNodeToBranchNameNode);
    graphData.edges.push(branchNameNodeToBaseNode);
    graphData.edges.push(baseNodeToJointNode);

    // 添加新的节点
    designer.lf.graphModel.addNode({
        ...newBranchNameNode,
        x: x,
        y: y,
    });
    designer.lf.graphModel.addNode({
        ...newBaseNode,
        x: x,
        y: y,
    });
    // 添加新的的节点连线
    designer.lf.graphModel.addEdge(multicatNodeToBranchNameNode);
    designer.lf.graphModel.addEdge(branchNameNodeToBaseNode);
    designer.lf.graphModel.addEdge(baseNodeToJointNode);
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
    });

    // 等待当前队列结束，再进行触发节点的点击事件
    // 不然新增的节点对应的实例（LogicFlow中对应节点的Model）还未初始化
    designer.lf.graphModel.eventCenter.emit("node:click", {
        data: {
            ...newBaseNode,
            x: rs.nodes.find((node: any) => node.id === newBaseNode.id).data
                .x,
            y: rs.nodes.find((node: any) => node.id === newBaseNode.id).data
                .y,
        },
        e: null, // 添加 e 属性
        position: {x: 0, y: 0}, // 添加 position 属性
    } as CallbackArgs);
}

/**
 * 从边上添加基础节点
 * @param edgeModel 边
 */
export async function addBaseNode4Edge(edgeModel: BaseEdgeModel) {
    const designer = Designer.getInstance();
    const newNodeId = designer.idGenerator.getId();

    const newNode = {
        id: newNodeId,
        type: BASE_NODE,
        // x、y没有实际意义，只为类型检查
        x: 0,
        y: 0,
    };

    const newEdgeIn = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: edgeModel.sourceNodeId,
        targetNodeId: newNodeId,
    };
    const newEdgeOut = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: newNodeId,
        targetNodeId: edgeModel.targetNodeId,
    };
    // 删除当前线
    designer.lf.graphModel.deleteEdgeById(edgeModel.id);

    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;

    // 确保 nodes 和 edges 存在
    if (!graphData.nodes) graphData.nodes = [];
    if (!graphData.edges) graphData.edges = [];

    // 补充新增的节点和连线
    graphData.nodes.push(newNode);
    graphData.edges.push(newEdgeIn);
    graphData.edges.push(newEdgeOut);

    // 添加新的节点
    designer.lf.graphModel.addNode({
        ...newNode,
        x: edgeModel.sourceNode.x,
        y: edgeModel.sourceNode.y,
    });

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
    });

    // 为新的节点连线（一定要线移动节点，在进行连线，不然新的连线会出现问题）
    // TODO:这块放到布局之前就会出问题，不知道为啥，后续看看
    designer.lf.graphModel.addEdge(newEdgeIn);
    designer.lf.graphModel.addEdge(newEdgeOut);
    // 注意:尽量保证添加完节点就调整节点布局,

    // 等待当前队列结束，再进行触发节点的点击事件
    // 不然新增的节点对应的实例（LogicFlow中对应节点的Model）还未初始化
    designer.lf.graphModel.eventCenter.emit("node:click", {
        data: {
            ...newNode,
            x: rs.nodes.find((node: any) => node.id === newNode.id).data.x,
            y: rs.nodes.find((node: any) => node.id === newNode.id).data.y,
        },
        e: null, // 添加 e 属性
        position: {x: 0, y: 0}, // 添加 position 属性
    } as CallbackArgs);
}

/**
 * 从（+）节点上添加节点
 * @param plusNodeModel
 */
export async function addBaseNode4PlusNode(plusNodeModel: BaseNodeModel) {
    const designer = Designer.getInstance();
    const incomingNode: BaseNodeModel[] = designer.lf.graphModel.getNodeIncomingNode(
        plusNodeModel.id,
    );
    // 上一个节点
    const previousNode = incomingNode[0];

    const incomingEdge: BaseEdgeModel[] = designer.lf.graphModel.getNodeIncomingEdge(
        plusNodeModel.id,
    );
    // 进入的线
    const inEdge = incomingEdge[0];
    const {x, y} = plusNodeModel;

    const newNodeId = designer.idGenerator.getId();

    const newNode = {
        type: BASE_NODE,
        x,
        y,
        id: newNodeId,
    };

    const newEdgeIn = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: previousNode.id,
        targetNodeId: newNodeId,
    };
    const newEdgeOut = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: newNodeId,
        targetNodeId: plusNodeModel.id,
    };

    // 删除进入的线
    designer.lf.graphModel.deleteEdgeById(inEdge.id);

    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;

    // 确保 nodes 和 edges 存在
    if (!graphData.nodes) graphData.nodes = [];
    if (!graphData.edges) graphData.edges = [];

    // 补充新增的节点和连线
    graphData.nodes.push(newNode);
    graphData.edges.push(newEdgeIn);
    graphData.edges.push(newEdgeOut);

    // 添加新的节点
    designer.lf.graphModel.addNode({
        ...newNode,
        x: plusNodeModel.x,
        y: plusNodeModel.y,
    });

    // 添加新的连线
    designer.lf.graphModel.addEdge(newEdgeIn);
    designer.lf.graphModel.addEdge(newEdgeOut);

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
    });

    // 注意:尽量保证添加完节点就调整节点布局,
    // 等待当前队列结束，再进行触发节点的点击事件
    // 不然新增的节点对应的实例（LogicFlow中对应节点的Model）还未初始化
    // todo:不知道为什么，这里必须要等待，不然会出现问题。上边的在线上添加节点就没有问题，他俩应该表现一致才对？？？
    setTimeout(() => {
        designer.lf.graphModel.eventCenter.emit("node:click", {
            data: {
                ...newNode,
                x: rs.nodes.find((node: any) => node.id === newNode.id).data.x,
                y: rs.nodes.find((node: any) => node.id === newNode.id).data.y,
            },
            e: null, // 添加 e 属性
            position: {x: 0, y: 0}, // 添加 position 属性
        } as CallbackArgs);
    },);
}


/**
 * 删除基础节点
 * @param baseNodeModel
 */
export async function deleteBaseNode(baseNodeModel: BaseNodeModel) {
    const designer = Designer.getInstance();
    const incomingNode: BaseNodeModel[] = designer.lf.graphModel.getNodeIncomingNode(
        baseNodeModel.id,
    );
    const outgoingNode: BaseNodeModel[] = designer.lf.graphModel.getNodeOutgoingNode(
        baseNodeModel.id,
    );
    // 上一个节点
    const previousNode = incomingNode[0];
    // 下一个节点
    const nextNode = outgoingNode[0];

    // 删除进、出的线和当前节点
    designer.lf.graphModel.deleteNode(baseNodeModel.id);

    const newEdge = {
        id: designer.idGenerator.getId(),
        // type: BEZIER_EDGE,
        sourceNodeId: previousNode.id,
        targetNodeId: nextNode.id,
    };

    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;
    // 补充新增的节点和连线。注意：此时，并不时向图中添加，只是用于美化布局
    if (!graphData.edges) graphData.edges = [];
    graphData.edges.push(newEdge);

    // 等待布局完成
    const rs = await layout.layoutGraph({
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
    });

    // 为当前节点的上一个节点和下一个节点直接重新连线
    designer.lf.graphModel.addEdge(newEdge);

    // 移动节点到布局后的位置
    rs.nodes.forEach((node: any) => {
        designer.lf.graphModel.moveNode2Coordinate(
            node.id,
            node.data.x,
            node.data.y,
            false,
        );
    });
}


export function isOpenPanel(nodeType: string): boolean {
    return nodeType !== PLUS_NODE && nodeType !== BRANCHNAME_NODE;
}

