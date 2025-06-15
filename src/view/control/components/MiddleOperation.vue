<template>
  <div class="middle-operation">
    <div class="button-container">
      <n-tooltip :delay="500">
        <template #trigger>
          <n-button circle size="large" style="background-color: #fff" :focusable="false" @click="onCodeClick">
            <template #icon>
              <n-icon>
                <IconButtonCode/>
              </n-icon>
            </template>
          </n-button>
        </template>
        <span> {{ t("control.code") }} </span>
      </n-tooltip>
    </div>

  </div>
  <code-panel
      v-model:codeShow="codeShow"
      v-model:codeText="codeText"
  ></code-panel>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import Designer from "@/core/Designer.ts";
import {useMessage} from "naive-ui";
import CodePanel from "@/view/control/components/CodePanel.vue";
import IconButtonCode from "@/assets/image/svg/button/icon-button-code.svg";

const {t} = useI18n();

const message = useMessage();

const designer = Designer.getInstance();


const codeText = ref<string>("");

const codeShow = ref(false);

const onCodeClick = () => {
  if (codeShow.value === true) {
    message.error("请先保存");
    return;
  }
  codeText.value = JSON.stringify(designer.lf.getGraphData(), null, 2);
  codeShow.value = !codeShow.value;
};

const onCtrlClick = () => {
};
</script>

<style scoped lang="scss">
.middle-operation {
  margin-right: 1%;
  align-items: center;
  display: flex;

  .button-container {
    padding: 16px;
  }
}
</style>
