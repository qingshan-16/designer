<template>
  <div class="right-operation">

    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false" @click="onDetail">
            <template #icon>
              <n-icon>
                <IconButtonDetail></IconButtonDetail>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.detail") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false">
            <template #icon>
              <n-icon>
                <IconButtonVariable/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.variable") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false">
            <template #icon>
              <n-icon>
                <IconButtonValidation/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.validation") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false">
            <template #icon>
              <n-icon>
                <IconButtonDegug/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.debug") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button
              circle
              size="large" style="background-color: #fff"
              :focusable="false"
              @click="onFlowDataSave"
          >
            <template #icon>
              <n-icon>
                <IconButtonSave/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.save") }} </span>
      </n-tooltip>
    </div>
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false">
            <template #icon>
              <n-icon>
                <IconButtonRun/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.start") }} </span>
      </n-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useMessage} from "naive-ui";
import Designer from "@/core/Designer.ts";
import useFlowInfoStore from "@/stores/FlowInfo.ts";
import IconButtonDetail from "@/assets/image/svg/button/icon-button-detail.svg";
import IconButtonVariable from "@/assets/image/svg/button/icon-button-variable.svg";
import IconButtonValidation from "@/assets/image/svg/button/icon-button-validation.svg";
import IconButtonDegug from "@/assets/image/svg/button/icon-button-degug.svg";
import IconButtonRun from "@/assets/image/svg/button/icon-button-run.svg";
import IconButtonSave from "@/assets/image/svg/button/icon-button-save.svg";

const {t} = useI18n();

const message = useMessage();

const designer = Designer.getInstance();

const flowInfoStore = useFlowInfoStore();


const onDetail = () => {
};

const onFlowDataSave = () => {
  const flowData = JSON.stringify(designer.lf.getGraphData());
  flowInfoStore.changeFlowData(flowData);
  // micron app 环境下向主应用发送通知
  if (window.microApp) {
    window.microApp.dispatch({
      from: "designer",
      flowData: flowInfoStore.flowData,
      operation: "save",
    });
  }
  message.success("保存");
};
</script>

<style scoped lang="scss">
.right-operation {
  margin-right: 1%;
  align-items: center;
  display: flex;

  .button-container {
    padding: 16px;
  }
}
</style>
