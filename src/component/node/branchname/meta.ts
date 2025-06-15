import type { GraphComponent, PanelComponentMeta } from "@/type";
import { BRANCHNAME_NODE } from "@/constant/ComponentType";
import BranchNameNodeModel from "./model/BranchNameNodeModel.ts";
import BranchNameNodeView from "./view/BranchNameNodeView.ts";

const GraphNode: GraphComponent = {
  type: BRANCHNAME_NODE,
  model: BranchNameNodeModel,
  view: BranchNameNodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
  // 组件唯一标识符
  type: BRANCHNAME_NODE,
  // 该组件无panel配置
  view: undefined,
  // 显示名称
  displayName: "branchname.node.name",
  // 图标
  icon: undefined,
  // 其他元信息
  meta: undefined,
};

export { GraphNode, PanelMeta };

export default GraphNode;
