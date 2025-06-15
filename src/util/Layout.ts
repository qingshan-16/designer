import { BaseNodeModel } from "@logicflow/core";
import Designer from "../core/Designer.ts";

interface Node {
  // id
  id: string;
  // 类型
  type: string;
  // 宽度
  width: number;
  // 高度
  height: number;
  // x轴坐标
  x: number;
  // y轴坐标
  y: number;
  // 子元素的集合
  children: Node[];
  // x轴方向的层级
  levelX: number;
  isSeted: boolean;
}

interface Edge {
  // id
  id: string;
  // 源节点id
  source: string;
  // 目标节点id
  target: string;
  sourceNodeId: string;
  targetNodeId: string;
  // 类型
  type: string;
}

interface LayoutOption {
  // 节点间的x轴（横向向）间距
  xSep?: number;
  // 节点间的y轴（纵向）间距
  ySep?: number;
}

interface Data {
  nodes: Node[];
  edges: Edge[];
}

class Layout {
  // private static lf: LogicFlow = DesignerHome.getInstance().lf.value;

  /**
   * 移动当前（源）节点的所有子孙节点（不包含当前节点）
   * @param node 当前（源）节点
   * @param moveX x轴方向上的移动距离。值为正数时向右侧移动，值为负数时向左侧移动
   * @param moveY y轴方向上的移动距离。值为正数时向下侧移动，值为负数时向上侧移动
   */
  public static moveDescendantNode(
    node: BaseNodeModel,
    moveX: number,
    moveY: number,
  ): void {
    // 如果没有移动，则直接返回
    if (moveX === 0 && moveY === 0) {
      return;
    }
    const descendantNodes: Map<string, BaseNodeModel> = new Map<
      string,
      BaseNodeModel
    >();
    this.getDescendantNodes(node, descendantNodes);
    descendantNodes.forEach((value: BaseNodeModel, key: string) => {
      Designer.getInstance().lf.graphModel.moveNode(key, moveX, moveY);
    });
  }

  /**
   * 获取当前（源）节点的所有子孙节点（不包含当前节点）
   * @param node 当前（源）节点
   * @param nodes 所有子孙节点的集合
   * @returns
   */
  public static getDescendantNodes(
    node: BaseNodeModel,
    nodes: Map<string, BaseNodeModel>,
  ): void {
    const childrenNodes: BaseNodeModel[] =
      Designer.getInstance().lf.getNodeOutgoingNode(node.id);

    if (childrenNodes.length > 0) {
      childrenNodes.forEach((childNode: BaseNodeModel) => {
        this.getDescendantNodes(childNode, nodes);
        nodes.set(childNode.id, childNode);
      });
    }

    // if (childrenNodes.length === 0) {
    //   return;
    // }
  }

  /**
   * 移动当前（源）节点的所有子孙节点（不包含当前节点），且截至到指定结束节点（不包含结束节点）
   * @param node 当前（源）节点
   * @param moveX x轴方向上的移动距离。值为正数时向右侧移动，值为负数时向左侧移动
   * @param moveY y轴方向上的移动距离。值为正数时向下侧移动，值为负数时向上侧移动
   */
  public static moveDescendantNode4EndNode(
    node: BaseNodeModel,
    moveX: number,
    moveY: number,
    endNodeId: string,
  ): void {
    // 如果没有移动，则直接返回
    if (moveX === 0 && moveY === 0) {
      return;
    }
    const descendantNodes: Map<string, BaseNodeModel> = new Map<
      string,
      BaseNodeModel
    >();
    this.getDescendantNodes4EndNode(node, descendantNodes, endNodeId);
    descendantNodes.forEach((value: BaseNodeModel, key: string) => {
      Designer.getInstance().lf.graphModel.moveNode(key, moveX, moveY);
    });
  }

  /**
   * 获取当前（源）节点的所有子孙节点（不包含当前节点），且截至到指定结束节点（不包含结束节点）
   * @param node 当前（源）节点
   * @param nodes 所有子孙节点的集合
   * @param endNodeId 指定结束节点
   */
  public static getDescendantNodes4EndNode(
    node: BaseNodeModel,
    nodes: Map<string, BaseNodeModel>,
    endNodeId: string,
  ): void {
    const childrenNodes: BaseNodeModel[] =
      Designer.getInstance().lf.getNodeOutgoingNode(node.id);

    if (childrenNodes.length > 0) {
      childrenNodes.forEach((childNode: BaseNodeModel) => {
        if (childNode.id === endNodeId) {
          return;
        }
        this.getDescendantNodes4EndNode(childNode, nodes, endNodeId);
        nodes.set(childNode.id, childNode);
      });
    }
  }

  public test(): { a: number; b: number } {
    return {
      a: 1,
      b: 2,
    };
  }
}

export default Layout;

export { Layout };
