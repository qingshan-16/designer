<template>
  <n-drawer
      class="x-designer-panel"
      id="x-designer-panel"
      placement="right"
      show-mask="transparent"
      :resizable="true"
      :auto-focus="false"
      :min-width="468"
      :max-width="1600"
      default-width="468"
      :show="panelShow"
      @update-show="onUpdateShow"
      @after-leave="onCloseLeave"
      to="#x-designer-home"
  >
    <n-drawer-content
        header-class="x-panel-header"
        body-class="x-panel-body"
        footer-class="x-panel-footer"
        :native-scrollbar="false"
    >
      <!-- 面板的头部区域 -->
      <template #header>
        <panel-header
            v-model:current-model="currentModel"
            v-model:tabs-value="tabsValue"
            @before-leave="onBeforeLeave"
            @close="onCloseButton"
        >
        </panel-header>
      </template>

      <!-- 面板的中心区域 -->
      <template #default>
        <div class="x-designer-panel-content">
          <component ref="panelComponent" :is="currentPanelView" @componentClick="onCardClick">
          </component>
        </div>
      </template>
      <!-- 面板的底部区域 -->
      <template #footer>
        <div class="x-designer-panel-footer"></div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, provide,} from "vue";
import Designer from "@/core/Designer.ts";
import PanelHeader from "./components/PanelHeader.vue";
import {XEvent} from "@/core/event/XEventType.ts";
import {usePanelLogic} from "@/view/panel/usePanelLogic.ts";

const designer = Designer.getInstance();

const {
  // 面板状态
  panelShow,
  onUpdateShow,
  onCloseButton,
  onCloseLeave,
  // 选择菜单状态
  currentModel,
  tabsValue,
  onBeforeLeave,
  // 面板组件
  currentPanelView,
  onCardClick,
  // 节点的激活回调事件
  onNodeActive,
} = usePanelLogic();

// 向子组件提供当前选中的节点
provide("currentNode",
    currentModel,
);
onMounted(() => {
  // 添加节点激活的回调事件
  designer.addEventListener(XEvent.NodeActive, onNodeActive);
});

onUnmounted(() => {
  // 移除节点激活的回调事件
  designer.removeEventListener(XEvent.NodeActive, onNodeActive);
});
</script>

<style lang="scss">
#x-designer-panel {
  top: 25px;
  right: 30px;
  bottom: 25px;
  border-radius: 16px;

  .x-panel-header {
    padding: 0;
  }

  .x-panel-body {
    padding: 0;
    height: calc(100% - 210px);
  }

  .x-panel-footer {
    padding: 0;
    width: 100%;
    height: 80px;

    .x-designer-panel-footer {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
