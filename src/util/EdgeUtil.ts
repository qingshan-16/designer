import LogicFlow, {BaseNodeModel} from "@logicflow/core";
import {BASE_EDGE_LENGTH, BASE_NODE_HEIGHT, BASE_NODE_WIDTH,} from "@/constant";
import Designer from "../core/Designer.ts";
import {Layout} from "@/type";

export type PolyPoint = {
    x: number;
    y: number;
    id?: string;
};

/**
 * 计算连线的折线点
 * @param start 开始点的位置
 * @param end 结束点的位置
 * @param sNode 开始节点
 * @param tNode 结束节点
 * @returns 连线的折点的集合（正常情况下最多只有四个）
 */
export const getPolylinePoints = (
    start: PolyPoint,
    end: PolyPoint,
    sNode: BaseNodeModel,
    tNode: BaseNodeModel,
): LogicFlow.Point[] => {
    const designer = Designer.getInstance();

    const rsPointsList: PolyPoint[] = [];
    rsPointsList.push(start);

    // 水平布局且两个节点不在同一水平线上，即存在拐点
    if (start.y !== end.y && designer.layoutType === Layout.HORIZONTAL) {
        // 在一个标准间隔内
        if (end.x - start.x < BASE_NODE_WIDTH + BASE_EDGE_LENGTH) {
            const inflectionPoint1 = {
                x: sNode.x + (BASE_NODE_WIDTH + BASE_EDGE_LENGTH) / 2,
                y: sNode.y,
            };

            const inflectionPoint2 = {
                x: sNode.x + (BASE_NODE_WIDTH + BASE_EDGE_LENGTH) / 2,
                y: tNode.y,
            };
            rsPointsList.push(inflectionPoint1);
            rsPointsList.push(inflectionPoint2);
        }
        // 不在一个标准间隔内
        if (end.x - start.x > BASE_NODE_WIDTH + BASE_EDGE_LENGTH) {
            const inflectionPoint1 = {
                x: tNode.x - (BASE_NODE_WIDTH + BASE_EDGE_LENGTH) / 2,
                y: sNode.y,
            };

            const inflectionPoint2 = {
                x: tNode.x - (BASE_NODE_WIDTH + BASE_EDGE_LENGTH) / 2,
                y: tNode.y,
            };
            rsPointsList.push(inflectionPoint1);
            rsPointsList.push(inflectionPoint2);
        }
    }

    // 垂直布局且两个节点不在同一垂直线上，即存在拐点
    if (start.x !== end.x && designer.layoutType === Layout.VERTICAL) {
        // 在一个标准间隔内
        if (end.y - start.y < BASE_NODE_HEIGHT + BASE_EDGE_LENGTH) {
            const inflectionPoint1 = {
                x: sNode.x,
                y: sNode.y + BASE_NODE_HEIGHT,
            };

            const inflectionPoint2 = {
                x: tNode.x,
                y: sNode.y + BASE_NODE_HEIGHT,
            };
            rsPointsList.push(inflectionPoint1);
            rsPointsList.push(inflectionPoint2);
        }
        // 不在一个标准间隔内
        if (end.y - start.y > BASE_NODE_HEIGHT + BASE_EDGE_LENGTH) {
            const inflectionPoint1 = {
                x: sNode.x,
                y: tNode.y - BASE_NODE_HEIGHT,
            };

            const inflectionPoint2 = {
                x: tNode.x,
                y: tNode.y - BASE_NODE_HEIGHT,
            };
            rsPointsList.push(inflectionPoint1);
            rsPointsList.push(inflectionPoint2);
        }
    }

    rsPointsList.push(end);

    return filterRepeatPoints(rsPointsList);
};

/**
 * 连接点去重，去掉x,y位置重复的点
 * @param points 连线的折点的集合（正常情况下最多只有四个）
 * @returns
 */
export const filterRepeatPoints = (points: PolyPoint[]): PolyPoint[] => {
    const result: PolyPoint[] = [];
    const pointsMap: Record<string, PolyPoint> = {};
    points.forEach((p) => {
        const id = `${p.x}-${p.y}`;
        p.id = id;
        pointsMap[id] = p;
    });
    Object.keys(pointsMap).forEach((p) => {
        result.push(pointsMap[p]);
    });
    return result;
};
