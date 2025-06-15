import type {XEventMap, XEventType} from "./XEventType";

type EventHandler<T extends keyof XEventMap> = (
    args: XEventMap[T]
) => void;

export class XEventEmitter {
    private _events = new Map<keyof XEventMap, Set<EventHandler<any>>>();

    /**
     * 注册事件监听
     * @param type 事件类型
     * @param handler 事件处理函数
     */
    on<T extends XEventType>(type: T, handler: EventHandler<T>): void {
        if (!this._events.has(type)) {
            this._events.set(type, new Set());
        }
        this._events.get(type)!.add(handler);
    }

    /**
     * 注册一次性事件监听
     * @param type 事件类型
     * @param handler 事件处理函数
     */
    once<T extends XEventType>(type: T, handler: EventHandler<T>): void {
        const wrapper = ((...args) => {
            handler(...args);
            this.off(type, wrapper);
        }) as EventHandler<T>;
        this.on(type, wrapper);
    }

    /**
     * 移除事件监听
     * @param type 事件类型
     * @param handler 要移除的处理函数（不传则移除该类型所有监听）
     */
    off<T extends XEventType>(type: T, handler?: EventHandler<T>): void {
        if (!this._events.has(type)) return;

        if (handler) {
            this._events.get(type)!.delete(handler);
        } else {
            this._events.delete(type);
        }
    }

    /**
     * 触发事件
     * @param type 事件类型
     * @param args 事件参数
     */
    emit<T extends XEventType>(
        type: T,
        args: XEventMap[T]
    ): void {
        this._events.get(type)?.forEach((handler) => {
            try {
                handler(args);
            } catch (err) {
                console.error(`Error handling ${type} event:`, err);
            }
        });
    }

    /**
     * 清除所有事件监听
     */
    clear(): void {
        this._events.clear();
    }
}
