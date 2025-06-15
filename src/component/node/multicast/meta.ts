import {
  type GraphComponent,
  type PanelComponentMeta,
  PanelType,
  UseType,
} from "@/type";
import { MULTICAST_NODE } from "@/constant/ComponentType";
import MulticastNodeModel from "./model/MulticastNodeModel.ts";
import MulticastNodeView from "./view/MulticastNodeView.ts";
import MulticastConfig from "@/component/node/multicast/panel/MulticastConfig.vue";

const GraphNode: GraphComponent = {
  type: MULTICAST_NODE,
  model: MulticastNodeModel,
  view: MulticastNodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
  // 组件唯一标识符
  type: MULTICAST_NODE,
  // 支持的配置步骤
  view: {
    menuView: undefined,
    configView: MulticastConfig,
  },
  // 显示名称
  displayName: "multicast.node.name",
  // 图标
  icon: "icon-node-multicast",
  panelType: PanelType.SC,
  useType: [UseType.PROCESSOR],
  // 其他元信息
  meta: undefined,
};

export { GraphNode, PanelMeta };

export default GraphNode;
