import AtomicTreeLayout from "./AtomicTreeLayout.ts";
import BigXNode from "./BigXNode.ts";
import LayoutConfig from "./LayoutConfig.ts";
import XEdge from "./XEdge.ts";
import XNode from "./XNode.ts";
import CoordinateInfo from "@/core/layout/xlayout/CoordinateInfo.ts";

/**
 * XLayout布局器。参考坐标系为数学坐标系，即右上为正
 * 1、遍历整棵树，按照树的嵌套个数进行分组排序
 * 2、根据分组进行布局，按照嵌套的层级进行布局，从内向外进行布局，即从最小的嵌套树开始进行布局
 * 3、设定树的开始节点的坐标为（0，0），重新计算整棵树的坐标
 * 4、布局完成，返回结果
 */
class XLayout {
    /**
     * 全量的节点
     * @private
     */
    private nodes: Array<XNode>;

    /**
     * 全量的连线
     * @private
     */
    private edges: XEdge[];

    /**
     * 开始节点
     * @private
     */
    private startNode: XNode;

    /**
     * 结束节点
     * @private
     */
    private endNode: XNode;

    /**
     * 水品间距
     * @private
     */
    private horizontalSpacing: number;

    /**
     * 垂直间距
     * @private
     */
    private verticalSpacing: number;

    /**
     * 排列方向。
     * LR：自左向右
     * TB：自上向下
     * @default LR
     * @private
     */
    private rankdir: "LR" | "TB" = "LR";

    /**
     * 节点索引，key为节点id，value为节点对象
     * @private
     */
    private nodesMap: Map<string, XNode> = new Map();

    /**
     * 连线索引
     * @private
     */
    private edgesMap: Map<string, XEdge> = new Map();

    /**
     * 连线索引，key为源节点id，value为连线对象
     * @private
     */
    private edgesSourceMap: Map<string, XEdge[]> = new Map();

    /**
     * 连线索引，key为目标节点id，value为连线对象
     * @private
     */
    private edgesTargetMap: Map<string, XEdge[]> = new Map();

    /**
     * 所有原子树，key为原子树开始节点，value为原子树节点数组
     * @private
     */
    private atomicTreeMap: Map<string, BigXNode> = new Map();

    /**
     * 所有的分支树，key为当前分支开始节点的id，value为当前分支树的描述对象
     * 如果是原子则对应的嵌套分支的个数为0
     * @private
     */
    private branchTreeMap: Map<string, BigXNode> = new Map();

    /**
     * 所有的分支树，key为当前分支中嵌套的分支个数，value为当前分支树的描述对象
     * 如果是原子则对应的嵌套分支的个数为0
     * @private
     */
    private branchTreeLevelMap: Map<number, Array<BigXNode>> = new Map();

    /**
     * 已布局过的分支树map，key为分支树的开始节点的id，value为分支树的实例
     * @private
     */
    private layoutedBranchTreeMap = new Map<string, BigXNode>();

    /**
     * 是否初始化完成
     * @private
     */
    private isInit: boolean = false;

    constructor(
        nodes: Array<XNode>,
        edges: XEdge[],
        startNode: XNode,
        endNode: XNode,
        horizontalSpacing: number,
        verticalSpacing: number,
        rankdir: "LR" | "TB" = "LR",
    ) {
        this.nodes = nodes;
        this.edges = edges;
        this.startNode = startNode;
        this.endNode = endNode;
        this.horizontalSpacing = horizontalSpacing;
        this.verticalSpacing = verticalSpacing;
        this.rankdir = rankdir;
    }

    /**
     * 执行布局
     */
    public layout(): Array<XNode> {
        // 1、初始化
        this.init();
        // 2、布局整个图
        this.graphLayout();
        // 返回所有节点信息
        return this.nodes;
    }

