<template xmlns="">
  <n-modal
      v-model:show="deleteModelValue"
      preset="dialog"
      :title="t('branchname.node.delete.title')"
      :content="deleteMessage"
      :positive-text="t('branchname.node.delete.button.confirm')"
      :negative-text="t('branchname.node.delete.button.cancel')"
      @positive-click="deleteConfirm"
      @negative-click="deleteCancel"
  >
  </n-modal>

  <div class="component-node-item">
    <div class="component-node-item-container">
      <div class="branchname-weight">
        <n-tag type="success">
          {{ weightText }}
        </n-tag>
      </div>
      <!-- 分支名称显示 -->
      <div v-if="branchNameDisplay === 'display'" class="branchname-text">
        <n-popover :delay="500">
          <template #trigger>
            <div class="branchname">
              {{ branchNameText }}
            </div>
          </template>
          <span>{{ branchNameText }}</span>
        </n-popover>
        <div class="branchname-text-edit" @click="onBranchNameEdit">
          <IconEdit></IconEdit>
        </div>
      </div>
      <!-- 分支名称编辑 -->
      <div v-if="branchNameDisplay === 'edit'" class="branchname-edit">
        <n-input
            ref="branchNameInputRef"
            v-model:value="branchNameEdit"
            placeholder="请输入分支名称"
            :autofocus="true"
            :clearable="true"
            maxlength="30"
            @blur="onBranchNameEditBlur"
        >
        </n-input>
        <div class="branchname-edit-operation">
          <div class="operation-icon icon-yes" @mousedown="onSaveEdit"></div>
          <div class="operation-icon icon-no" @mousedown="onCancelEdit"></div>
        </div>
      </div>
      <!-- 输出锚点 -->
      <span :class="outgoingCircleClass">
        <span>
          <span> </span>
        </span>
      </span>
      <!-- 操作栏 -->
      <div class="operation-area">
        <div class="icon-wrapper" @click.stop="onCopy">
          <icon-copy></icon-copy>
        </div>
        <div class="icon-wrapper" @click.stop="onDelete">
          <icon-delete></icon-delete>
        </div>
      </div>
      <div class="transition-area"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef,} from "vue";
import {useI18n} from "vue-i18n";
import {BaseNodeModel, GraphModel, LogicFlow} from "@logicflow/core";
import IconCopy from "@/assets/image/svg/icon-copy.svg";
import IconDelete from "@/assets/image/svg/icon-delete.svg";
import IconEdit from "@/assets/image/svg/icon-edit.svg";
import {BASE_EDGE} from "@/constant/ComponentType.ts";
import {layout} from "@/core/layout";
import Designer from "@/core/Designer.ts";
import {NModal} from "naive-ui";
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

const designer = Designer.getInstance();

const outgoingCircleClass = ref<string>(
    designer.layoutType === Layout.HORIZONTAL
        ? "outgoing-circle-right"
        : "outgoing-circle-bottom",
);
const onLayoutChange = (data: XEventMap[XEvent.LayoutChang]) => {
  switch (data.layoutType) {
    case Layout.HORIZONTAL: {
      outgoingCircleClass.value = "outgoing-circle-right";
      break;
    }
    case Layout.VERTICAL: {
      outgoingCircleClass.value = "outgoing-circle-bottom";
      break;
    }
    default: {
      outgoingCircleClass.value = "outgoing-circle-right";
      break;
    }
  }
};

const {t} = useI18n();

const refModel = ref(props.model);

const weightText = computed(() => {
  return refModel.value.properties.weight;
});

const branchNameText = computed(() => {
  return refModel.value.properties.displayName;
});

const branchNameEdit = ref<string>("");
// "edit"或"display"
const branchNameDisplay = ref<string>("display");
const branchNameInput = useTemplateRef<HTMLElement>("branchNameInputRef");
// headername的编辑按钮
const onBranchNameEdit = () => {
  branchNameEdit.value = branchNameText.value;
  branchNameDisplay.value = "edit";
  // 等待DOM更新后。不然branchNameInputRef.value为空。
  nextTick().then(() => {
    branchNameInput.value?.focus();
  });
};
// 保存编辑结果
const onSaveEdit = () => {
  refModel.value.properties.displayName = branchNameEdit.value;
  onBranchNameEditBlur();
};
// 取消编辑结果
const onCancelEdit = () => {
  branchNameInput.value?.blur();
};
// headername输入框失去焦点时的回调
const onBranchNameEditBlur = () => {
  branchNameDisplay.value = "display";
};

