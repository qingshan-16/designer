<template>
  <div class="x-graph">
    <!-- 画布容器 -->
    <div ref="graphContainer" class="x-graph-container"></div>
    <!-- 小地图 -->
    <div class="x-graph-minimap">
      <!-- <div class="minimap-container"></div> -->
      <div class="zoom-operation-bar">
        <n-tooltip :delay="500">
          <template #trigger>
            <div class="svg-wapper" @click="onMiniMapSwitch">
              <MiniMapSwitch></MiniMapSwitch>
            </div>
          </template>
          <span> {{ t("minimap.switch") }} </span>
        </n-tooltip>
        <div class="horizantal-rod"></div>
        <n-tooltip :delay="500">
          <template #trigger>
            <div class="svg-wapper" @click="onMiniMapCenter">
              <MiniMapCenter></MiniMapCenter>
            </div>
          </template>
          <span> {{ t("minimap.center") }} </span>
        </n-tooltip>
        <div class="horizantal-rod"></div>
        <n-tooltip :delay="500">
          <template #trigger>
            <div class="svg-wapper" @click="onMiniMapScale1">
              <MiniMapScale1></MiniMapScale1>
            </div>
          </template>
          <span> {{ t("minimap.scale1") }} </span>
        </n-tooltip>
        <div class="horizantal-rod"></div>
        <n-tooltip :delay="500">
          <template #trigger>
            <div class="svg-wapper" @click="onMiniMapFit">
              <MiniFit></MiniFit>
            </div>
          </template>
          <span> {{ t("minimap.fit") }} </span>
        </n-tooltip>
      </div>
      <div class="scale-pane">
        <div class="scale-icon" @click="onMiniMapZoomless">
          <MiniMapScaleLess></MiniMapScaleLess>
        </div>
        <span class="scale-number">{{ scale }}</span>
        <div class="scale-icon" @click="onMiniMapZoomAdd">
          <MiniMapScalePlus></MiniMapScalePlus>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onBeforeUpdate, onMounted, ref, useTemplateRef,} from "vue";
import {useI18n} from "vue-i18n";
import {BaseEdgeModel, BaseNodeModel} from "@logicflow/core";
import type {MiniMap} from "@logicflow/extension";
import MiniMapSwitch from "@/assets/image/svg/button/minimap-switch.svg";
import MiniMapCenter from "@/assets/image/svg/button/minimap-center.svg";
import MiniMapScale1 from "@/assets/image/svg/button/minimap-scale-1.svg";
import MiniMapScaleLess from "@/assets/image/svg/button/minimap-scale-less.svg";
import MiniMapScalePlus from "@/assets/image/svg/button/minimap-scale-plus.svg";
import MiniFit from "@/assets/image/svg/button/minimap-fit.svg";
import Designer from "@/core/Designer.ts";
import {layoutNow} from "@/core/layout";
import {XEvent, type XEventMap} from "@/core/event/XEventType.ts";
import {END_NODE_ID} from "@/constant";

const {t} = useI18n();

const designer = Designer.getInstance();

const miniMapSwitch = ref<boolean>(true);

const scale = ref<string>("100%");

const onScaleChange = () => {
  const scalex = designer.lf.graphModel.transformModel.SCALE_X;
  scale.value = `${Math.round(scalex ? scalex * 100 : 0)}%`;
};

const onMiniMapSwitch = (event: Event) => {
  const minimap: MiniMap = designer.lf.extension.miniMap as MiniMap;
  if (miniMapSwitch.value) {
    minimap.hide();
  }
  if (!miniMapSwitch.value) {
    minimap.show();
  }
  miniMapSwitch.value = !miniMapSwitch.value;
};

// 将模型设置为画布居中对齐
const onMiniMapCenter = (event: Event) => {
  designer.lf.graphModel.translateCenter();
};

// 缩放画布为100%
const onMiniMapScale1 = (event: Event) => {
  designer.lf.zoom(1);
  designer.lf.graphModel.translateCenter();
};

// 缩放画布至合适
const onMiniMapFit = (event: Event) => {
  designer.lf.fitView();
};

// 缩小画布
const onMiniMapZoomless = (event: Event) => {
  const point: [number, number] = [
    designer.lf.graphModel.width / 2,
    designer.lf.graphModel.height / 2,
  ];
  designer.lf.zoom(designer.lf.graphModel.transformModel.SCALE_X - 0.25, point);
};

// 放大画布
const onMiniMapZoomAdd = (event: Event) => {
  const point: [number, number] = [
    designer.lf.graphModel.width / 2,
    designer.lf.graphModel.height / 2,
  ];
  designer.lf.zoom(designer.lf.graphModel.transformModel.SCALE_X + 0.25, point);
};

// 声明容器(graphContainer)和LF(lf)对应的ref对象
const graphContainer = useTemplateRef<HTMLElement>("graphContainer");

