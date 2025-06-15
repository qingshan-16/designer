<template>
  <div v-show="isHovered" class="component-edge-item" @click.stop="onclick">
    <div class="component-edge-item-container">
      <div class="icon-wrap">
        <div class="icon-container icon-plus-light"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {BaseEdgeModel, GraphModel} from "@logicflow/core";
import {MULTICAST_NODE,} from "@/constant/ComponentType.ts";
import {onMounted, onUnmounted, ref} from "vue";
import Designer from "@/core/Designer.ts";
import {addBaseNode4Edge, addMulticastBranch4Edge} from "@/util/NodeUtil.ts";
import {XEvent, type XEventMap,} from "@/core/event/XEventType.ts";

const props = defineProps({
  model: {
    type: BaseEdgeModel,
    required: true,
  },
  graphModel: {
    type: GraphModel,
    required: true,
  },
});

const designer = Designer.getInstance();

const isHovered = ref<boolean>(false);

/**
 * 连线选中状态发生变化的回调事件
 * @param data
 */
const isEdgeActive = (data: XEventMap[XEvent.EdgeActive]) => {
  if (data.id === props.model.id) {
    isHovered.value = !!data.isHovered;
  }
};

const onclick = () => {
  const sourceNode = props.graphModel.getNodeModelById(
      props.model.sourceNodeId,
  );

  if (!sourceNode) return;


  // 如果此连线的源节点是"multicast-node"类型的，则添加动作应为添加一条新的分支
  if ((sourceNode.type as string) === MULTICAST_NODE) {
    addMulticastBranch4Edge(props.model);
  } else {
    addBaseNode4Edge(props.model);
  }
};

onMounted(() => {
  designer.addEventListener(XEvent.EdgeActive, isEdgeActive);
});

onUnmounted(() => {
  designer.removeEventListener(XEvent.EdgeActive, isEdgeActive);
});
</script>

<style scoped lang="scss">
.component-edge-item {
  width: 32px;
  height: 32px;
  box-sizing: content-box;
  border-radius: 8px;
  cursor: pointer;
  display: flex;

  .component-edge-item-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    display: flex;

    .icon-wrap {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      display: flex;
      overflow: hidden;
      justify-content: center;
      align-items: center;

      .icon-container {
        background-position: 50%;
        width: 32px;
        height: 32px;
      }
    }
  }
}
</style>
