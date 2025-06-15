<template>
  <n-tabs class="designer-component-tabs">
    <!-- 处理器组件 -->
    <n-tab-pane
        :name="t('panel.component.title.processor')"
        class="designer-component-tab"
    >
      <n-collapse
          arrow-placement="right"
          class="designer-collapse-wrap processor-wrap"
          :default-expanded-names="expandedNames"
      >
        <n-collapse-item
            v-for="item in props.processorData"
            :key="item.key"
            :name="item.name"
            :title="item.title"
        >
          <div class="component-card-collect-flex">
            <component-card
                v-for="component in item.components"
                :key="component.type"
                :icon-class-name="component.iconClassName"
                :type="component.type"
                :text="component.text"
                :icon-height="component.iconHeight"
                :icon-width="component.iconWidth"
                @click="onCardClick"
            >
            </component-card>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import ComponentCard from "@/view/panel/components/ComponentCard.vue";
import {computed} from "vue";

interface Component {
  type: string;
  iconClassName: string;
  text: string;
  iconWidth: string;
  iconHeight: string;
}

interface DataType {
  key: string;
  title: string;
  name: string;
  components: Array<Component>;
}

const props = defineProps({
  processorData: {
    type: Array<DataType>,
    required: true,
  },
});

const emit = defineEmits(["cardClick", "update:processorData", "close"]);

const {t} = useI18n();

const expandedNames: Array<string> = computed(() => {
  const rs = new Array<string>();
  props.processorData.forEach((item: DataType) => {
    rs.push(item.name);
  });
  return rs;
});

const onCardClick = (type: string, text: string, iconClassName: string) => {
  emit("cardClick", type, text, iconClassName);
};
</script>

<style scoped lang="scss">
// 调整页签内容的内边距
.designer-component-tabs {
  // 减去步骤条搜索栏高度
  padding: 10px;

  .designer-component-tab {
    //padding: 10px;
  }

  .component-card-collect-flex {
    display: flex;
    flex-wrap: wrap;
  }
}

// 折叠面板
.designer-collapse-wrap {
  box-shadow: none;
}

.designer-collapse-wrap :deep(.devui-collapse__item-title) {
  display: flex;
  font-weight: bold;
}

.connector-wrap {
  .item-text-wrap {
    margin-top: 7px;
  }
}

.processor-wrap {
  .item-text-wrap {
    margin-top: 16px;
  }
}
</style>
