<template>
  <!-- 配置主体 -->
  <processor-tabs
      v-model:processorData="processorData"
      @cardClick="onCardclick"
  >
  </processor-tabs>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {
  ACTIVEMQ_NODE,
  ARTERMISMQ_NODE,
  DB2_NODE,
  GAUSS100_NODE,
  GAUSS200_NODE,
  HTTPCLIENT_NODE,
  HTTPRESPONSE_NODE,
  IBMMQ_NODE,
  KAFKA_NODE,
  MULTICAST_NODE,
  MYSQL_NODE,
  ORACLE_NODE,
  POSTGRESQL_NODE,
  REDIS_NODE,
  SQLSERVER_NODE,
} from "@/constant/ComponentType.ts";
import ProcessorTabs from "@/view/panel/components/ProcessorTabs.vue";

const emit = defineEmits(["componentClick"]);

const {t} = useI18n();

// 搜索栏
const searchValue = ref("");

// 所有的处理器组件卡片数组
const allProcessor = [
  {
    key: "rpc",
    title: t("panel.component.collapse.rpc"),
    name: "RPC",
    components: [
      {
        type: HTTPCLIENT_NODE,
        iconClassName: "icon-httpclient",
        text: "HTTP Client",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: HTTPRESPONSE_NODE,
        iconClassName: "icon-httpresponse",
        text: "HTTP Response",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
  {
    key: "db",
    title: t("panel.component.collapse.database"),
    name: "db",
    components: [
      {
        type: DB2_NODE,
        iconClassName: "icon-db2",
        text: "db2",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: GAUSS100_NODE,
        iconClassName: "icon-gauss100",
        text: "Gauss 100",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: GAUSS200_NODE,
        iconClassName: "icon-gauss200",
        text: "Gauss 200",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: MYSQL_NODE,
        iconClassName: "icon-mysql",
        text: "MySQL",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: ORACLE_NODE,
        iconClassName: "icon-oracle",
        text: "Oracle",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: POSTGRESQL_NODE,
        iconClassName: "icon-postgresql",
        text: "Postgre SQL",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: REDIS_NODE,
        iconClassName: "icon-redis",
        text: "Redis",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: SQLSERVER_NODE,
        iconClassName: "icon-sqlserver",
        text: "SQL Server",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
  {
    key: "mq",
    title: t("panel.component.collapse.messagesystem"),
    name: "mq",
    components: [
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
    ],
  },
  {
    key: "logic_control",
    title: t("panel.component.collapse.logiccontrol"),
    name: "logic_control",
    components: [
      {
        type: MULTICAST_NODE,
        iconClassName: "icon-node-multicast",
        text: t("multicast.node.title"),
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "foreach",
        iconClassName: "icon-foreach",
        text: "循环处理",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "delay",
        iconClassName: "icon-delay-x",
        text: "延时",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "error-monitor",
        iconClassName: "icon-error-monitor",
        text: "异常监控",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "end",
        iconClassName: "icon-end",
        text: "终止",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "router",
        iconClassName: "icon-router",
        text: "分支判断",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
  {
    key: "data_process",
    title: t("panel.component.collapse.dataprocessing"),
    name: "data_process",
    components: [
      {
        type: "symmetric-encryption",
        iconClassName: "icon-symmetric-encryption",
        text: "对称加密",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "datamapper",
        iconClassName: "icon-datamapper",
        text: "数据映射",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "asymmetric-encryption",
        iconClassName: "icon-asymmetric-encryption",
        text: "非对称加密",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "edi",
        iconClassName: "icon-edi",
        text: "EDI处理",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "sorter",
        iconClassName: "icon-sorter",
        text: "排序",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "filter",
        iconClassName: "icon-filter-x",
        text: "数据筛选",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "datasplitter",
        iconClassName: "icon-datasplitter",
        text: "数据拆分",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "dataconvert",
        iconClassName: "icon-dataconvert",
        text: "数据转换",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "script",
        iconClassName: "icon-script",
        text: "脚本处理",
        iconWidth: "40px",
        iconHeight: "40px",
      },
      {
        type: "setvariable",
        iconClassName: "icon-setvariable",
        text: "变量赋值",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
  {
    key: "problem_analysis",
    title: t("panel.component.collapse.debug"),
    name: "problem_analysis",
    components: [
      {
        type: "log",
        iconClassName: "icon-log-x",
        text: "日志采集",
        iconWidth: "40px",
        iconHeight: "40px",
      },
    ],
  },
];

const processorData = ref(allProcessor);

/**
 * 搜索栏的输入实时触发的回调函数
 * @param value 最新的搜索栏中的数据
 * @param input
 */
const onSearchInput = (value: any, input: string) => {
  // 去除首尾的空格是空字符串，即没有搜索条件。赋值全量数据
  const trimValue = value.trim();
  if (value.trim() === "") {
    processorData.value = allProcessor;
    return;
  }
  // 将输入的value转换为小写
  const lowerCaseValue = trimValue.toLowerCase();

  // 过滤处理器数据. 先过滤第一级元素
  const filteredProcessorData = allProcessor.filter((item) => {
    // 筛选该类别下至少有一个组件的text包含转换后的value
    return item.components.some((component) => {
      // 将组件的text转换为小写并检查是否包含转换后的value
      return component.text.toLowerCase().includes(lowerCaseValue);
    });
  });

  // 保留符合条件的项，并重新映射以仅保留需要的结构
  const newProcessorData = filteredProcessorData.map((item) => ({
    key: item.key,
    title: item.title,
    name: item.name,
    components: item.components.filter((component) =>
        component.text.toLowerCase().includes(lowerCaseValue),
    ),
  }));
  processorData.value = newProcessorData;
};

// 组件卡片的点击事件
const onCardclick = (type: string, text: string, iconClassName: string) => {
  emit("componentClick", type, text, iconClassName);
};
</script>

<style scoped lang="scss"></style>
