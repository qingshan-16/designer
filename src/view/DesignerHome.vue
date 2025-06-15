<template>
  <div id="x-designer-home" :style="animationVars">
    <Control></Control>
    <!-- LogicFlow画布容器 -->
    <Graph :key="reload"></Graph>
    <!-- 配置面板组件 -->
    <!--    TODO: 因为panel中有注册lf的事件中心，所以刷新画布时需要一起刷新panel，因为画布刷新后是一个新的lf对象，之前注册的事件会失效  -->
    <Panel :key="reload"></Panel>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, provide, ref} from "vue";
import Panel from "@/view/panel/Panel.vue";
import Control from "@/view/control/Control.vue";
import Graph from "@/view/graph/Graph.vue";
import Designer from "@/core/Designer";

const designer = Designer.getInstance();

// 动画控制状态
const isAnimationsEnabled = designer.animationsEnabled;

// CSS 变量计算
const animationVars = computed(() => ({
  "--animation-duration": isAnimationsEnabled.value ? "0.4s" : "0s",
  "--transition-duration": isAnimationsEnabled.value ? "0.4s" : "0s",
}));

const reload = ref(0);

const onReloadGraph = () => {
  reload.value++;
};

// 暴露给子组件的状态和方法
provide("onReloadGraph", {
  onReloadGraph
});

onMounted(() => {
});
onBeforeUnmount(() => {
});
</script>

<style scoped lang="scss">
#x-designer-home {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>

<style lang="scss">
// 节点新增时慢慢浮现
.lf-graph > svg > g .lf-base > .lf-node > .lf-node-content > g > foreignObject > div.lf-custom-node-wrapper {
  animation: emerge var(--animation-duration) 1 ease-in-out;
}

/* 画布（拖拽）移动时的过渡效果 */
.lf-graph > svg > g {
  will-change: transform;
  transition: transform var(--transition-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
}

/* 节点移动时的过渡 */
.lf-base > .lf-node > .lf-node-content > g > foreignObject {
  transition: x var(--transition-duration) ease-in-out 0s, y var(--transition-duration) ease-in-out 0s;
}

/* 线移动时的过渡 */
.lf-base > g > .lf-edge > g > path {
  transition: all var(--transition-duration) ease-in-out 0s;
}

@keyframes emerge {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