    /**
     * 布局整个图
     */
    private graphLayout(): void {
        if (!this.isInit) {
            console.error("布局前请先初始化布局器");
            return;
        }
        // 从最小的key值开始遍历allBranchTreeMap
        // 1、获取排序后的键值数组（从小到大）
        const sortedKeys = Array.from(this.branchTreeLevelMap.keys()).sort(
            (a, b) => a - b,
        );
        // 2、按排序后的键顺序遍历，即从最小的嵌套分支树开始
        for (const key of sortedKeys) {
            const branchTrees = this.branchTreeLevelMap.get(key);
            // 如果branchTrees为空，则跳过循环
            if (!branchTrees) {
                console.error("当前等级分支树为空，理论上不会出现");
                continue;
            }
            // 对当前嵌套等级下的所有分支树逐一布局，当前的key可能为1，2，3，4......
            branchTrees.forEach((branchTree) => {
                // 布局分支树
                this.layoutBranchTree(branchTree);
                // 将当前分支树放入已布局过的分支树map中
                this.layoutedBranchTreeMap.set(
                    branchTree.getStartNode().getId(),
                    branchTree,
                );
            });
        }

        // 3、所有的分支节点都已经布局完成，开始布局整体
        // 当前整体可以看作一个单一的分支
        // 虚拟父节点
        const virtualNode = new XNode();
        // 此处为了保证第一个节点的x，y的值为0，所以"LR"布局时对虚拟父节点减去一个横向间距，"TB"布局时对虚拟父节点加上一个纵向间距
        switch (this.rankdir) {
            case "LR": {
                virtualNode.setX(0 - this.horizontalSpacing);
                virtualNode.setY(0);
                // 此方法中最终的结束节点不会参与最终布局
                // todo: 优化，最好单独一个方法，如果开始节点就是一个分支树，就会有问题
                this.branchLayout(this.startNode, virtualNode, this.endNode);

                // 设置结束节点的位置
                // 结束节点的x依据，是其父节点最大的x值+偏移量
                const parentNodes = this.endNode.getParentNodes();
                let maxX = 0;
                parentNodes.forEach((parentNode) => {
                    maxX = Math.max(maxX, parentNode.getX());
                });
                this.endNode.setX(maxX + this.horizontalSpacing);
                // 在"LR"布局下，结束节点与开始节点的Y坐标应该一致
                this.endNode.setY(this.startNode.getY());
                break;
            }
            case "TB": {
                virtualNode.setX(0);
                virtualNode.setY(0 + this.verticalSpacing);
                // 此方法中最终的结束节点不会参与最终布局
                // todo: 优化，最好单独一个方法，如果开始节点就是一个分支树，就会有问题
                this.branchLayout(this.startNode, virtualNode, this.endNode);

                // 设置结束节点的位置
                // 结束节点的x依据，是其父节点最大的x值+偏移量
                const parentNodes = this.endNode.getParentNodes();
                let minY = 0;
                parentNodes.forEach((parentNode) => {
                    minY = Math.min(minY, parentNode.getY());
                });
                this.endNode.setX(this.startNode.getX());
                // 在"TB"布局下，结束节点与开始节点的X坐标应该一致
                this.endNode.setY(minY - this.verticalSpacing);
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.rankdir}配置`);
        }
    }

    /**
     * 布局分支树
     *
     * @param branchTree 分支树
     * @private
     */
    private layoutBranchTree(branchTree: BigXNode): void {
        // 如果当前分支树是原子树，则不需要布局，直接返回
        if (this.atomicTreeMap.has(branchTree.getStartNode().getId())) {
            return;
        }
        // 1、获取分支树信息
        const startNode = branchTree.getStartNode();
        const endNode = branchTree.getEndNode();
        const nodes = branchTree.getNodes();
        // 2、获取所有分支的开始节点，并按照分支优先级排序
        const branchs: Array<XNode> = this.sortChildNodesByWeight(
            startNode.getChildNodes(),
        );
        if (branchs === undefined || branchs.length === 0) {
            throw new Error("子节点异常，子节点为undefined。");
        }
        // todo：是不是可以合并？？？
        // 3、构建分支及其所有节点的映射关系
        const branchMap: Map<XNode, Array<XNode>> = new Map();
        branchs.forEach((branch) => {
            // 包含结束节点
            const branchAllNode = this.getNodesBetween(branch, endNode);
            branchMap.set(branch, branchAllNode);
        });
        // 4、构建所有的分支的信息映射
        const branchCoordinateInfoMap: Map<XNode, CoordinateInfo> = new Map();
        // 计算、初始化分支信息
        branchs.forEach((branch) => {
            const branchCoordinateInfo = new CoordinateInfo();
            // todo：感觉不需要计算分支的高度和宽度
            branchCoordinateInfoMap.set(branch, branchCoordinateInfo);
        });

        // 5、对当前分支的每条分支开始布局，每个分支的起点都是（0，0）
        switch (this.rankdir) {
            case "LR": {
                branchs.forEach((branch) => {
                    // 虚拟父节点
                    const virtualNode = new XNode();
                    // 此处为了保证分支的第一个节点的x，y的值为0，所以"LR"布局时对虚拟父节点减去一个水平间距
                    virtualNode.setX(0 - this.horizontalSpacing);
                    virtualNode.setY(0);
                    this.branchLayout(branch, virtualNode, endNode);
                });
                break;
            }
            case "TB": {
                branchs.forEach((branch) => {
                    // 虚拟父节点
                    const virtualNode = new XNode();
                    // 此处为了保证分支的第一个节点的x，y的值为0，所以"TB"布局时对虚拟父节点加上一个间距
                    virtualNode.setX(0);
                    virtualNode.setY(0 + this.verticalSpacing);
                    this.branchLayout(branch, virtualNode, endNode);
                });
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.rankdir}配置`);
        }

