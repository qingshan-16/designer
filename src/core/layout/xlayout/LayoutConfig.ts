/**
 * 布局的参数配置信息
 */
class LayoutConfig {
    /**
     * 水平间距
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

    // 无参构造函数 (带默认值)
    public constructor();
    // 全参构造函数
    public constructor(
        horizontalSpacing: number,
        verticalSpacing: number,
        rankdir: "LR" | "TB",
    );
    // 构造函数实现
    public constructor(...args: any[]) {
        if (args.length === 0) {
            // 无参构造初始化
            this.horizontalSpacing = 0;
            this.verticalSpacing = 0;
            this.rankdir = "LR";
        } else {
            // 全参构造初始化
            [this.horizontalSpacing, this.verticalSpacing, this.rankdir] = args;
        }
    }

    // 水平间距
    public getHorizontalSpacing(): number {
        return this.horizontalSpacing;
    }

    public setHorizontalSpacing(horizontalSpacing: number): void {
        this.horizontalSpacing = horizontalSpacing;
    }

    // 垂直间距
    public getVerticalSpacing(): number {
        return this.verticalSpacing;
    }

    public setVerticalSpacing(verticalSpacing: number): void {
        this.verticalSpacing = verticalSpacing;
    }

    // 排列方向
    public getRankdir(): "LR" | "TB" {
        return this.rankdir;
    }

    public setRankdir(rankdir: "LR" | "TB"): void {
        this.rankdir = rankdir;
    }
}

export default LayoutConfig;