// 删除提示框的开关
const deleteModelValue = ref(false);

const deleteMessage = ref(t("branchname.node.delete.message"));

// 删除当前分支的标志位。当值为fale时，删除整个并行处理
const deleteBranchMark = ref(true);

const deleteConfirm = () => {
  // 执行删除处理程序
  handleDelete(deleteBranchMark.value);
};

const deleteCancel = () => {
};

const onCopy = () => {
};

const onDelete = () => {
  const incomingNode: BaseNodeModel[] = props.graphModel.getNodeIncomingNode(
      props.model.id,
  );
  // 并行处理节点
  const multicatNode = incomingNode[0];
  if (designer.lf.graphModel.getNodeOutgoingNode(multicatNode.id).length <= 2) {
    // 删除整个并行处理
    deleteBranchMark.value = false;
    deleteMessage.value = t("branchname.node.delete.all.message");
  }
  deleteModelValue.value = !deleteModelValue.value;
};

/**
 * 删除处理程序
 * @param deleteBranch 删除分支标志位。为true时删除当前分支，为false时删除整个并行处理
 */
const handleDelete = async (deleteBranch = true) => {
  const incomingNode: BaseNodeModel[] = props.graphModel.getNodeIncomingNode(
      props.model.id,
  );
  // 并行处理节点
  const multicatNode = incomingNode[0];

  const multicasIncomingNode: BaseNodeModel[] =
      props.graphModel.getNodeIncomingNode(multicatNode.id);
  // 并行处理节点的上一个节点
  const multicastPrevious = multicasIncomingNode[0];

  const jointOutgoingNode: BaseNodeModel[] =
      props.graphModel.getNodeOutgoingNode(multicatNode.properties.jointNodeId);
  // 该并行处理的聚合节点的下一个节点
  const jointNext = jointOutgoingNode[0];

  const branchAllNodes = new Set<string>();

  if (deleteBranch) {
    // 仅删除当前分支
    getBranchAllNodes(
        props.model.id,
        multicatNode.properties.jointNodeId,
        branchAllNodes,
    );
    branchAllNodes.add(props.model.id);
    branchAllNodes.forEach((nodeId) => {
      // 删除进、出的线和当前节点
      props.graphModel.deleteNode(nodeId);
    });

    // 获取当前图的数据
    const graphData: LogicFlow.GraphConfigData =
        designer.lf.getGraphData() as LogicFlow.GraphConfigData;
    
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
  } else {
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
  }
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
  // 只有当初始无值的时候，设置节点的默认显示名称
  if (refModel.value.properties.displayName === undefined) {
    refModel.value.setProperty(
        "displayName",
        `${t("branchname.node.title")}_${props.model.id}`,
    ); // ${t('branchname.node.title')}_
  }
  designer.addEventListener(XEvent.LayoutChang, onLayoutChange);
});
onUnmounted(() => {
  designer.removeEventListener(XEvent.LayoutChang, onLayoutChange);
});
</script>

<style scoped lang="scss">
.component-node-item {
  width: 160px;
  height: 36px;
  box-sizing: content-box;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 6px 0 rgba(37, 43, 58, 0.1);
  cursor: pointer;
  display: flex;

  .component-node-item-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    display: flex;
    z-index: 999;

    .branchname-weight {
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .branchname-text {
      width: 108px;
      height: 100%;
      display: flex;
      padding: 0 10px;
      margin: 0;
      position: relative;
      align-items: center;
      justify-content: center;
      border-radius: 8px;

      .branchname {
        width: calc(100% - 18px);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 600;
        color: #000000;
        padding: 0;
        font-size: 13px;
        line-height: 16px;
        text-align: center;

      }

      .branchname-text-edit {
        justify-content: center;
        align-items: center;
        display: flex;
        width: 18px;
        height: 18px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        cursor: pointer;
      }
    }

    .branchname-edit {
      width: calc(100% - 32px);
      line-height: 36px;

      .branchname-edit-operation {
        display: flex;
        justify-content: center;

        .operation-icon {
          cursor: pointer;
          margin-right: 8px;
          padding: 2px;
          width: 18px;
          height: 18px;
          background-size: 100% 100%;
          background-repeat: no-repeat;
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

    &:hover {
      box-shadow: 0 8px 16px 0 rgba(37, 43, 58, 0.16);

      .operation-area {
        display: flex;
      }
    }
  }
}
</style>
