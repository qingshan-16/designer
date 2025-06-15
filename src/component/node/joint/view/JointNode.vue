<template>
  <div class="component-node-item">
    <div class="component-node-item-container" :class="selectClass">
      <!-- 图片 -->
      <XSimpleIcon icon-class-name="icon-node-joint"></XSimpleIcon>
      <!-- 描述信息 -->
      <div :class="itemViewClass">
        <div class="item-name">
          <span class="canvas-item-title">
            {{ t("joint.node.title") }}
          </span>
        </div>
      </div>
      <!-- 输出锚点 -->
      <span :class="outgoingCircleClass">
        <span>
          <span> </span>
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {BaseNodeModel, GraphModel} from "@logicflow/core";
import XSimpleIcon from "@/component/node/common/XSimpleIcon.vue";
import Designer from "@/core/Designer.ts";
import {XEvent, type XEventMap} from "@/core/event/XEventType.ts";
import {Layout} from "@/type";

const {t} = useI18n();

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

onMounted(() => {
  props.model.setProperty("displayName", "joint.node.title");
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

    &:hover {
      box-shadow: 0 8px 16px 0 rgba(37, 43, 58, 0.16);
    }
  }
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
