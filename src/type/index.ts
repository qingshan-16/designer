import type {DefineComponent} from "vue";

export type GraphComponent = {
    type: string;
    view: Object;
    model: Object;
    text?: string;
    label?: string;
    info?: string;
    icon?: string;
    className?: string;
    properties?: object;
    callback?: () => void;
};

export const enum UseType {
    TRIGGER = "trigger",
    PROCESSOR = "processor",
}

export const enum PanelType {
    NI = "networkInterface",
    TT = "scheduledTasks",
    EMAIL = "email",
    MQ = "messageSystem",
    DB = "database",
    RPC = "rpc",
    SC = "structuralControl",
}

export interface PanelComponentMeta {
    // 组件唯一标识符
    type: string;
    // 支持的配置步骤
    view?: PanelView;
    // 显示名称
    displayName: string;
    // 图标
    icon?: string;
    panelType?: PanelType;
    useType?: Array<UseType>;
    // 其他元信息
    meta?: Record<string, any>;
}

export interface ComponentCardItem {
    type: string;
    iconClassName: string;
    name: string;
}

export interface PanelView {
    menuView?: PanelMenu;
    configView?: DefineComponent<{}, {}, any>;
}

export interface PanelMenu {
    /**
     * 触发器组件，一般用于第一个节点
     */
    trigger?: DefineComponent<{}, {}, any>;

    /**
     * 普通处理器组件，一般用于中间节点
     */
    processor?: DefineComponent<{}, {}, any>;
}

export type Language = {
    [key: string]: string;
};

export enum Layout {
    /**
     * 横向布局
     */
    HORIZONTAL = "horizontal",
    /**
     * 纵向布局
     */
    VERTICAL = "vertical",
}

export type LayoutType = typeof Layout[keyof typeof Layout];

export enum Edit {
    /**
     * 自由模式，节点可以自由拖拽、移动
     */
    FREE = "free",
    /**
     * 规则模式，节点只能按照规则位置放置，不可移动
     */
    RULE = "rule",
}

// 定义联合类型
export type EditType = typeof Edit[keyof typeof Edit];


export const LanguageCode = {
    "zh-CN": "简体中文",
    "zh-TW": "繁体中文",
    en: "English",
    ar: "بالعربية",
    ja: "日本語",
};

export interface AppConfig {
    language: keyof typeof LanguageCode;
    theme: "light" | "dark";
}

export interface FlowInfo {
    flowData: string;
}

export interface MicroAppData {
    name: string;
    language: keyof typeof LanguageCode;
    theme: "light" | "dark";
    version: string;
    user: string;

    [key: string]: string;
}
