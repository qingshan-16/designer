import type {GraphComponent} from "@/type";
import {BEZIER_EDGE} from "@/constant/ComponentType";
import BezierEdgeModel from "./model/BezierEdgeModel.ts";
import BezierEdgeView from "./view/BezierEdgeView.ts";

const GraphEdge: GraphComponent = {
    type: BEZIER_EDGE,
    model: BezierEdgeModel,
    view: BezierEdgeView,
};

export {GraphEdge};

export default GraphEdge;
