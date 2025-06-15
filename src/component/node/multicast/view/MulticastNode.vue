<template>
  <n-modal
      v-model:show="deleteModelValue"
      preset="dialog"
      :title="t('multicast.node.delete.title')"
      :content="t('multicast.node.delete.message')"
      :positive-text="t('multicast.node.delete.button.confirm')"
      :negative-text="t('multicast.node.delete.button.cancel')"
      @positive-click="deleteConfirm"
      @negative-click="deleteCancel"
  >
  </n-modal>
  <div class="component-node-item">
    <div class="component-node-item-container" :class="selectClass">
      <!-- 图片 -->
      <XSimpleIcon icon-class-name="icon-node-multicast"></XSimpleIcon>
      <!-- 描述信息 -->
      <div :class="itemViewClass">
        <n-popover :delay="500">
          <template #trigger>
            <div class="item-name">
              <span class="canvas-item-title">
                {{ t("multicast.node.title") }}
              </span>
            </div>
          </template>
          <span> {{ t("multicast.node.title") }} </span>
        </n-popover>
      </div>
      <!-- 输出锚点 -->
      <span :class="outgoingCircleClass">
        <span>
          <span> </span>
        </span>
      </span>
      <!-- 操作栏 -->
      <div
          class="operation-area"
          :class="haveErrors"
          v-show="props.model.id !== START_NODE_ID"
      >
        <div class="icon-wrapper">
          <icon-copy></icon-copy>
        </div>
        <div class="icon-wrapper" @click.stop="onDelete">
          <icon-delete></icon-delete>
        </div>
      </div>
      <div class="transition-area"></div>
      <!-- 配置校验提示 -->
      <div
          v-show="!props.model.properties.validator"
          class="errors-count icon-errors"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {BaseNodeModel, GraphModel, LogicFlow} from "@logicflow/core";
import {NModal} from "naive-ui";
import IconCopy from "@/assets/image/svg/icon-copy.svg";
import IconDelete from "@/assets/image/svg/icon-delete.svg";
import XSimpleIcon from "@/component/node/common/XSimpleIcon.vue";
import {BASE_EDGE} from "@/constant/ComponentType.ts";
import {layout} from "@/core/layout";
import {START_NODE_ID} from "@/constant";
import Designer from "@/core/Designer.ts";
import {XEvent, type XEventMap} from "@/core/event/XEventType.ts";
import {Layout} from "@/type";

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
const {t} = useI18n();

const designer = Designer.getInstance();

const selectClass = ref("");

const onSelect = (data: XEventMap[XEvent.NodeSelect]) => {
  if (data.id === props.model.id) {
    selectClass.value = "x-node-selected";
  }
};

const onUnSelect = (data: XEventMap[XEvent.NodeUnSelect]) => {
  if (data.id === props.model.id) {
    selectClass.value = "";
  }
};

const outgoingCircleClass = ref<string>(
    designer.layoutType === Layout.HORIZONTAL
        ? "outgoing-circle-right"
        : "outgoing-circle-bottom",
);

const itemViewClass = ref<string>(designer.layoutType === Layout.HORIZONTAL
    ? "item-view-bottom"
    : "item-view-right");

const onLayoutChange = (data: XEventMap[XEvent.LayoutChang]) => {
  switch (data.layoutType) {
    case Layout.HORIZONTAL: {
      outgoingCircleClass.value = "outgoing-circle-right";
      itemViewClass.value = "item-view-bottom";
      break;
    }
    case Layout.VERTICAL: {
      outgoingCircleClass.value = "outgoing-circle-bottom";
      itemViewClass.value = "item-view-right";
      break;
    }
    default: {
      outgoingCircleClass.value = "outgoing-circle-right";
      itemViewClass.value = "item-view-bottom";
      break;
    }
  }
};

const haveErrors = computed(() => {
  return props.model.properties.validator ? "" : "operation-area-haveerrors";
});

const onDelete = () => {
  deleteModelValue.value = !deleteModelValue.value;
};

// 删除提示框的开关
const deleteModelValue = ref(false);
const deleteTitle = t("multicast.node.delete.title");

const deleteMessage = ref(t("multicast.node.delete.message"));

const deleteConfirm = () => {
  // 执行删除处理程序
  handleDelete();
};
const deleteCancel = () => {
};

/**
 * 删除处理程序
 * @param deleteBranch 删除d当前整个并行处理
 */
const handleDelete = async () => {
  // 并行处理节点
  const multicatNode = props.model;

  const multicasIncomingNode: BaseNodeModel[] =
      props.graphModel.getNodeIncomingNode(multicatNode.id);
  // 并行处理节点的上一个节点
  const multicastPrevious = multicasIncomingNode[0];

  const jointOutgoingNode: BaseNodeModel[] =
      props.graphModel.getNodeOutgoingNode(multicatNode.properties.jointNodeId);
  // 该并行处理的聚合节点的下一个节点
  const jointNext = jointOutgoingNode[0];

  const branchAllNodes = new Set<string>();

  // 删除整个并行处理
  getBranchAllNodes(
      multicatNode.id,
      multicatNode.properties.jointNodeId,
      branchAllNodes,
  );
  branchAllNodes.add(multicatNode.id);
  branchAllNodes.add(multicatNode.properties.jointNodeId);
  branchAllNodes.forEach((nodeId) => {
    // 删除进、出的线和当前节点
    props.graphModel.deleteNode(nodeId);
  });
  const newEdge = {
    id: designer.idGenerator.getId(),
    type: BASE_EDGE,
    sourceNodeId: multicastPrevious.id,
    targetNodeId: jointNext.id,
  };
  // 获取当前图的数据
  const graphData: LogicFlow.GraphConfigData =
      designer.lf.getGraphData() as LogicFlow.GraphConfigData;
  if (!graphData.edges) graphData.edges = [];
  graphData.edges.push(newEdge);

  // 等待布局完成
  const rs = await layout.layoutGraph({
    nodes: graphData.nodes || [],
    edges: graphData.edges || [],
  });

  // 移动节点到布局后的位置
  rs.nodes.forEach((node: any) => {
    designer.lf.graphModel.moveNode2Coordinate(
        node.id,
        node.data.x,
        node.data.y,
        false,
    );
  });

  // 为当前并行处理的上一个节点和当前并行处理结束下一个节点直接重新连线
  props.graphModel.addEdge(newEdge);
};

