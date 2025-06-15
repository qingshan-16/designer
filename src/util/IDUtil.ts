/* eslint-disable no-bitwise */
class IDS {
    private _ids: Set<string>;

    /**
     * 构造函数用于初始化_id集合。
     */
    constructor() {
        this._ids = new Set();
    }

    /**
     * 生成一个唯一的ID
     * 该函数没有参数。
     * @returns {string} 返回一个由随机十六进制字符组成的字符串。
     */
    private generateId() {
        const id = "xxxxxxx".replace(/[x]/g, (c) => {
            // 为每个'x'生成一个随机的十六进制数字
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            // 将生成的数字转换为十六进制字符串
            return v.toString(16);
        });
        return id;
    }

    /**
     * 生成并返回一个唯一的ID。
     * 此方法会持续生成ID，直到找到一个未被使用的ID为止。
     *
     * @returns {any} 返回一个唯一的ID。
     */
    public getId() {
        // 生成一个ID
        let id = this.generateId();
        // 循环检查，直到找到一个未被使用的ID
        while (this._ids.has(id)) {
            id = this.generateId();
        }
        // 将找到的未被使用的ID添加到集合中
        this._ids.add(id);
        return id;
    }

    /**
     * 为集合添加ID。
     * @param {Array<string>} ids - 要添加的ID数组。
     */
    public addIds(ids: Array<string>) {
        ids.forEach((id: string) => {
            this._ids.add(id);
        });
    }

    /**
     * 为集合添加ID。
     * @param {string} id - 要添加的ID。
     */
    public addId(id: string) {
        this._ids.add(id);
    }

    /**
     * 为集合删除ID。
     * @param {string} id - 要删除的ID。
     */
    public deleteId(id: string) {
        if (this._ids.has(id)) {
            this._ids.delete(id);
        }
    }
}

export default IDS;

// export { IDS };
