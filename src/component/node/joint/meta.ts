import {
  type GraphComponent,
  type PanelComponentMeta,
  PanelType,
  UseType,
} from "@/type";
import { JOINT_NODE } from "@/constant/ComponentType";
import JointNodeModel from "./model/JointNodeModel.ts";
import JointNodeView from "./view/JointNodeView.ts";
import JointConfig from "@/component/node/joint/panel/JointConfig.vue";

const GraphNode: GraphComponent = {
  type: JOINT_NODE,
  model: JointNodeModel,
  view: JointNodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
  // 组件唯一标识符
  type: JOINT_NODE,
  // 支持的配置步骤
  view: {
    menuView: undefined,
    configView: JointConfig,
  },
  // 显示名称
  displayName: "joint.node.name",
  // 图标
  icon: "icon-node-joint",
  panelType: PanelType.SC,
  useType: [UseType.PROCESSOR],
  // 其他元信息
  meta: undefined,
};

export { GraphNode, PanelMeta };

export default GraphNode;
