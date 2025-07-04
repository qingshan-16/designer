<template>
  <div class="component-node-item" :class="selectClass">
    <div class="component-node-item-container">
      <!-- 图片 -->
      <XIcon icon-class-name="icon-node-openapi"></XIcon>
      <!-- 描述信息 -->
      <div class="item-info">
        <n-popover :delay="500">
          <template #trigger>
            <div class="item-title">
              {{ title }}
            </div>
          </template>
          <span>{{ title }}</span>
        </n-popover>
        <div class="item-subtitle">
          {{ t("openapi.node.subtitle") }}
        </div>
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
        <div class="icon-wrapper">
          <icon-delete></icon-delete>
        </div>
      </div>
      <div class="transition-area"></div>
      <!-- 配置校验提示 -->
      <div class="errors-count icon-errors"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {BaseNodeModel, GraphModel} from "@logicflow/core";
import IconCopy from "@/assets/image/svg/icon-copy.svg";
import IconDelete from "@/assets/image/svg/icon-delete.svg";
import XIcon from "@/component/node/common/XIcon.vue";
import Designer from "@/core/Designer.ts";
import {START_NODE_ID} from "@/constant";
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
const itemViewClass = ref<string>("item-view-bottom");

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

const refModel = ref<BaseNodeModel>(props.model);

const haveErrors = computed(() => {
  return props.model.properties.validator ? "" : "operation-area-haveerrors";
});

const title = computed(() => {
  // 这里先从国际化里拿。就算没有好像也是会返回原值？？？
  const displayName = t(refModel.value.properties.displayName);
  return displayName ? displayName : refModel.value.properties.displayName;
});

onMounted(() => {
  // 只有当初始无值的时候，设置节点的默认显示名称
  if (refModel.value.properties.displayName === undefined) {
    refModel.value.setProperty("displayName", "openapi.node.title");
  }
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
  width: 200px;
  height: 64px;
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

    .item-info {
      width: calc(100% - 64px);
      padding: 12px 8px;
      border-radius: 0 7px 7px 0;
      font-size: 14px;
      text-align: center;
      display: flex;
      justify-content: center;
      flex-direction: column;

      .item-title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        color: #252b3a;
      }

      .item-title:hover {
        color: #6bba86;
      }

      .item-subtitle {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
        line-height: 18px;
        border-radius: 2px;
        font-size: 12px;
        color: #8a8e99;
      }
    }

    .outgoing-circle-right {
      width: 9px;
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
      height: 9px;
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
        bottom: 2px;
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