        // 6、调整分支，避免碰撞
        // 调整分支，之前的布局每个分支的起点都是（0，0）
        // 获取分支的x，y的最大值和最小值
        branchMap.forEach((value: Array<XNode>, key: XNode) => {
            const branchCoordinateInfo = branchCoordinateInfoMap.get(key);
            if (branchCoordinateInfo == undefined) {
                throw new Error("！！！异常！！！理论错误");
            }
            if (value == undefined) {
                throw new Error("！！！异常！！！理论错误");
            }
            this.resetBranchCoordinateInfo(value, branchCoordinateInfo, endNode);
        });
        // 调整分支，避免碰撞
        // 上一个分支的坐标信息
        let previouCoordinateInfo = new CoordinateInfo();
        // 遍历分支
        for (let i = 0; i < branchs.length; i++) {
            const branch = branchs[i];
            // 获取当前分支的坐标信息
            const currentCoordinateInfo = branchCoordinateInfoMap.get(branch)!;
            // 获取当前分支的所有节点
            const currentBranchNodes = branchMap.get(branch);
            // 从第二个分支开始移动
            if (i > 0) {
                switch (this.rankdir) {
                    case "LR": {
                        // "LR"布局时获取节点中的Y的最大值和最小值
                        const minY = previouCoordinateInfo.getMinY();
                        const maxY = currentCoordinateInfo.getMaxY();
                        // 计算当前分支的Y的偏移量
                        const currentOffsetY =
                            Math.abs(minY) + Math.abs(maxY) + this.verticalSpacing;
                        this.repositionNodes(0, currentOffsetY * -1, currentBranchNodes!);
                        break;
                    }
                    case "TB": {
                        // "TB"布局时获取节点中的X的最大值和最小值
                        const maxX = previouCoordinateInfo.getMaxX();
                        const minX = currentCoordinateInfo.getMinX();
                        // 计算当前分支的Y的偏移量
                        const currentOffsetX =
                            Math.abs(maxX) + Math.abs(minX) + this.horizontalSpacing;
                        this.repositionNodes(currentOffsetX, 0, currentBranchNodes!);
                        break;
                    }
                    default:
                        throw new Error(`非法的rankdir:${this.rankdir}配置`);
                }
            }
            // 重新计算当前分支的坐标信息
            // 因为当前分支的节点位置已经更新，对应的节点的范围坐标信息也应该更新，不然会影响下一级分支的布局
            const branchNodes = branchMap.get(branch);
            if (branchNodes == undefined) {
                throw new Error("！！！异常！！！理论错误");
            }
            this.resetBranchCoordinateInfo(
                branchNodes,
                currentCoordinateInfo,
                endNode,
            );
            previouCoordinateInfo = currentCoordinateInfo;
        }

