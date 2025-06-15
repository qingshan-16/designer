<template>
  <!-- 配置主体 -->
  <data-form></data-form>
</template>

<script setup lang="ts">
import {useDialog} from "naive-ui";
import DataForm from "./DataForm.vue";

const dialog = useDialog()

const emit = defineEmits(["panelCloseBefore"]);


/**
 * panel关闭前的询问。返回 true 表示可以关闭，false 表示不可以关闭
 */
const askCloseBefore = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // // 判断数据是否发生变化
    // if (!hasDataChanged()) {
    //   // 数据无变化，直接返回 true
    //   console.log('数据无变化，允许关闭');
    //   resolve(true);
    //   return;
    // }
    dialog.success({
      title: '关闭',
      content: '你确定？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        resolve(true); // 用户点击“确定”，返回 true
      },
      onNegativeClick: () => {
        resolve(false); // 用户点击“不确定”，返回 false
      },
    });
  });
};

// 暴露给父组件的方法
defineExpose({
  askCloseBefore,
})
</script>

<style scoped lang="scss">
.designer-panel-search {
  padding-top: 16px;
  padding-bottom: 12px;
}
</style>
