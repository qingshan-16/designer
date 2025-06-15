import {BezierEdgeModel as LFBezierEdgeModel, GraphModel, LogicFlow} from "@logicflow/core";
import Designer from "@/core/Designer";


class BezierEdgeModel extends LFBezierEdgeModel {
    constructor(data: LogicFlow.EdgeConfig, graphModel: GraphModel) {
        if (!data.id) {
            data.id = `${Designer.getInstance().idGenerator.getId()}`;
        }
        super(data, graphModel);

        // 手动重置连线的开始和结束点的坐标。logicflow库初始化时设置的坐标有点异常
        // 源节点的所有锚点
        const sourceAnchors = this.sourceNode.anchors;
        // 过滤出源节点的输出锚点，即id中包含“out”字符串的锚点
        const sourceAnchor = sourceAnchors.filter((anchor) => {
            return anchor.id!.includes("out");
        });
        this.startPoint = {
            x: sourceAnchor[0].x,
            y: sourceAnchor[0].y,
        };
        this.sourceAnchorId = sourceAnchor[0].id;

        // 源节点的所有锚点
        const targetAnchors = this.targetNode.anchors;
        // 过滤出目标节点的输入锚点，即id中包含“in”字符串的锚点
        const targetAnchor = targetAnchors.filter((anchor) => {
            return anchor.id!.includes("in");
        });
        this.endPoint = {
            x: targetAnchor[0].x,
            y: targetAnchor[0].y,
        };
    }

    getEdgeStyle() {
        const style = super.getEdgeStyle();
        const {properties} = this;
        if (properties.isActived) {
            style.strokeDasharray = "4 4";
        }
        style.stroke = "#dbdbdb";
        style.strokeWidth = 4;
        return style;
    }

    // getArrowStyle(): ArrowTheme {
    //   let arrowStyle = super.getArrowStyle();
    //   console.log('arrowStyle', arrowStyle);
    //   arrowStyle.offset = 2;
    //   return arrowStyle;
    // }

    /**
     * 重写此方法，不显示外边框
     *
     * @returns
     */
    getOutlineStyle() {
        const style = super.getOutlineStyle();
        style.stroke = "none";
        style.hover!.stroke = "none";
        return style;
    }

    // 解决线上悬浮加号按钮显示问题
    setHovered(flag = true): void {
        super.setHovered(flag);
        if (flag) {
            this.setZIndex(1);
        } else {
            this.setZIndex(-1);
        }
    }

    // updateStyles(styles): void {
    //   this.style = {
    //     ...formatData(styles),
    //   };
    // }

    // /**
    //  * 自定义拐点的生成规则
    //  */
    // updatePoints() {
    //     const pointsList: LogicFlow.Point[] = getPolylinePoints(
    //         {x: this.startPoint.x, y: this.startPoint.y},
    //         {x: this.endPoint.x, y: this.endPoint.y},
    //         this.sourceNode,
    //         this.targetNode,
    //     );
    //     this.pointsList = pointsList;
    //     this.points = pointsList
    //         .map((point: LogicFlow.Point) => `${point.x},${point.y}`)
    //         .join(" ");
    // }

}

export default BezierEdgeModel;
