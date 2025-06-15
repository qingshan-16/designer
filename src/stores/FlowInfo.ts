import {defineStore} from "pinia";
import {type FlowInfo} from "@/type";

const useFlowInfoStore = defineStore("flow-info", {
    state: (): FlowInfo => {
        return {
            // 流程数据
            flowData: "{}",
        };
    },
    getters: {
        getFlowData(state): string {
            return state.flowData;
        },
    },
    actions: {
        changeFlowData(flowData: string) {
            this.flowData = flowData;
        },
    },
});

export default useFlowInfoStore;