        // todo: 这里的最大值和最小值是不是可以抽象进BigXNode中？？？
        // 7、结算当前分支树的开始节点和结束节点的位置
        // "LR"布局时开始节点和结束节点的Y坐标应该一致
        // "TB"布局布局时开始节点和结束节点的X坐标应该一致
        switch (this.rankdir) {
            case "LR": {
                // "LR"布局时获取节点中的Y的最大值和最小值
                let maxY = this.getMaxYForNodes(branchs);
                let minY = this.getMinYForNodes(branchs);
                if (maxY === -Infinity || minY === Infinity) {
                    throw new Error(
                        `分支节点异常，分支节点的maxY:${maxY}和minY:${minY}未被正确赋值`,
                    );
                }
                // 设置开始节点和结束节点的位置
                // 开始节点的x依据，是其子节点最小的x值-偏移量
                // todo：直接get(0)，合适吗？
                let minX: number = this.getMinXForNodes(branchs);
                startNode.setX(minX - this.horizontalSpacing);
                startNode.setY((maxY + minY) / 2);
                // 计算结束节点的位置
                // 结束节点X值的依据，是其父节点最大的x值+偏移量
                const parentNodes = endNode.getParentNodes();
                let maxX: number = this.getMaxXForNodes(parentNodes);
                if (maxX === -Infinity) {
                    throw new Error(`分支节点异常，分支节点的maxX:${maxX}未被正确赋值`);
                }
                endNode.setX(maxX + this.horizontalSpacing);
                endNode.setY((maxY + minY) / 2);
                break;
            }
            case "TB": {
                // "TB"布局时获取节点中的X的最大值和最小值
                let maxX = this.getMaxXForNodes(branchs);
                let minX = this.getMinXForNodes(branchs);
                if (maxX === -Infinity || minX === Infinity) {
                    throw new Error(
                        `分支节点异常，分支节点的maxX:${maxX}和minX:${minX}未被正确赋值`,
                    );
                }
                // 设置开始节点和结束节点的位置
                // 开始节点Y值的依据，是其子节点最大的Y值+偏移量
                let maxY: number = this.getMaxYForNodes(branchs);
                startNode.setX((maxX + minX) / 2);
                startNode.setY(maxY + this.verticalSpacing);
                // 计算结束节点的位置
                // 结束节点的x依据，是其父节点最大的x值+偏移量
                const parentNodes = endNode.getParentNodes();
                let minY: number = this.getMinYForNodes(parentNodes);
                if (minY === Infinity) {
                    throw new Error(`分支节点异常，分支节点的minY:${minY}未被正确赋值`);
                }
                endNode.setX((maxX + minX) / 2);
                endNode.setY(minY - this.verticalSpacing);
                break;
            }
            default:
                throw new Error(`非法的rankdir:${this.rankdir}配置`);
        }

