import "@logicflow/core/lib/style/index.css";
import "@logicflow/extension/lib/style/index.css";
import {BaseNodeModel, LogicFlow, Options} from "@logicflow/core";
import {MiniMap} from "@logicflow/extension";
// import { MiniMap } from "@/core/extension/mini-map/index.ts";
import IDGenerator from "@/util/IDUtil";
import {
    BASE_EDGE_LENGTH,
    BASE_NODE_HEIGHT,
    BASE_NODE_WIDTH,
    PANEL_WIDTH,
    PLUS_NODE_HEIGHT,
    PLUS_NODE_WIDTH,
} from "@/constant";
import Components from "@/component";
import {Edit, type EditType, Layout, type LayoutType} from "@/type";
import {BASE_EDGE, BEZIER_EDGE} from "@/constant/ComponentType.ts";
import {ref, type Ref} from "vue";
import InitGraphData from "@/assets/InitGraphData.json";
import {XEventEmitter} from "@/core/event/XEventEmitter.ts";
import {XEvent, type XEventMap, type XEventType} from "@/core/event/XEventType.ts";

/**
 * 单例对象
 * 用于初始化创建LogicFlow等相关工作
 */
class Designer {
    // 此类的私有化实例
    private static _instance: Designer = new Designer();

    // 事件发射器实例
    private _eventEmitter: XEventEmitter = new XEventEmitter();

    // LogicFlow的实例化对象
    private _lf: LogicFlow;

    private _idGenerator: IDGenerator;

    // 'horizontal-layout'水平布局。'vertical-layout'垂直布局
    private _layoutType: LayoutType;

    private _editType: EditType;

    private _animationsEnabled: Ref<boolean>;

    // 拖拽之前的动画设置，暂时记录。仅用于在拖拽时关闭动画方便还原
    private _dragBefore: boolean;

    private _graphData: LogicFlow.GraphConfigData;

    private constructor() {
        this._lf = {} as LogicFlow;
        this._idGenerator = new IDGenerator();
        this._layoutType = Layout.HORIZONTAL;
        this._editType = Edit.RULE;
        this._animationsEnabled = ref(true);
        this._dragBefore = true;
        this._graphData = InitGraphData;
    }

    // 私有化属性的存取器
    get lf(): LogicFlow {
        return this._lf;
    }

    set lf(lf: LogicFlow) {
        this._lf = lf;
    }

    get idGenerator(): IDGenerator {
        return this._idGenerator;
    }

    set idGenerator(idGenerator: IDGenerator) {
        this._idGenerator = idGenerator;
    }

    get layoutType(): LayoutType {
        return this._layoutType;
    }

    set layoutType(layoutType: LayoutType) {
        this._layoutType = layoutType;
    }

    get editType(): EditType {
        return this._editType;
    }

    set editType(editType: EditType) {
        this._editType = editType;
    }

    get animationsEnabled(): Ref<boolean> {
        return this._animationsEnabled;
    }

    set animationsEnabled(animationsEnabled: Ref<boolean>) {
        this._animationsEnabled = animationsEnabled;
    }

    get graphData(): LogicFlow.GraphConfigData {
        return this._graphData;
    }

    set graphData(graphData: LogicFlow.GraphConfigData) {
        this._graphData = graphData;
    }

    // 获得实例对象
    public static getInstance(): Designer {
        return this._instance;
    }

    /**
     * 初始化设计器
     * @param container 设计器所在的容器对象
     */
    public init(container: HTMLElement) {
        let options = {
            // 通过选项指定了渲染的容器和需要显示网格
            container: container,
            // 画布自动延展
            autoExpand: false,
            // 关闭对齐线，默认开启
            snapline: false,
            plugins: [MiniMap],
            pluginsOptions: {
                miniMap: {
                    width: 270,
                    height: 130,
                    showEdge: true,
                    isShowHeader: false,
                    isShowCloseIcon: false,
                    leftPosition: 16,
                    // topPosition: 20,
                    // rightPosition: 80,
                    bottomPosition: 45,
                },
            },
        } as Options.Common;
        switch (this._editType) {
            case Edit.FREE:
                // 自由编辑模式下默认连线类型是 BEZIER_EDGE
                options.edgeType = BEZIER_EDGE;
                // 关闭边文本编辑。
                options.edgeTextEdit = false;
                // 隐藏节点的锚点。
                options.hideAnchors = true;
                // 禁止调整边。
                options.adjustEdge = false;
                // 自由编辑模式下默认关闭动画
                this._animationsEnabled.value = false;
                break;
            case Edit.RULE:
                // 规则编辑模式下默认连线类型是 BASE_EDGE
                options.edgeType = BASE_EDGE;
                // 关闭边文本编辑。
                options.edgeTextEdit = false;
                // 开启仅浏览不可编辑模式
                options.isSilentMode = true;
                // 规则编辑模式下默认开启动画
                this._animationsEnabled.value = true;
                break;
            default:
                break;
        }
        this._lf = new LogicFlow(options);
        // 修改对齐线样式
        this._lf.setTheme({
            snapline: {
                stroke: "#2775b6", // 对齐线颜色
                strokeWidth: 2, // 对齐线宽度
            },
        });

        // 注册节点和边
        this._lf.batchRegister(Components.get("node") as any);
        this._lf.batchRegister(Components.get("edge") as any);

        // 设置缩放的限制
        this._lf.setZoomMiniSize(0.01);
        this._lf.setZoomMaxSize(4);

        this.bindEvent();
    }