/**
 * 获取当前分支的所有节点（不包括开始节点和结束节点）
 * @param branchStartNodeId 开始节点
 * @param branchEndNodeId 结束节点
 * @param branchAllNodes 该分支中的所有节点（不包括开始节点和结束节点）
 */
const getBranchAllNodes = (
    branchStartNodeId: string,
    branchEndNodeId: string,
    branchAllNodes: Set<string>,
) => {
  const chrildNodes: BaseNodeModel[] =
      designer.lf.graphModel.getNodeOutgoingNode(branchStartNodeId);
  if (chrildNodes.length) {
    chrildNodes.forEach((childNode: BaseNodeModel) => {
      if (childNode.id === branchEndNodeId) {
        return;
      }
      getBranchAllNodes(childNode.id, branchEndNodeId, branchAllNodes);
      branchAllNodes.add(childNode.id);
    });
  }
};

onMounted(() => {
  props.model.setProperty("displayName", "multicast.node.title");
  // 监听节点选中的自定义事件
  designer.addEventListener(XEvent.NodeSelect, onSelect);
  designer.addEventListener(XEvent.NodeUnSelect, onUnSelect);
  designer.addEventListener(XEvent.LayoutChang, onLayoutChange);
});

onUnmounted(() => {
  // 移除节点选中的自定义事件
  designer.removeEventListener(XEvent.NodeSelect, onSelect);
  designer.removeEventListener(XEvent.NodeUnSelect, onUnSelect);
  designer.removeEventListener(XEvent.LayoutChang, onLayoutChange);
});
</script>

<style scoped lang="scss">
.component-node-item {
  width: 52px;
  height: 52px;
  display: inline-block;
  font-size: 14px;
  color: #252b3a;
  line-height: 1.2;
  pointer-events: all;
  white-space: normal;

  .component-node-item-container {
    z-index: 999;
    position: relative;
    box-sizing: content-box;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 2px 6px 0 rgba(37, 43, 58, 0.1);
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .item-view-bottom {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);

      .item-name {
        max-width: 90px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        .canvas-item-title {
          color: #252b3a;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }
      }
    }

    .item-view-right {
      position: absolute;
      top: 50%;
      left: 120%;
      transform: translateY(-50%);

      .item-name {
        max-width: 90px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        .canvas-item-title {
          color: #252b3a;
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }
      }
    }

    .outgoing-circle-right {
      width: 18px;
      height: 18px;
      position: absolute;
      right: -9px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 0 9px 9px 0;
      background-color: #fff;
      border: 1px solid transparent;
      border-left: none;

      > span {
        position: absolute;
        right: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background-color: #dbdbdb;

        > span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #71757f;
        }
      }
    }

    .outgoing-circle-bottom {
      width: 18px;
      height: 18px;
      position: absolute;
      bottom: -9px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 0 0 9px 9px;
      background-color: #fff;
      border: 1px solid transparent;
      border-left: none;

      > span {
        position: absolute;
        right: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background-color: #dbdbdb;

        > span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #71757f;
        }
      }
    }

    .operation-area {
      display: none;
      justify-content: flex-end;
      position: absolute;
      bottom: calc(100% + 5px);
      width: 100%;
      z-index: 999;

      .icon-wrapper {
        background-color: #fff;
        box-shadow: 0 2px 6px 0 rgba(37, 43, 58, 0.3);
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;

        &:hover {
          background-color: #dee1ea;
        }
      }

      .icon-wrapper:last-child {
        margin-left: 4px;
      }
    }

    .transition-area {
      position: absolute;
      bottom: calc(100% + 5px);
      left: 0;
      width: 100%;
      height: 20px;
    }

    .errors-count {
      width: 16px;
      height: 16px;
      background-size: 16px;
      top: -8px;
      right: -8px;
      position: absolute;
      margin: 0;
      padding: 0;
    }

    &:hover {
      box-shadow: 0 8px 16px 0 rgba(37, 43, 58, 0.16);

      .operation-area {
        display: flex;
      }
    }
  }
}

.operation-area-haveerrors {
  right: 12px;
}

@keyframes editorBreathe {
  0% {
    outline: 0 solid rgba(58, 194, 149, 0.2);
  }

  100% {
    outline: 20px solid rgba(58, 194, 149, 0);
  }
}

.x-node-selected {
  animation: editorBreathe 2s linear;
  animation-iteration-count: infinite;
}
</style>
