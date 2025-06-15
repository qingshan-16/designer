/**
 * 区域坐标信息，是当前图节点的坐标极点，并不是最大范围的矩形的顶点
 */
class CoordinateInfo {
    /**
     * 区域最大的x坐标
     */
    private maxX: number;
    /**
     * 区域最小X坐标
     */
    private minX: number;
    /**
     * 区域最大的y坐标
     */
    private maxY: number;
    /**
     * 区域最小y坐标
     */
    private minY: number;

    // 无参构造函数 (带默认值)
    public constructor();
    // 全参构造函数
    public constructor(maxX: number, minX: number, maxY: number, minY: number);
    // 构造函数实现
    public constructor(...args: any[]) {
        if (args.length === 0) {
            // 无参构造初始化
            this.maxX = -Infinity;
            this.minX = Infinity;
            this.maxY = -Infinity;
            this.minY = Infinity;
        } else {
            // 全参构造初始化
            [this.maxX, this.minX, this.maxY, this.minY] = args;
        }
    }

    // Getter & Setter 方法
    // 区域最大的x坐标
    public getMaxX(): number {
        if (this.maxX === -Infinity) {
            return 0;
        }
        return this.maxX;
    }

    public setMaxX(maxX: number): void {
        this.maxX = maxX;
    }

    // 区域最小的x坐标
    public getMinX(): number {
        if (this.minX === Infinity) {
            return 0;
        }
        return this.minX;
    }

    public setMinX(minX: number): void {
        this.minX = minX;
    }

    // 区域最大的y坐标
    public getMaxY(): number {
        if (this.maxY === -Infinity) {
            return 0;
        }
        return this.maxY;
    }

    public setMaxY(maxY: number): void {
        this.maxY = maxY;
    }

    // 区域最小的y坐标
    public getMinY(): number {
        if (this.minY === Infinity) {
            return 0;
        }
        return this.minY;
    }

    public setMinY(minY: number): void {
        this.minY = minY;
    }

    /**
     * 重置坐标信息
     * @param coordinateInfo
     */
    public resetByCoordinateInfo(coordinateInfo: CoordinateInfo): void {
        this.maxX = Math.max(this.maxX, coordinateInfo.getMaxX());
        this.minX = Math.min(this.minX, coordinateInfo.getMinX());
        this.maxY = Math.max(this.maxY, coordinateInfo.getMaxY());
        this.minY = Math.min(this.minY, coordinateInfo.getMinY());
    }

    /**
     * 重置坐标信息
     * @param x
     * @param y
     */
    public reset(x: number, y: number): void {
        this.maxX = Math.max(this.maxX, x);
        this.minX = Math.min(this.minX, x);
        this.maxY = Math.max(this.maxY, y);
        this.minY = Math.min(this.minY, y);
    }
}

export default CoordinateInfo;
