import type { GraphComponent } from "@/type";

const components: Map<string, Array<GraphComponent>> = new Map<
  string,
  Array<GraphComponent>
>();

const edgeComponents = new Array<GraphComponent>();
const nodeComponents = new Array<GraphComponent>();

components.set("node", nodeComponents);
components.set("edge", edgeComponents);

// 自动扫描所有 meta.ts
const graphEdgeModules = import.meta.glob("./edge/**/meta.ts", {
  eager: true,
  import: "GraphEdge", // 明确指定导入具名导出
});
Object.keys(graphEdgeModules).forEach((key) => {
  const graphEdge: GraphComponent = graphEdgeModules[key] as GraphComponent;
  if (!graphEdge) return;
  edgeComponents.push(graphEdge);
});

const graphNodeModules = import.meta.glob("./node/**/meta.ts", {
  eager: true,
  import: "GraphNode", // 明确指定导入具名导出
});
Object.keys(graphNodeModules).forEach((key) => {
  const graphNode: GraphComponent = graphNodeModules[key] as GraphComponent;
  if (!graphNode) return;
  nodeComponents.push(graphNode);
});

export default components;
