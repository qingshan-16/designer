import XNode from "./XNode.ts";
import LayoutConfig from "./LayoutConfig.ts";

/**
 * 原子树布局。参考坐标系为数学坐标系，即右上为正
 * 对原子树进行布局排布
 * 原子树：树内不包括其他分支的节点，即原子树
 * 原子树布局：
 * 1、对原子树分支进行排序，按照分支权重进行排序
 * 2、对每个分支进行布局，按照分支权重进行布局，此时排布是已经按照上一个分支的位置对下一个分支进行了偏移
 * 3、设置开始节点和结束节点的位置
 * 4、调整布局，将开始节点设置为（0，0）
 * 5、标记已布局
 */
class AtomicTreeLayout {
    /**
     * 节点列表
     */
    private nodes: XNode[];
    /**
     * 开始节点
     */
    private startNode: XNode;
    /**
     * 结束节点
     */
    private endNode: XNode;
    /**
     * 布局配置
     */
    private config: LayoutConfig;
    /**
     * 是否已经布局
     */
    private isLaidOut = false;

    constructor(
        nodes: XNode[],
        startNode: XNode,
        endNode: XNode,
        config: LayoutConfig,
    ) {
        this.nodes = nodes;
        this.startNode = startNode;
        this.endNode = endNode;
        this.config = config;
    }

    /**
     * 执行布局
     */
    public layout() {
        // 1、获取所有的分支，并按照分支权重排序
        const branchs = this.sortChildNodesByWeight(this.startNode.getChildNodes());
        //2、对每个分支进行排序
        // 每个分支的y坐标需要进行偏移
        switch (this.config.getRankdir()) {
            case "LR": {
                let offsetY = 0;
                branchs.forEach((branch) => {
                    // 虚拟父节点
                    const virtualNode = new XNode();
                    virtualNode.setX(0 - this.config.getHorizontalSpacing());
                    virtualNode.setY(0 - this.config.getVerticalSpacing() - offsetY);
                    this.branchLayout(branch, virtualNode, this.endNode);
                    offsetY += this.config.getVerticalSpacing();
                });
                break;
            }
            case "TB": {
                let offsetX = 0;
                branchs.forEach((branch) => {
                    // 虚拟父节点
                    const virtualNode = new XNode();
                    virtualNode.setX(0 - this.config.getHorizontalSpacing() + offsetX);
                    virtualNode.setY(0 - this.config.getVerticalSpacing());
                    this.branchLayout(branch, virtualNode, this.endNode);
                    offsetX += this.config.getHorizontalSpacing();
                });
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.config.getRankdir()}配置`);
        }

        // 3、设置开始节点和结束节点的位置, "LR"布局时开始节点和结束节点的Y坐标一致，"TB"布局时开始节点和结束节点的X坐标一致
        switch (this.config.getRankdir()) {
            case "LR": {
                let startNodeX =
                    branchs[0]!.getX() - this.config.getHorizontalSpacing();
                // 获取分支节点的y的最大值和最小值
                let maxY: number = this.getMaxYForNodes(branchs);
                let minY: number = this.getMinYForNodes(branchs);
                if (maxY === -Infinity || minY === Infinity) {
                    throw new Error(
                        `分支节点异常，分支节点的maxY:${maxY}和minY:${minY}未被正确赋值`,
                    );
                }
                this.startNode.setX(startNodeX);
                this.startNode.setY((maxY + minY) / 2);

                // 获取结束节点所有父节点，并找出做大的x值
                var endNodeParentNodes = this.endNode.getParentNodes();
                let maxX: number = this.getMaxXForNodes(endNodeParentNodes);
                if (maxX === -Infinity) {
                    throw new Error(`分支节点异常，分支节点的maxX:${maxX}未被正确赋值`);
                }
                this.endNode.setX(maxX + this.config.getHorizontalSpacing());
                this.endNode.setY((maxY + minY) / 2);
                break;
            }
            case "TB": {
                let startNodeY = branchs[0]!.getY() + this.config.getVerticalSpacing();
                // 获取分支节点的X的最大值和最小值
                let maxX: number = this.getMaxXForNodes(branchs);
                let minX: number = this.getMinXForNodes(branchs);
                if (maxX === -Infinity || minX === Infinity) {
                    throw new Error(
                        `分支节点异常，分支节点的maxX:${maxX}和minX:${minX}未被正确赋值`,
                    );
                }
                this.startNode.setX((maxX + minX) / 2);
                this.startNode.setY(startNodeY);

                // 获取结束节点所有父节点，并找出做大的Y值
                var endNodeParentNodes = this.endNode.getParentNodes();
                let minY: number = this.getMinYForNodes(endNodeParentNodes);
                if (minY === Infinity) {
                    throw new Error(`分支节点异常，分支节点的minY:${minY}未被正确赋值`);
                }
                this.endNode.setX((maxX + minX) / 2);
                this.endNode.setY(minY - this.config.getVerticalSpacing());
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.config.getRankdir()}配置`);
        }

