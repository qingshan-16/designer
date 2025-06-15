class XEdge {
  /**
   * 节点ID
   * @private
   */
  private id: string;

  /**
   * 源节点标识
   */
  private sourceId: string;

  /**
   * 目标节点标识
   */
  private targetId: string;

  // 无参构造函数 (带默认值)
  public constructor();
  // 全参构造函数
  public constructor(sourceId: string, targetId: string);
  // 构造函数实现
  public constructor(...args: any[]) {
    if (args.length === 0) {
      // 无参构造初始化
      this.id = "";
      this.sourceId = "";
      this.targetId = "";
    } else {
      // 全参构造初始化
      [this.id, this.sourceId, this.targetId] = args;
    }
  }

  // Getter & Setter 方法
  // ID
  public getId(): string {
    return this.id;
  }

  public setId(id: string): void {
    this.id = id;
  }

  // 源节点标识
  public getSourceId(): string {
    return this.sourceId;
  }

  public setSourceId(sourceId: string): void {
    this.sourceId = sourceId;
  }

  // 目标节点标识
  public getTargetId(): string {
    return this.targetId;
  }

  public setTargetId(targetId: string): void {
    this.targetId = targetId;
  }
}

export default XEdge;
