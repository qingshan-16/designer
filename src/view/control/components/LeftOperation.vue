<template>
  <div class="left-operation">
    <div class="button-container">
      <n-dropdown
          trigger="hover"
          placement="bottom-start"
          :options="languageList"
          @select="handleSelect"
      >
        <n-button circle size="large" style="background-color: #fff" :focusable="false">
          <template #icon>
            <n-icon>
              <IconLanguage></IconLanguage>
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </div>
    <div class="button-container">
      <n-button circle size="large" style="background-color: #fff" :focusable="false" @click="onTheme">
        <template #icon>
          <n-icon>
            <div v-if="!isDark">
              <IconSwitchSun></IconSwitchSun>
            </div>
            <div v-if="isDark">
              <IconSwitchMoon></IconSwitchMoon>
            </div>
          </n-icon>
        </template>
      </n-button>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button
              circle
              size="large" style="background-color: #fff"
              :focusable="false"
              @click="onAnimationsChange"
          >
            <template #icon>
              <n-icon>
                <div>
                  <IconButtonAnimation></IconButtonAnimation>
                </div>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span v-if="isAnimationsEnabled">
          {{ t("control.animation.disable") }}
        </span>
        <span v-if="!isAnimationsEnabled">
          {{ t("control.animation.enable") }}
        </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false" @click="onEditModel">
            <template #icon>
              <n-icon>
                <IconButtonEdit></IconButtonEdit>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.edit") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false" @click="onBeautify">
            <template #icon>
              <n-icon>
                <IconButtonBeautify/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.beautify") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button
              circle
              size="large" style="background-color: #fff"
              :focusable="false"
              @click="onSwitchClick"
          >
            <template #icon>
              <n-icon>
                <IconButtonLayout/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.switchlayout") }} </span>
      </n-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, inject, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {LogicFlow} from "@logicflow/core";
import {useMessage} from "naive-ui";
import useAppConfigStore from "@/stores/AppConfig.ts";
import {layout} from "@/core/layout";
import Designer from "@/core/Designer.ts";
import IconLanguage from "@/assets/image/svg/button/icon-language.svg";
import IconButtonAnimation from "@/assets/image/svg/button/icon-button-animation.svg";
import IconSwitchSun from "@/assets/image/svg/button/icon-switch-sun.svg";
import IconSwitchMoon from "@/assets/image/svg/button/icon-switch-moon.svg";
import IconButtonEdit from "@/assets/image/svg/button/icon-button-edit.svg";
import IconButtonBeautify from "@/assets/image/svg/button/icon-button-beautify.svg";
import IconButtonLayout from "@/assets/image/svg/button/icon-button-layout.svg";
import {Edit, LanguageCode, Layout, type LayoutType} from "@/type";
import {XEvent} from "@/core/event/XEventType.ts";
import {BASE_EDGE, BEZIER_EDGE} from "@/constant/ComponentType.ts";

const designer = Designer.getInstance();

const i18 = useI18n();

const {t} = useI18n();

const appConfigStore = useAppConfigStore();

const message = useMessage();


const languageList = [
  {
    label: "中文",
    key: "zh-CN",
  },
  {
    label: "繁体中文",
    key: "zh-TW",
  },
  {
    label: "English",
    key: "en",
  },
  {
    label: "بالعربية",
    key: "ar",
  },
  {
    label: "日本語",
    key: "ja",
  },
];

const handleSelect = (key: keyof typeof LanguageCode) => {
  appConfigStore.changeLanguage(key);
};

watch(() => appConfigStore.language, (newValue) => {
  i18.locale.value = newValue;
})

const isAnimationsEnabled = designer.animationsEnabled;

const onAnimationsChange = () => {
  isAnimationsEnabled.value = !isAnimationsEnabled.value;
  message.success(
      isAnimationsEnabled.value
          ? t("control.animation.enable")
          : t("control.animation.disable"))
};

interface Reload {
  onReloadGraph: () => void;
}

const {onReloadGraph} =
    inject<Reload>("onReloadGraph")!;

const onEditModel = () => {
  // 获取当前图的数据
  designer.graphData = designer.lf.getGraphData() as LogicFlow.GraphConfigData;

  // 切换编辑模式，保存当前数据
  switch (designer.editType) {
    case Edit.FREE:
      designer.editType = Edit.RULE;
      break;
    case Edit.RULE:
      designer.editType = Edit.FREE;
      break;
    default:
      break;
  }

  // 重新加载画布
  onReloadGraph();
};

const isDark = computed(() => {
  return appConfigStore.theme === "dark";
})
const onTheme = () => {
  appConfigStore.changeTheme(appConfigStore.theme === "dark" ? "light" : "dark");
};

const layoutType = ref<LayoutType>(Layout.HORIZONTAL);

const onBeautify = () => {
  const graphData: LogicFlow.GraphConfigData =
      designer.lf.getGraphData() as LogicFlow.GraphConfigData;
  // 美化布局（移动节点位置）
  layout
      .layoutGraph({
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
      })
      .then((rs) => {
        rs.nodes.forEach((node: any) => {
          Designer.getInstance().lf.graphModel.moveNode2Coordinate(
              node.id,
              node.data.x,
              node.data.y,
              false,
          );
        });
        designer.lf.graphModel.translateCenter();

        message.success("布局美化");
      });
}

const onSwitchClick = () => {
  const edgeType = designer.editType == Edit.RULE
      ? BASE_EDGE
      : BEZIER_EDGE;
  const currentLayoutType = designer.layoutType;
  layoutType.value =
      layoutType.value === Layout.HORIZONTAL
          ? Layout.VERTICAL
          : Layout.HORIZONTAL;
  designer.layoutType = layoutType.value;
  designer.emit(XEvent.LayoutChang, {
    layoutType: layoutType.value,
  });

  const graphData: LogicFlow.GraphConfigData =
      designer.lf.getGraphData() as LogicFlow.GraphConfigData;
  // 美化布局（移动节点位置）
  layout
      .layoutGraph({
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
      })
      .then((rs) => {
        rs.nodes.forEach((node: any) => {
          Designer.getInstance().lf.graphModel.moveNode2Coordinate(
              node.id,
              node.data.x,
              node.data.y,
              false,
          );
        });
        if (!graphData.edges) graphData.edges = [];
        // 节点布局移动到合适位置后。更新连线，主要是连线的开始和结束锚点重新匹配
        graphData.edges.forEach((edge: LogicFlow.EdgeConfig) => {
          designer.lf.graphModel.deleteEdgeById(edge.id as string);
          // setTimeout(() => {
          const {id, sourceNodeId, targetNodeId} = edge;
          designer.lf.graphModel.addEdge({
            id,
            type: edgeType,
            sourceNodeId,
            targetNodeId,
          });
          // })
        });
        designer.lf.graphModel.translateCenter();

        message.success(
            currentLayoutType === Layout.HORIZONTAL ? "纵向布局" : "横向布局",
        );
      });
};

onMounted(() => {

});
</script>

<style scoped lang="scss">
.left-operation {
  margin-right: 1%;
  align-items: center;
  display: flex;

  .button-container {
    padding: 16px;
  }
}
</style>
