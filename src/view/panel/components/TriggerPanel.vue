<template>
  <!-- 配置主体 -->
  <trigger-tabs v-model:triggerData="triggerData" @cardClick="onCardclick">
  </trigger-tabs>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {
  ACTIVEMQ_NODE,
  ARTERMISMQ_NODE,
  IBMMQ_NODE,
  KAFKA_NODE,
  OPENAPI_NODE,
  QQEMAIL_NODE,
  QUARTZ_NODE,
} from "@/constant/ComponentType.ts";
import TriggerTabs from "./TriggerTabs.vue";

const emit = defineEmits(["componentClick"]);

const {t} = useI18n();

// 搜索栏
const searchValue = ref("");

// 所有的触发器器组件卡片数组
const allTrigger = [
  {
    key: "trigger",
    title: t("panel.component.collapse.trigger"),
    name: "trigger",
    components: [
      {
        type: OPENAPI_NODE,
        iconClassName: "icon-node-openapi",
        text: "Open API",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: ACTIVEMQ_NODE,
        iconClassName: "icon-activemq",
        text: "Active MQ",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: ARTERMISMQ_NODE,
        iconClassName: "icon-artermismq",
        text: "Artermis MQ",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: IBMMQ_NODE,
        iconClassName: "icon-ibmmq",
        text: "IBM MQ",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: KAFKA_NODE,
        iconClassName: "icon-kafka",
        text: "Kafka",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: QQEMAIL_NODE,
        iconClassName: "icon-qqemail",
        text: "QQ Email",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: QUARTZ_NODE,
        iconClassName: "icon-quartz",
        text: "Quartz",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
];

const triggerData = ref(allTrigger);

/**
 * 搜索栏的输入实时触发的回调函数
 * @param value 最新的搜索栏中的数据
 * @param input
 */
const onSearchInput = (value: any, input: string) => {
  const trimValue = value.trim();
  // 去除首尾的空格是空字符串，即没有搜索条件。赋值全量数据
  if (value.trim() === "") {
    triggerData.value = allTrigger;
    return;
  }
  // 将输入的value转换为小写
  const lowerCaseValue = trimValue.toLowerCase();

  // 过滤连接器数据. 先过滤第一级元素
  const filteredConnectorData = allTrigger.filter((item) => {
    // 筛选该类别下至少有一个组件的text包含转换后的value
    return item.components.some((component) => {
      // 将组件的text转换为小写并检查是否包含转换后的value
      return component.text.toLowerCase().includes(lowerCaseValue);
    });
  });

  // 保留符合条件的项，并重新映射以仅保留需要的结构
  const newConnectorData = filteredConnectorData.map((item) => ({
    key: item.key,
    title: item.title,
    name: item.name,
    components: item.components.filter((component) =>
        component.text.toLowerCase().includes(lowerCaseValue),
    ),
  }));
  triggerData.value = newConnectorData;
};

// 组件卡片的点击时间
const onCardclick = (type: string, text: string, iconClassName: string) => {
  emit("componentClick", type, text, iconClassName);
};

onMounted(() => {
  // triggerComponentCard.forEach(
  //   (value: ComponentCardItem, key: PanelType) => {},
  // );
});
</script>

<style scoped lang="scss"></style>