        // 8、最终调整当前布局，将当前分支树的开始节点调整为（0，0）
        const offsetX = 0 - startNode.getX();
        const offsetY = 0 - startNode.getY();
        this.repositionNodes(offsetX, offsetY, nodes);
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
        // 如果当前节点是分支节点，则进行分支布局
        if (currentNode.isBranch()) {
            // 1、如果是分支节点
            // 2、在已经布局过的分支节树缓存中获取布局过的分支树
            const laoutBranchTree = this.layoutedBranchTreeMap.get(
                currentNode.getId(),
            );
            // 如果再缓存中未找到则抛出异常
            if (laoutBranchTree === undefined) {
                throw new Error("！！！异常！！！理论错误");
            }
            // todo: 理论上都是布局完的，不需要重新布局，只重新定位就好
            // 3、根据父节点的坐标重新定位节点位置
            switch (this.rankdir) {
                case "LR": {
                    const startNode = laoutBranchTree.getStartNode();
                    const offsetX =
                        parentNode.getX() - startNode.getX() + this.horizontalSpacing;
                    const offsetY = parentNode.getY() - startNode.getY();
                    this.repositionNodes(offsetX, offsetY, laoutBranchTree.getNodes());
                    break;
                }
                case "TB": {
                    const startNode = laoutBranchTree.getStartNode();
                    const offsetX = parentNode.getX() - startNode.getX();
                    const offsetY =
                        parentNode.getY() - startNode.getY() - this.verticalSpacing;
                    this.repositionNodes(offsetX, offsetY, laoutBranchTree.getNodes());
                    break;
                }
                default:
                    throw new Error(`非法的rankdir:${this.rankdir}配置`);
            }
            // 4、重置下一次当前节点为分支树结束节点的下一个节点，下一次的父节点为当前分支树结束节点
            const tempEndNode = laoutBranchTree.getEndNode();
            const nextNodes = tempEndNode.getChildNodes();
            if (nextNodes === undefined || nextNodes.length === 0) {
                throw new Error("子节点异常，子节点为undefined。");
            }
            // todo: 在这种情况下的子节点有且只有一个。所以此处是合理的
            const nextNode = nextNodes[0];
            if (nextNode === undefined) {
                throw new Error("子节点异常，子节点为undefined。");
            }
            newCurrentNode = nextNode;
            newParentNode = tempEndNode;
        } else {
            // 1、如果不是分支节点
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
            switch (this.rankdir) {
                case "LR": {
                    currentNode.setX(parentNode.getX() + this.horizontalSpacing);
                    currentNode.setY(parentNode.getY());
                    break;
                }
                case "TB": {
                    currentNode.setX(parentNode.getX());
                    currentNode.setY(parentNode.getY() - this.verticalSpacing);
                    break;
                }
                default:
                    throw new Error(`非法的rankdir:${this.rankdir}配置`);
            }
            newCurrentNode = childNode;
            newParentNode = currentNode;
        }
        // 如果下一次递归的当前节点是结束节点，则结束递归
        if (newCurrentNode.getId() === endNode.getId()) {
            return;
        }
        // 递归布局
        this.branchLayout(newCurrentNode, newParentNode, endNode);
        return;
    }

    /**
     * 初始化相关数据
     * @private
     */
    private init(): void {
        // 1、初始化创建节点索引
        if (this.nodes === undefined || this.nodes.length === 0) {
            throw new Error("节点数据异常，节点数据为undefined。");
        }
        this.nodesMap = new Map(this.nodes.map((node) => [node.getId(), node]));

        // 2、初始化创建连线索引
        if (this.edges === undefined || this.edges.length === 0) {
            throw new Error("连线数据异常，连线数据为undefined。");
        }
        this.edgesMap = new Map(this.edges.map((edge) => [edge.getId(), edge]));
        // 遍历所有边，填充 edgesSourceMap 和 edgesTargetMap
        this.edges.forEach((edge) => {
            const sourceId = edge.getSourceId();
            const targetId = edge.getTargetId();

            if (!this.edgesSourceMap.has(sourceId)) {
                this.edgesSourceMap.set(sourceId, []);
            }
            this.edgesSourceMap.get(sourceId)?.push(edge);

            if (!this.edgesTargetMap.has(targetId)) {
                this.edgesTargetMap.set(targetId, []);
            }
            this.edgesTargetMap.get(targetId)?.push(edge);
        });

        // 3、初始化填充节点信息
        this.fillChildNodes();
        this.fillParentNodes();

        // 4、初始化寻找所有的原子树
        this.fillAtomicTree();

        // 5、初始化填充分支树
        this.fillBranchTree();

        // 6、更新初始化标志位
        this.isInit = true;
    }

    /**
     * 填充分支树信息和分支树包含的层级关系
     * @private
     */
    private fillBranchTree(): void {
        if (this.nodes === undefined || this.nodes.length === 0) {
            throw new Error("节点数据异常，节点数据为undefined。");
        }
        // 1、获取所有的分支节点
        const allBranchNodes = this.nodes.filter((node) => {
            return node.isBranch();
        });
        // 2、遍历填充信息
        allBranchNodes.forEach((node) => {
            // 获取聚合节点
            const joinNode = node.getJoinNode();
            if (joinNode === null || joinNode === undefined) {
                throw new Error("聚合节点异常，聚合节点为undefined。");
            }
            // 1）、获取树之间的所有节点
            const allNodes = this.getNodesBetween(node, joinNode);
            // 2）、构造BigXNode
            const bigXNode = new BigXNode();
            bigXNode.setStartNode(node);
            bigXNode.setEndNode(joinNode);
            bigXNode.setNodes(allNodes);

            // 3）、填充branchTree
            this.branchTreeMap.set(node.getId(), bigXNode);

            // 填充分支树的包含层级关系
            // 1）、分支树包含层级计算
            let branchCount = 0;
            allNodes.forEach((node) => {
                if (node.isBranch()) {
                    branchCount++;
                }
            });
            // 2）、写入分支树嵌套层级map
            const sameLevelBigXNodes = this.branchTreeLevelMap.get(branchCount);
            if (sameLevelBigXNodes === undefined || sameLevelBigXNodes === null) {
                this.branchTreeLevelMap.set(branchCount, []);
            }
            this.branchTreeLevelMap.get(branchCount)!.push(bigXNode);
        });
    }

    /**
     * 对原子树进行布局，并构造一个对应的BigNode返回
     * 此时进行布局时的开始节点为（0，0）
     * @param nodes 原子树全量的节点集合
     * @param startNode 开始节点
     * @param endNode 结束节点
     * @private
     */
    private layoutAtomicTreeTree(
        nodes: Array<XNode>,
        startNode: XNode,
        endNode: XNode,
    ): BigXNode {
        // 构造BigXNode
        const bigXNode: BigXNode = new BigXNode();
        bigXNode.setNodes(nodes);
        bigXNode.setStartNode(startNode);
        bigXNode.setEndNode(endNode);
        // 1、校验原子树
        // 获取原子树的子节点
        const childNodes: Array<XNode> = startNode.getChildNodes();
        // 判断子节点是否为空
        if (childNodes === undefined || childNodes.length === 0) {
            throw new Error("子节点异常，子节点为undefined。");
        }
        // 2、对原子树进行布局
        // 创建原子树的布局对象
        const atomicTreeLayout = new AtomicTreeLayout(
            nodes,
            startNode,
            endNode,
            new LayoutConfig(
                this.horizontalSpacing,
                this.verticalSpacing,
                this.rankdir,
            ),
        );
        // 执行布局
        atomicTreeLayout.layout();

        // 填充BigXNode
        bigXNode.setHeight(atomicTreeLayout.getHeight());
        bigXNode.setWidth(atomicTreeLayout.getWidth());
        return bigXNode;
    }

    /**
     * 获取所有的原子树，即一个分支节点与其对应的聚合节点之间的结构，且之间没有任何其他分支或复杂结构只有简单的node与edge
     */
    private fillAtomicTree(): void {
        if (this.nodes === undefined || this.nodes.length === 0) {
            throw new Error("节点数据异常，节点数据为undefined。");
        }
        // 1、获取所有的分支节点
        const allBranchNodes = this.nodes.filter((node) => {
            return node.isBranch();
        });
        // 2、找出所有的原子树
        allBranchNodes.forEach((node) => {
            // 1）、获取聚合节点
            const joinNode = node.getJoinNode();
            if (joinNode === null || joinNode === undefined) {
                throw new Error("聚合节点异常，聚合节点为undefined。");
            }
            // 2）、判断是否是原子树
            const atomicTreeNodes = this.isAtomicTree(node, joinNode);
            // 3）、如果是原子树则添加到allAtomicTree中
            if (atomicTreeNodes !== undefined && atomicTreeNodes.length > 0) {
                // 构造BigXNode并且进行初始化布局
                const bigXNode = this.layoutAtomicTreeTree(
                    atomicTreeNodes,
                    node,
                    joinNode,
                );
                // 填充atomicTree
                this.atomicTreeMap.set(bigXNode.getStartNode().getId(), bigXNode);
            }
        });
    }

    /**
     * 判断两个节点之间的节点是否是原子树，如果节点是原子树则返回节点数组，否则返回空数组
     * @param startNode 开始节点
     * @param endNode 结束节点
     * @returns 一个XNode类型的数组。如果数组不为空，则表示在开始节点和结束节点之间的节点是一个原子树。
     */
    private isAtomicTree(startNode: XNode, endNode: XNode): Array<XNode> {
        let rs = new Array<XNode>();
        // 1、校验入参的合法性
        if (
            startNode === undefined ||
            endNode == undefined ||
            startNode.getId() === endNode.getId()
        ) {
            throw new Error("non element in between startNode and endNode");
        }
        // 2、获取两个节点直接的所有节点
        const allNodes = this.getNodesBetween(startNode, endNode);
        // 3、找出其中的分支节点
        const allBranchNodes = allNodes.filter((node) => {
            return node.isBranch();
        });
        // 4、如果存在一个分支节点，即原子树本身的分支节点，视为原子树，则返回当前节点之间的所有节点
        if (allBranchNodes === undefined || allBranchNodes.length === 1) {
            rs = allNodes;
        }
        // 5、返回
        return rs;
    }

    /**
     * 填充节点的子节点集合
     */
    private fillChildNodes(): void {
        if (this.nodes === undefined || this.nodes.length === 0) {
            throw new Error("节点数据异常，节点数据为undefined。");
        }
        this.nodes.forEach((node) => {
            // 查询以当前节点为父节点的连线
            const getoutEdges: XEdge[] = this.getEdgeBySourceNodeId(node.getId());
            // 1、填充子节点。当前连线的所有目标节点就是子节点的集合
            getoutEdges.forEach((edge) => {
                node.getChildNodes().push(this.getNodeById(edge.getTargetId()));
            });
            // 2、标记当前节点是否为分支节点。
            if (
                node.getChildNodes() === undefined ||
                node.getChildNodes().length <= 1
            ) {
                node.setIsBranch(false);
            } else {
                node.setIsBranch(true);
            }
            // 3、设置节点对应的聚合节点
            if (node.isBranch()) {
                node.setJoinNode(this.getNodeById(node.getJoinNodeId()));
            }
        });
    }

    /**
     * 填充节点的父节点集合
     *
     */
    private fillParentNodes(): void {
        if (this.nodes === undefined || this.nodes.length === 0) {
            throw new Error("节点数据异常，节点数据为undefined。");
        }
        this.nodes.forEach((node) => {
            // 查询以当前节点为父节点的连线
            const getoutEdges: XEdge[] = this.getEdgeByTargetNodeId(node.getId());
            // 1、填充子节点。当前连线的所有目标节点就是子节点的集合
            getoutEdges.forEach((edge) => {
                node.getParentNodes().push(this.getNodeById(edge.getSourceId()));
            });
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
     * 根据节点id获取节点
     * @param nodeId 节点id
     * @private
     */
    private getNodeById(nodeId: string): XNode {
        // 缓存不为空时，从缓存中查找
        if (this.nodesMap && this.nodesMap.size !== 0) {
            // 如果缓存中存在该节点，则返回该节点，否则抛出异常
            if (this.nodesMap.has(nodeId)) {
                return this.nodesMap.get(nodeId)!;
            } else {
                throw new Error(`节点缓存中不存在节点id为${nodeId}的节点`);
            }
        } else {
            // 缓存为空时，从nodes数组中查找
            console.warn("节点缓存为null");
            if (this.nodes === undefined || this.nodes.length === 0) {
                throw new Error("nodes is null");
            }
            const rs = this.nodes.filter((node: XNode) => {
                node.getId() === nodeId;
            });
            if (rs === undefined || rs[0] === undefined) {
                throw new Error(`not find node by id(${nodeId})`);
            }
            return rs[0];
        }
    }

    /**
     * 根据（源）节点id获取连线
     * @param sourceNodeId 源节点id
     * @private
     */
    private getEdgeBySourceNodeId(sourceNodeId: string): XEdge[] {
        if (sourceNodeId === this.endNode.getId()) {
            // console.info("没有以结束节点为源节点的连线");
            return [];
        }
        // 缓存不为空时，从缓存中查找
        if (this.edgesSourceMap && this.edgesSourceMap.size !== 0) {
            // 如果缓存中存在该连线，则返回该连线，否则抛出异常
            if (this.edgesSourceMap.has(sourceNodeId)) {
                return this.edgesSourceMap.get(sourceNodeId)!;
            } else {
                throw new Error(`连线缓存中不存在节点id为${sourceNodeId}的节点`);
            }
        } else {
            // 缓存为空时，从edges数组中查找
            console.warn("连线缓存为null");
            if (this.edges === undefined || this.edges.length === 0) {
                throw new Error("连线数组是null");
            }
            const rs = this.edges.filter((edge) => {
                edge.getSourceId() === sourceNodeId;
            });
            if (rs === undefined) {
                throw new Error(`not find edge by id(${sourceNodeId})`);
            }
            return rs;
        }
    }

    /**
     * 根据（目标）节点id获取连线
     * @param targetNodeId 目标节点id
     * @private
     */
    private getEdgeByTargetNodeId(targetNodeId: string): XEdge[] {
        if (targetNodeId === this.startNode.getId()) {
            // console.info("没有以开始节点为目标节点的连线");
            return [];
        }
        // 缓存不为空时，从缓存中查找
        if (this.edgesTargetMap && this.edgesTargetMap.size !== 0) {
            // 如果缓存中存在该连线，则返回该连线，否则抛出异常
            if (this.edgesTargetMap.has(targetNodeId)) {
                return this.edgesTargetMap.get(targetNodeId)!;
            } else {
                throw new Error(`连线缓存中不存在节点id为${targetNodeId}的节点`);
            }
        } else {
            // 缓存为空时，从edges数组中查找
            console.warn("连线缓存为null");
            if (this.edges === undefined || this.edges.length === 0) {
                throw new Error("连线数组是null");
            }
            const rs = this.edges.filter((edge) => {
                edge.getTargetId() === targetNodeId;
            });
            if (rs === undefined) {
                throw new Error(`not find edge by id(${targetNodeId})`);
            }
            return rs;
        }
    }

    /**
     * 移动节点的位置
     * @param offsetX x偏移量
     * @param offsetY y偏移量
     * @param nodes 要更新的节点集合
     * @private
     */
    private repositionNodes(
        offsetX: number,
        offsetY: number,
        nodes: Array<XNode>,
    ): void {
        // 优化：如果偏移量为0，则无需执行操作
        if (offsetX === 0 && offsetY === 0) {
            return;
        }
        nodes.forEach((node) => {
            node.setX(node.getX() + offsetX);
            node.setY(node.getY() + offsetY);
        });
    }

    /**
     * 获取两个节点之间的所有节点
     * @param startNode 开始节点
     * @param endNode 结束节点
     * @private
     */
    private getNodesBetween(startNode: XNode, endNode: XNode): Array<XNode> {
        const allNodes = new Set<XNode>();
        // dfs遍历节点
        this.dfs(startNode, endNode, allNodes);
        // 转化为数组并返回
        return Array.from(allNodes);
    }

    /**
     * 深度优先搜索
     * @param node 当前节点，结束节点
     * @param endNode 结束节点
     * @param allNodes 结果集
     * @returns
     */
    private dfs(node: XNode, endNode: XNode, allNodes: Set<XNode>): void {
        allNodes.add(node);
        // 1、如果当前节点是结束节点，则返回
        if (node.getId() === endNode.getId()) {
            return;
        }
        // 2、遍历当前节点的所有子节点
        for (const child of node.getChildNodes()) {
            // 递归调用dfs
            this.dfs(child, endNode, allNodes);
        }
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

    /**
     * 重置分支的坐标信息
     * @param modes
     * @param coordinateInfo
     * @param ignoreNode
     * @private
     */
    private resetBranchCoordinateInfo(
        modes: Array<XNode>,
        coordinateInfo: CoordinateInfo,
        ignoreNode: XNode,
    ): void {
        if (modes === undefined || modes.length === 0) {
            return;
        }
        modes.forEach((node) => {
            // 忽略结束节点
            if (node.getId() !== ignoreNode.getId()) {
                coordinateInfo.reset(node.getX(), node.getY());
            }
        });
    }
}

export default XLayout;
