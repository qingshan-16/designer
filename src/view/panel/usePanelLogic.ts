import {type DefineComponent, ref, shallowRef, useTemplateRef,} from "vue";
import {BaseNodeModel} from "@logicflow/core";
import Designer from "@/core/Designer";
import {BASE_NODE} from "@/constant/ComponentType.ts";
import {panelRegistry} from "@/view/panel/PanelView";
import {START_NODE_ID} from "@/constant";
import {MULTICAST_NODE} from "@/constant/ComponentType";
import {addMulticastNode4Node} from "@/util/NodeUtil";
import {useMessage} from "naive-ui";
import {XEvent, type XEventMap} from "@/core/event/XEventType.ts";

export function usePanelLogic() {
    /**
     * 设计器实例
     */
    const designer = Designer.getInstance();

    /**
     * 消息提示
     */
    const message = useMessage();

    /**
     * 当前选中的节点
     */
    const currentModel = ref({} as BaseNodeModel);

    /**
     * 当前配置面板的标签页
     */
    const tabsValue = ref<"select" | "config">("select");

    /**
     * 抽屉的组件引用
     */
    const panelComponentRef = useTemplateRef("panelComponent");

    /**
     * 当前配置面板的视图
     */
    const currentPanelView = shallowRef<DefineComponent<unknown, unknown, any>>();

    /**
     * 抽屉的显示状态
     */
    const panelShow = ref(false);

    /**
     * 抽屉的显示状态发生变化的回调事件
     * @param show 抽屉的显示状态
     */
    const onUpdateShow = async (show: boolean) => {
        switch (show) {
            case true: {
                panelShow.value = show;
                break;
            }
            case false: {
                // 检查子组件是否有 askCloseBefore 方法
                if (panelComponentRef.value.askCloseBefore) {
                    // 调用子组件的 askCloseBefore 方法
                    const canClose = await panelComponentRef.value.askCloseBefore();
                    if (canClose) {
                        panelShow.value = !panelShow.value;
                    }
                } else {
                    // 如果子组件没有 askCloseBefore 方法，直接关闭
                    panelShow.value = !panelShow.value;
                }
                break;
            }
        }
    };

    /**
     * 顶部菜单切换前的事件
     * @param name 新标签的名字
     * @param oldName 老标签的名字
     * @returns true 允许切花，false 不允许切换
     */
    const onBeforeLeave = (
        name: string | number,
        oldName: string | number | null,
    ): boolean => {
        // 解构
        const {type: currentNodeType, id: currentNodeId} = currentModel.value;

        const panelComponentMeta = panelRegistry.get(currentNodeType);

        // 统一处理未找到 meta 的情况
        if (!panelComponentMeta) {
            throw new Error(`未找到 ${currentNodeType} 类型节点的 PanelComponentMeta`);
        }

        const panelView = panelComponentMeta.view;
        if (!panelView) {
            throw new Error(`未找到 ${currentNodeType} 类型节点的 panelView`);
        }
        // 处理不同标签页的逻辑分离
        switch (name) {
            case "select": {
                const isStartNode = currentNodeId === START_NODE_ID;

                // 统一获取 componentView 的逻辑
                const componentView = isStartNode
                    ? panelView.menuView?.trigger
                    : panelView.menuView?.processor;

                if (!componentView) {
                    message.warning("当前组件无法重新设置");
                    return false;
                }

                currentPanelView.value = componentView;
                tabsValue.value = "select";
                return true;
            }

            case "config": {
                const configView = panelView.configView;
                if (!configView) {
                    message.warning("请先选择组件");
                    return false;
                }
                currentPanelView.value = configView;
                tabsValue.value = "config";
                return true;
            }

            default:
                return false; // 处理未知标签类型
        }
    };

    /**
     * 选择组件的panel面板中，组件卡片的点击事件
     * @param type 组件类型
     * @param text 文本名称
     * @param iconClassName 图片
     */
    const onCardClick = async (type: string, text: string, iconClassName: string) => {
        // 1、重新设置当前节点的类型
        designer.lf.graphModel.changeNodeType(currentModel.value.id, type);
        // 重新为currentModel赋值
        // currentModel.value = designer.activeNode!; 这样写不行，不知道为啥，后续的操作想这个节点中新增Property会加不进去
        currentModel.value = designer.lf.graphModel.getNodeModelById(
            currentModel.value.id,
        )!;

        // 2、添加节点。此处操作会操作图数据的变更，接下来的操作要等待图数据操作完成再进行
        if (type === MULTICAST_NODE) {
            // 当前并行节点需要进行增加节点的操作。其他单节点组件无新增节点
            await addMulticastNode4Node(currentModel);
        }

        // 同步等待图数据操作完成
        //3、 变更当前抽屉的配置面板
        const panelComponentMeta = panelRegistry.get(type);
        // 统一处理未找到 meta 的情况
        if (!panelComponentMeta) {
            throw new Error(`未找到 ${type} 类型节点的 PanelComponentMeta`);
        }
        const panelView = panelComponentMeta.view;
        if (!panelView) {
            throw new Error(`未找到 ${type} 类型节点的 panelView`);
        }
        const configView = panelView.configView;
        if (!configView) {
            throw new Error(`未找到 ${type} 类型节点的 configView`);
        }
        currentPanelView.value = configView;
        tabsValue.value = "config";
    };

    /**
     * 抽屉的关闭后的回调事件
     */
    const onCloseLeave = () => {
        // 清除选中节点
        designer.lf.graphModel.clearSelectElements();
        // 清除选中节点，一定要有这个操作
        designer.emit(XEvent.NodeUnSelect, {id: currentModel.value.id});
        designer.emit(XEvent.PanelClose, {modelId: currentModel.value.id});
    };

    /**
     * 配置面板的显示状态发生变化的回调事件
     * @param clickNode 活动（点击）的节点
     */
    const panelOpen = (clickNode: BaseNodeModel | undefined) => {
        // const activeNode = designer.activeNode.value;
        if (!clickNode) return;

        // 2. 解构常用属性
        const {id: activeNodeId, xModelType: activeNodeType} = clickNode;
        currentModel.value = clickNode;

        // 3. 统一处理未注册类型
        const panelComponentMeta = panelRegistry.get(activeNodeType);
        if (!panelComponentMeta) {
            throw new Error(`未找到 ${activeNodeType} 类型节点的 PanelComponentMeta`);
        }
        const panelView = panelComponentMeta.view;
        if (!panelView) {
            console.log(`当前 ${activeNodeType} 类型节点无panel配置`);
            return;
        }

        // 4. 分离基础节点与其他节点逻辑
        const handleBaseNode = () => {
            const isInitialNode = activeNodeId === START_NODE_ID;
            const componentView = isInitialNode
                ? panelView.menuView?.trigger
                : panelView.menuView?.processor;

            if (!componentView) {
                throw new Error(
                    `未找到 ${activeNodeType} 类型节点的 ${isInitialNode ? "trigger" : "processor"} componentView`,
                );
            }
            currentPanelView.value = componentView;
            tabsValue.value = "select";
        };

        const handleNonBaseNode = () => {
            const configView = panelView.configView;
            if (!configView) {
                throw new Error(`未找到 ${activeNodeType} 类型节点的 configView`);
            }
            currentPanelView.value = configView;
            tabsValue.value = "config";
        };

        // 5. 路由处理逻辑
        activeNodeType === BASE_NODE ? handleBaseNode() : handleNonBaseNode();

        // 6. 执行位置调整
        designer.currentPositionAdjust(clickNode);

        // 7. 开启抽屉
        onUpdateShow(true)
        // panelShow.value = !panelShow.value;

        designer.emit(XEvent.PanelOpen, {modelId: currentModel.value.id});
    };

    /**
     * 抽屉的自定义关闭事件
     */
    const onCloseButton = () => {
        onUpdateShow(false)
    };

    /**
     * 节点被选中（激活）的回调事件
     * @param data
     */
    const onNodeActive = (data: XEventMap[XEvent.NodeActive]) => {
        const clickNode = designer.lf.graphModel.getNodeModelById(data.id);
        panelOpen(clickNode);
        designer.emit(XEvent.NodeSelect, data);
    };

    return {
        currentPanelView,
        currentModel,
        tabsValue,
        panelShow,
        onUpdateShow,
        onBeforeLeave,
        onCardClick,
        panelOpen,
        onCloseLeave,
        onCloseButton,
        onNodeActive
    };
}