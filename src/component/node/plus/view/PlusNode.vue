<template>
  <div class="component-node-item">
    <div class="component-node-item-container">
      <div class="icon-wrap" @mousedown="onSelect" @mouseup="onUnSelect">
        <div class="icon-container icon-plus-light"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {BaseNodeModel, GraphModel} from "@logicflow/core";
import Designer from "@/core/Designer.ts";
import {addBaseNode4PlusNode} from "@/util/NodeUtil.ts";
import {ref} from "vue";

const props = defineProps({
  model: {
    type: BaseNodeModel,
    required: true,
  },
  graphModel: {
    type: GraphModel,
    required: true,
  },
});

const designer = Designer.getInstance();

const isMouseenter = ref(false);

const mousedownX = ref(0);

const mousedownY = ref(0);

const onSelect = (data: MouseEvent) => {
  isMouseenter.value = true;
  mousedownX.value = data.screenX;
  mousedownY.value = data.screenY;

};

const onUnSelect = (data: MouseEvent) => {
  if (isMouseenter.value) {
    var mouseupX = data.screenX;
    var mouseupY = data.screenY;
    if (Math.abs(mouseupX - mousedownX.value) < 16 && Math.abs(mouseupY - mousedownY.value) < 16) {
      addBaseNode4PlusNode(props.model)
    }
  }
};
</script>

<style scoped lang="scss">
.component-node-item {
  width: 32px;
  height: 32px;
  z-index: 10;
  box-sizing: content-box;
  border-radius: 8px;
  cursor: pointer;
  display: flex;

  .component-node-item-container {
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