const onPanelOpen = (data: XEventMap[XEvent.PanelOpen]) => {
  if (data.modelId === END_NODE_ID) {
    return
  }
  const nodeElements: HTMLCollectionOf<Element> = graphContainer.value?.getElementsByClassName('lf-custom-node-wrapper')!;
  if (nodeElements.length > 0) {
    Array.from(nodeElements).forEach((nodeElement: Element) => {
      if (nodeElement.id !== data.modelId) {
        nodeElement.style.filter = 'blur(3px) grayscale(100%)';
      }
    });
  }
  var edgeElements: HTMLCollectionOf<Element> = graphContainer.value?.getElementsByClassName('lf-edge')!;
  if (edgeElements.length > 0) {
    Array.from(edgeElements).forEach((edgeElement: Element) => {
      edgeElement.style.filter = 'blur(3px) grayscale(100%)';
    });
  }

}

const onPanelClose = (data: XEventMap[XEvent.PanelClose]) => {
  if (data.modelId === END_NODE_ID) {
    return
  }
  const nodeElements: HTMLCollectionOf<Element> = graphContainer.value?.getElementsByClassName('lf-custom-node-wrapper')!;
  if (nodeElements.length > 0) {
    Array.from(nodeElements).forEach((nodeElement: Element) => {
      nodeElement.style.removeProperty('filter');
    });
  }
  var edgeElements: HTMLCollectionOf<Element> = graphContainer.value?.getElementsByClassName('lf-edge')!;
  if (edgeElements.length > 0) {
    Array.from(edgeElements).forEach((edgeElement: Element) => {
      edgeElement.style.removeProperty('filter');
    });
  }
}


/**
 * LogicFlow相关的初始化方法
 */
const init = () => {
  if (!graphContainer.value) {
    throw new Error("graph container DOM is null or undefinde");
  }

  designer.init(graphContainer.value);

  // 初始化渲染画布
  // 渲染时（或者说时最后一次执行LogicFlow的render()方法时），要使用toRaw方式取到的LogicFlow的值去执行render()方法。
  // 如此才能避免使用"bezier"曲线报错的问题。
  // 为什么会产生这样的问题，目前（2023-02-13）我不清楚具体原因。
  // const rawLf = toRaw(designer.lf.value);
  // rawLf.render(InitGraphData);
  designer.lf.renderRawData(designer.graphData);
  // 打开缩略图
  designer.lf.extension.miniMap.show();
  // 将模型设置为画布居中对齐
  designer.lf.graphModel.translateCenter();

  // 初始化更新id，保证当前流程图中的所有节点和连线的id唯一
  designer.lf.graphModel.nodes.forEach((node: BaseNodeModel) => {
    designer.idGenerator.addId(node.id);
  });
  designer.lf.graphModel.edges.forEach((node: BaseEdgeModel) => {
    designer.idGenerator.addId(node.id);
  });

  miniMapSwitch.value = true;
};

onMounted(() => {
  init();
  // 监听缩放事件
  designer.lf.graphModel.eventCenter.on("graph:transform", onScaleChange);

  layoutNow();
  // 添加面板打开的回调事件
  designer.addEventListener(XEvent.PanelOpen, onPanelOpen);
  // 添加面板打开的回调事件
  designer.addEventListener(XEvent.PanelClose, onPanelClose);
});
onBeforeUpdate(() => {
});
onBeforeUnmount(() => {
  designer.destroy();
  designer.removeEventListener(XEvent.PanelOpen, onPanelOpen);
  designer.removeEventListener(XEvent.PanelClose, onPanelClose);

});
</script>

<style scoped lang="scss">
.x-graph {
  position: relative;
  width: calc(100% - 10px);
  height: calc(100% - 10px);

  background-image: url("../../assets/image/png/logicflow-background-unbounded-dark.png");
  background-repeat: no-repeat; /* 不重复 */
  background-size: cover; /* 覆盖整个容器 */
  background-position: center; /* 图片居中 */
  border: 3px solid #fff;
  margin: 3px;
  border-radius: 16px;

  .x-graph-container {
    width: 100%;
    height: 100%;
  }

  .x-graph-minimap {
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    position: absolute;
    display: flex;
    flex-wrap: nowrap;
    width: 280px;
    height: 32px;
    bottom: 13px;
    left: 16px;

    .zoom-operation-bar {
      width: 140px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 4px 0 rgba(37, 43, 58, 0.08);
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .svg-wapper {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .horizantal-rod {
        height: 16px;
        width: 1px;
        background-color: #252b3a;
      }
    }

    .scale-pane {
      width: 120px;
      margin-left: 8px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 4px 0 rgba(37, 43, 58, 0.08);
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .scale-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .scale-number {
        line-height: 16px;
        flex: 1;
        display: inline-block;
        padding: 0 8px;
        text-align: center;
        color: #252b3a;
      }
    }
  }
}

div :deep(.lf-mini-map) {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px 0 rgba(37, 43, 58, 0.1);
  margin-bottom: 6px;
  border: none;
  padding: 5px;

  .lf-minimap-viewport {
    border-radius: 8px;
    transition: all var(--transition-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;;
  }
}

div :deep(.lf-minimap-viewport) {
  background-color: rgba(107, 226, 116, 0.2);
}
</style>

<style lang="scss">
.blur-effect {
  filter: blur(1px);
}
</style>
