<template>
  <n-config-provider
      style="width: 100%; height: 100%"
      :locale="locale"
      :date-locale="dateLocale"
      :theme="theme"
  >
    <n-message-provider>
      <n-dialog-provider>
        <div class="x-designer" :class="darkThemeClass">
          <designer-home></designer-home>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {arDZ, dateArDZ, dateEnUS, dateJaJP, dateZhCN, dateZhTW, enUS, jaJP, zhCN, zhTW} from "naive-ui";
import type {BuiltInGlobalTheme} from "naive-ui/es/themes/interface";
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type {NLocale} from "naive-ui/es/locales/common/enUS";
import type {NDateLocale} from "naive-ui/es/locales/date/enUS";
import useAppConfigStore from "@/stores/AppConfig.ts";
import DesignerHome from "@/view/DesignerHome.vue";
import type {MicroAppData} from "@/type";

const {t} = useI18n();

const darkThemeClass = ref("");

const appConfigStore = useAppConfigStore();

const locale = computed((): NLocale => {
  switch (appConfigStore.language) {
    case "zh-CN":
      return zhCN;
    case "zh-TW":
      return zhTW;
    case "ar":
      return arDZ;
    case "en":
      return enUS;
    case "ja":
      return jaJP;
    default:
      return zhCN;
  }
});

const dateLocale = computed((): NDateLocale => {
  switch (appConfigStore.language) {
    case "zh-CN":
      return dateZhCN;
    case "zh-TW":
      return dateZhTW;
    case "ar":
      return dateArDZ;
    case "en":
      return dateEnUS;
    case "ja":
      return dateJaJP;
    default:
      return dateZhCN;
  }
});

const theme = computed((): BuiltInGlobalTheme | undefined => {
  switch (appConfigStore.theme) {
    case "light":
      darkThemeClass.value = "";
      return undefined;
    case "dark":
      darkThemeClass.value = "dark-theme";
      return undefined;
    default:
      return undefined;
  }
});

// 修改标题
watch(() => appConfigStore.language, (newValue, oldValue) => {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    console.log("micro app 环境中，不重置document.title.content")
  } else {
    document.title = t('document.title.content');
  }
})

onMounted(() => {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    console.log(
        `================================\n` +
        `__MICRO_APP_ENVIRONMENT__       : ${window.__MICRO_APP_ENVIRONMENT__}\n` +
        `__MICRO_APP_NAME__              : ${window.__MICRO_APP_NAME__}\n` +
        `__MICRO_APP_PUBLIC_PATH__       : ${window.__MICRO_APP_PUBLIC_PATH__}\n` +
        `__MICRO_APP_BASE_ROUTE__        : ${window.__MICRO_APP_BASE_ROUTE__}\n` +
        `__MICRO_APP_BASE_APPLICATION__  : ${window.__MICRO_APP_BASE_APPLICATION__}\n` +
        `================================`
    );
    // 如果当前为微前端环境，则监听来自基座应用的数据变化
    // micro app 主应用的通信
    window.microApp.addDataListener((data: MicroAppData) => {
      console.log("来自主应用的数据", data);
      if (data.language && data.language !== appConfigStore.language) {
        appConfigStore.changeLanguage(data.language);
      }
      if (data.theme && data.theme !== appConfigStore.theme) {
        appConfigStore.changeTheme(data.theme);
      }
      return true;
    });
  } else {
    document.title = t('document.title.content');
  }
});
</script>

<style scoped>
.x-designer {
  width: 100%;
  height: 100%;
}

.dark-theme {
  filter: invert(0.9) hue-rotate(180deg);
}
</style>
