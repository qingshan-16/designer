import type { GraphComponent } from "@/type";
import { BASE_EDGE } from "@/constant/ComponentType";
import BaseEdgeModel from "./model/BaseEdgeModel.ts";
import BaseEdgeView from "./view/BaseEdgeView.ts";

const GraphEdge: GraphComponent = {
  type: BASE_EDGE,
  model: BaseEdgeModel,
  view: BaseEdgeView,
};

export { GraphEdge };

export default GraphEdge;