    /**
     * 为节点设置绑定事件
     */
    private bindEvent(): void {
        // node、dege的删除事件.
        // node、edge被删除时，卸载相应的Vue实例
        this._lf.on("node:delete,edge:delete", ({data}) => {
            this._idGenerator.deleteId(data.id);
        });
        // node单击事件
        // 控制节点的选中
        this._lf.on("node:click", ({data}) => {
            this._eventEmitter.emit(
                XEvent.NodeActive,
                {id: data.id}
            );
            // console.log("节点单s击", this._lf.graphModel.modelMap);
        });
        // node双击事件
        this._lf.on("node:dbclick", () => {

            // console.log('节点双击', args);
        });

        // 鼠标进入边
        this._lf.on("edge:mouseenter", ({data}) => {
            this._eventEmitter.emit(XEvent.EdgeActive, {id: data.id, isHovered: true});
            // console.log("鼠标进入边");
        });
        // 鼠标离开边
        this._lf.on("edge:mouseleave", ({data}) => {
            this._eventEmitter.emit(XEvent.EdgeActive, {id: data.id, isHovered: false});
            // console.log("鼠标离开边");
        });
        // edge单击事件
        this._lf.on("edge:click", () => {
            // console.log('边单击');
        });
        // 画布单击事件
        this._lf.on("blank:click", () => {
            // console.log('画布单击');
            // console.log(this._lf.getGraphData());
        });
        // 画布开始拖拽事件
        this._lf.on("blank:dragstart", () => {
            // console.log('画布开始拖拽');
            // const graphElement = document.querySelector('.lf-graph > svg > g');
            // if (graphElement) {
            //   graphElement.classList.remove('lf-graph-transition');
            // }
            // 记录拖拽之前的动画设置
            this._dragBefore = this._animationsEnabled.value
            // 画布拖拽前关闭动画
            this._animationsEnabled.value = false;
        });
        // 画布拖拽事件
        this._lf.on("blank:drag", () => {
            // console.log('画布拖拽');
        });
        // 画布拖拽放开事件
        this._lf.on("blank:drop", () => {
            // console.log('画布拖拽放开');
            // const graphElement = document.querySelector('.lf-graph > svg > g');
            // 还原动画设置
            this._animationsEnabled.value = this._dragBefore;

        });

        this._lf.on("graph:transform", () => {
            // console.log('画布拖拽放开');
            // const graphElement = document.querySelector('.lf-graph > svg > g');
        });
    }

    /**
     * 当前节点位置调整
     */
    public currentPositionAdjust(currentNode: BaseNodeModel) {
        if (!currentNode) {
            throw new Error("currentNode is undefinde");
        }
        // 方式一
        const {transformModel, width, height} = this._lf.graphModel;
        const currentPoint4html = transformModel.CanvasPointToHtmlPoint([
            currentNode.x,
            currentNode.y,
        ]);
        // x方向上的界限
        const xLimits =
            PANEL_WIDTH +
            (BASE_NODE_WIDTH + BASE_EDGE_LENGTH + PLUS_NODE_WIDTH + 24) *
            transformModel.SCALE_X;
        // y方向上的界限
        const yLimets =
            (BASE_NODE_HEIGHT + BASE_EDGE_LENGTH + PLUS_NODE_HEIGHT + 24) *
            transformModel.SCALE_Y;
        const xBest = width - xLimits;
        const yBest = height - yLimets;
        if (currentPoint4html[0] > xBest) {
            transformModel.translate(-(currentPoint4html[0] - xBest), 0);
        }

        if (currentPoint4html[1] > yBest) {
            transformModel.translate(0, -(currentPoint4html[1] - yBest));
        }

        // 方式二
        // const { transformModel, width, height } = this._lf.graphModel;
        // const centerPoint4html: PointTuple = [width / 2, height / 2];
        // const currentPoint4html = transformModel.CanvasPointToHtmlPoint([
        //   currentNode.x,
        //   currentNode.y,
        // ]);
        // const centerPoint4canvas =
        //   transformModel.HtmlPointToCanvasPoint(centerPoint4html);
        // const xLimits = 520 + (100 + 100 + 32 + 16) * transformModel.SCALE_X;
        // const xOffset = (xLimits - width / 2) / transformModel.SCALE_X;
        // if (currentPoint4html[0] > width - xLimits) {
        //   transformModel.focusOn(
        //     currentNode.x + xOffset,
        //     centerPoint4canvas[1],
        //     width,
        //     height,
        //   );
        // }
    }

    // 销毁设计器，主要时销毁LogicFlow的实例
    public destroy(): void {
        this._lf.clearData();
        this._lf = {} as LogicFlow;
        this._idGenerator = new IDGenerator();
        this._layoutType = Layout.HORIZONTAL;
    }

    /**
     * 注册事件监听
     * @param type 事件类型
     * @param handler 处理函数
     */
    public addEventListener<T extends XEventType>(
        type: T,
        handler: (args: XEventMap[T]) => void,
    ): void {
        this._eventEmitter.on(type, handler);
    }

    /**
     * 移除事件监听
     * @param type 事件类型
     * @param handler 要移除的处理函数（可选）
     */
    public removeEventListener<T extends XEventType>(
        type: T,
        handler?: (args: XEventMap[T]) => void,
    ): void {
        this._eventEmitter.off(type, handler);
    }

    /**
     * 触发事件
     * @param type 事件类型
     * @param args 事件回调参数
     */
    public emit<T extends XEventType>(
        type: T,
        args: XEventMap[T],
    ): void {
        this._eventEmitter.emit(type, args);
    }
}

export default Designer;
