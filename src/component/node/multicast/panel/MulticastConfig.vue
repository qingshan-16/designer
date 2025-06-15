<template>
  <!-- 配置主体 -->
  <div class="drag-body">
    <VueDraggable class="drag-contain"
                  :disabled="false"
                  :animation="500"
                  v-model="branchList"
                  @end="onEnd"
    >
      <div v-for="item in branchList"
           :key="item.id"
           class="drag-item"
      >
        <div class="branchname-weight">
          <n-tag type="success" size="large">
            {{ item.weight }}
          </n-tag>
        </div>

        {{ item.name }}
      </div>
    </VueDraggable>
  </div>

</template>

<script setup lang="ts">
import {inject, onMounted, ref, type Ref} from "vue";
import {BaseNodeModel} from "@logicflow/core";
import {VueDraggable} from 'vue-draggable-plus'
import Designer from "@/core/Designer.ts";
import {layoutNow} from "@/core/layout";
import {WEIGHT_START} from "@/constant";

interface BranchItem {
  id: number;
  name: string;
  nodeId: string;
  weight: number;
}

const designer = Designer.getInstance();

// 获取当前节点
const currentNode =
    inject<Ref<BaseNodeModel>>("currentNode")!;

const branchList = ref<Array<BranchItem>>([]);

// 拖拽结束处理程序
const onEnd = () => {
  let reLayout = false;
  // 遍历排序后的branchList，获取其数组下标并重置对应的weight
  branchList.value.forEach((item: BranchItem, index: number) => {
    const nodeModelById = designer.lf.graphModel.getNodeModelById(item.nodeId);
    if (!nodeModelById) {
      console.error(`未找到${item.nodeId}节点，预期之外的错误`)
    } else if (WEIGHT_START === 0 && nodeModelById.properties.weight !== index) { // 只有当顺序（weight）发生变化是才会重置weight
      // 重置weight
      const refNodeModel = ref(nodeModelById);
      refNodeModel.value.properties.weight = index;
      item.weight = index;
      reLayout = true;
    } else if (WEIGHT_START === 1 && nodeModelById.properties.weight !== index + 1) {
      // 重置weight
      const refNodeModel = ref(nodeModelById);
      refNodeModel.value.properties.weight = index + 1;
      item.weight = index + 1;
      reLayout = true;
    }

  })
  if (reLayout) {
    // 重新布局
    layoutNow(false);
  }
}

onMounted(() => {
  // todo:当将基础节点设置为多选节点时，其子节点会延迟NodeUtil#LAYOUT_DELAY（添加）渲染。此处也对应的要延迟获取。 是不是可以通过监听解决？？？
  // 再添加/变更节点时，只有等待变更后才操作当前页面的渲染，已解决当前问题
  // 获取分支节点，构造拖拽排序原始数据
  currentNode.value.outgoing.nodes.forEach((item) => {
    branchList.value.push({
      id: item.properties.weight,
      name: item.properties.displayName,
      nodeId: item.id,
      weight: item.properties.weight,
    });
  })
  // 根据id升序排序
  branchList.value.sort((a, b) => a.id - b.id);
})
</script>

<style scoped lang="scss">

.drag-body {
  display: flex;
  height: 100%;


  .drag-contain {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background-color: rgb(125 209 132 / 5%);
    border-radius: 8px;

    .drag-item {
      display: flex;
      align-items: center;
      cursor: move;
      height: 25px;
      width: calc(100% - 16px);
      background-color: rgb(2 245 0 / 5%);
      border-radius: 8px;
      padding: 10px;
      font-size: 16px;
      font-weight: 800;

      .branchname-weight {
        margin-right: 60px;
        margin-left: 10px;
      }
    }
  }
}


</style>
