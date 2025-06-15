import {type GraphComponent, type PanelComponentMeta, PanelType, UseType,} from "@/type";
import {OPENAPI_NODE} from "@/constant/ComponentType";
import OpenAPINodeModel from "./model/OpenAPINodeModel.ts";
import OpenAPINodeView from "./view/OpenAPINodeView.ts";
import TriggerPanel from "@/view/panel/components/TriggerPanel.vue";
import OpenApiConfig from "@/component/node/openapi/panel/OpenApiConfig.vue";

/**
 * graph 组件
 */
const GraphNode: GraphComponent = {
    type: OPENAPI_NODE,
    model: OpenAPINodeModel,
    view: OpenAPINodeView,
};

/**
 * panel 配置视图信息
 */
const PanelMeta: PanelComponentMeta = {
    // 组件唯一标识符
    type: OPENAPI_NODE,
    // 支持的配置步骤
    view: {
        menuView: {
            trigger: TriggerPanel,
            processor: undefined,
        },
        configView: OpenApiConfig,
    },
    // 显示名称
    displayName: "openapi.node.name",
    // 图标
    icon: "icon-node-openapi",
    panelType: PanelType.NI,
    useType: [UseType.TRIGGER, UseType.PROCESSOR],
    // 其他元信息
    meta: undefined,
};

export {GraphNode, PanelMeta};

export default GraphNode;