        // 4、最终调整布局，将开始节点设置为（0，0）
        this.repositionTreeNoCheck(0, 0);

        // 5. 标记已布局
        this.isLaidOut = true;
    }

    /**
     * 布局支树的某个分支，仅对某个分支上的所有节点进行布局，不会调整分支所属树的开始节点和结束节点的信息
     *
     * @param currentNode 当前节点
     * @param parentNode 父节点
     * @param endNode
     * @private
     */
    private branchLayout(
        currentNode: XNode,
        parentNode: XNode,
        endNode: XNode,
    ): void {
        let newCurrentNode;
        let newParentNode;
        if (currentNode.isBranch()) {
            throw new Error("原子树除开始节点为没有其他分支节点，请检查");
        }
        // 一定不是分支节点
        // 1、获取子节点
        const childNodes = currentNode.getChildNodes();
        if (childNodes === undefined || childNodes.length === 0) {
            throw new Error("子节点异常，子节点为undefined。");
        }
        const childNode = childNodes[0];
        if (childNode === undefined) {
            throw new Error("子节点异常，子节点为undefined。");
        }
        // 2、设置当前节点的位置
        switch (this.config.getRankdir()) {
            case "LR": {
                currentNode.setX(
                    parentNode.getX() + this.config.getHorizontalSpacing(),
                );
                currentNode.setY(parentNode.getY());
                break;
            }
            case "TB": {
                currentNode.setX(parentNode.getX());
                currentNode.setY(parentNode.getY() - this.config.getVerticalSpacing());
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.config.getRankdir()}配置`);
        }
        newCurrentNode = childNode;
        newParentNode = currentNode;
        // 如果下一次递归的当前节点是结束节点，则结束递归
        if (newCurrentNode.getId() === endNode.getId()) {
            return;
        }
        // 递归布局
        this.branchLayout(newCurrentNode, newParentNode, endNode);
        return;
    }

    /**
     * 重新定位树
     * 谨慎使用，目前尽在初始布局时使用
     * @param newStartNodeX 新（开始节点）X坐标
     * @param newStartNodeY 新（开始节点）Y坐标
     */
    public repositionTreeNoCheck(newStartNodeX: number, newStartNodeY: number) {
        // 计算偏移量
        const offsetX = newStartNodeX - this.startNode.getX();
        const offsetY = newStartNodeY - this.startNode.getY();
        // 应用偏移量
        this.applyPositionOffset(offsetX, offsetY);
    }

    /**
     * 重新定位树
     * @param newStartNodeX 新（开始节点）X坐标
     * @param newStartNodeY 新（开始节点）Y坐标
     */
    public repositionTree(newStartNodeX: number, newStartNodeY: number) {
        this.validateLayoutState();
        // 计算偏移量
        const offsetX = newStartNodeX - this.startNode.getX();
        const offsetY = newStartNodeY - this.startNode.getY();
        // 应用偏移量
        this.applyPositionOffset(offsetX, offsetY);
    }

    /**
     * 获取布局的高度
     * @returns 布局的高度
     */
    public getHeight(): number {
        this.validateLayoutState();
        return this.calculateVerticalSpan();
    }

    /**
     * 获取布局的宽度
     * @returns 布局的宽度
     */
    public getWidth(): number {
        this.validateLayoutState();
        return this.calculateHorizontalSpan();
    }

    /**
     * 校验布局状态
     */
    private validateLayoutState() {
        if (!this.isLaidOut) {
            throw new Error("必须首先执行布局操作");
        }
    }

    /**
     * 计算垂直跨度
     * @returns
     */
    private calculateVerticalSpan(): number {
        const ys = this.nodes.map((node) => node.getY());
        return Math.max(...ys) - Math.min(...ys);
    }

    /**
     * 计算水平跨度
     * @returns
     */
    private calculateHorizontalSpan(): number {
        const xs = this.nodes.map((node) => node.getX());
        return Math.max(...xs) - Math.min(...xs);
    }

    /**
     * 应用偏移量
     * @param offsetX x轴偏移量
     * @param offsetY y轴偏移量
     */
    private applyPositionOffset(offsetX: number, offsetY: number) {
        // 优化：如果偏移量为0，则无需执行操作
        if (offsetX === 0 && offsetY === 0) {
            return;
        }
        this.nodes.forEach((node) => {
            node.setX(node.getX() + offsetX);
            node.setY(node.getY() + offsetY);
        });
    }

    // ======工具方法，简单的通用逻辑======

    /**
     * 对同一父节点的子节点按权重排序
     */
    private sortChildNodesByWeight(nodes: Array<XNode>) {
        if (nodes === undefined || nodes.length === 0) {
            throw new Error("参数异常");
        }
        // 按权重升序排列（权重大的在下方）
        return nodes.sort((a, b) => a.getWeight() - b.getWeight());
    }

    /**
     * 获取节点集合的最大X值
     * @param nodes 节点集合
     * @private
     */
    private getMaxXForNodes(nodes: Array<XNode>): number {
        let maxX = -Infinity;
        if (nodes === undefined || nodes.length === 0) {
            console.warn(`参数异常nodes:${nodes}`);
            return maxX;
        }
        // 遍历节点，找到最大X值
        nodes.forEach((node: XNode) => {
            maxX = Math.max(maxX, node.getX());
        });
        return maxX;
    }

    /**
     * 获取节点集合的最小X值
     * @param nodes 节点集合
     * @private
     */
    private getMinXForNodes(nodes: Array<XNode>): number {
        let minX = Infinity;
        if (nodes === undefined || nodes.length === 0) {
            console.warn(`参数异常nodes:${nodes}`);
            return minX;
        }
        // 遍历节点，找到最小X值
        nodes.forEach((node: XNode) => {
            minX = Math.min(minX, node.getX());
        });
        return minX;
    }

    /**
     * 获取节点集合的最大Y值
     * @param nodes 节点集合
     * @private
     */
    private getMaxYForNodes(nodes: Array<XNode>): number {
        let maxY = -Infinity;
        if (nodes === undefined || nodes.length === 0) {
            console.warn(`参数异常nodes:${nodes}`);
            return maxY;
        }
        // 遍历节点，找到最大Y值
        nodes.forEach((node: XNode) => {
            maxY = Math.max(maxY, node.getY());
        });
        return maxY;
    }

    /**
     * 获取节点集合的最小Y值
     * @param nodes 节点集合
     * @private
     */
    private getMinYForNodes(nodes: Array<XNode>): number {
        let minY = Infinity;
        if (nodes === undefined || nodes.length === 0) {
            console.warn(`参数异常nodes:${nodes}`);
            return minY;
        }
        // 遍历节点，找到最小Y值
        nodes.forEach((node: XNode) => {
            minY = Math.min(minY, node.getY());
        });
        return minY;
    }
}

export default AtomicTreeLayout;
