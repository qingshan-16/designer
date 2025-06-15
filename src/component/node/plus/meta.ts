import { type GraphComponent, type PanelComponentMeta } from "@/type";
import { PLUS_NODE } from "@/constant/ComponentType";
import PlusNodeModel from "./model/PlusNodeModel.ts";
import PlusNodeView from "./view/PlusNodeView.ts";

const GraphNode: GraphComponent = {
  type: PLUS_NODE,
  model: PlusNodeModel,
  view: PlusNodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
  // 组件唯一标识符
  type: PLUS_NODE,
  // 支持的配置步骤
  view: undefined,
  // 显示名称
  displayName: "",
  // 图标
  icon: undefined,
  panelType: undefined,
  useType: undefined,
  // 其他元信息
  meta: undefined,
};

export { GraphNode, PanelMeta };

export default GraphNode;
