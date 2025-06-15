import type {LayoutType} from "@/type";

export enum XEvent {

    EdgeActive = "x:edge-active",

    NodeActive = "x:node-active",

    NodeSelect = "x:node:select",

    NodeUnSelect = "x:node:unselect",

    LayoutChang = "x:layout:change",

    /** 画布缩放变化事件 */
    CanvasZoomChange = "x:canvas-zoom-change",

    PanelOpen = "x:panel:open",

    PanelClose = "x:panel:close",
}

export type XEventType = typeof XEvent[keyof typeof XEvent];

// 定义事件参数类型映射（Key 为枚举值）
export type XEventMap = {
    [XEvent.NodeActive]: {
        /**
         * 节点id
         */
        id: string
    };
    [XEvent.EdgeActive]: {
        /**
         * 边id
         */
        id: string, isHovered: boolean
    };
    [XEvent.NodeSelect]: {
        /**
         * 节点id
         */
        id: string
    };
    [XEvent.NodeUnSelect]: {
        /**
         * 节点id
         */
        id: string
    };
    [XEvent.CanvasZoomChange]: {
        /**
         * 当前缩放比例
         */
        scale: number
    };
    [XEvent.LayoutChang]: {
        /**
         * 新的布局类型
         */
        layoutType: LayoutType
    };
    [XEvent.PanelOpen]: {
        /**
         * 画布元素的id一般都是节点的id
         */
        modelId: string
    };
    [XEvent.PanelClose]: {
        /**
         * 画布元素的id一般都是节点的id
         */
        modelId: string
    };

};
