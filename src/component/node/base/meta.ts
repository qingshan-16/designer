import {type GraphComponent, type PanelComponentMeta} from "@/type";
import {BASE_NODE} from "@/constant/ComponentType";
import BaseNodeModel from "./model/BaseNodeModel.ts";
import BaseNodeView from "./view/BaseNodeView.ts";
import TriggerPanel from "@/view/panel/components/TriggerPanel.vue";
import ProcessorPanel from "@/view/panel/components/ProcessorPanel.vue";

const GraphNode: GraphComponent = {
    type: BASE_NODE,
    model: BaseNodeModel,
    view: BaseNodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
    // 组件唯一标识符
    type: BASE_NODE,
    // 支持的配置步骤
    view: {
        menuView: {
            trigger: TriggerPanel,
            processor: ProcessorPanel,
        },
        configView: undefined,
    },
    // 显示名称
    displayName: "base.node.name",
    // 图标
    icon: "icon-node-base",
    panelType: undefined,
    useType: undefined,
    // 其他元信息
    meta: undefined,
};

export {GraphNode, PanelMeta};

export default GraphNode;
