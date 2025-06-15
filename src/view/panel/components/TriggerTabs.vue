<template>
  <n-tabs v-model="activeName" class="designer-component-tabs">
    <n-tab-pane
        :name="t('panel.component.title.connector')"
        class="designer-component-tab"
    >
      <n-collapse
          v-model="connectorActiveNames"
          class="designer-collapse-wrap connector-wrap"
          :default-expanded-names="expandedNames"
      >
        <n-collapse-item
            v-for="item in props.triggerData"
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
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import ComponentCard from "@/view/panel/components/ComponentCard.vue";

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
  triggerData: {
    type: Array<DataType>,
    default: false,
  },
});

const emit = defineEmits(["cardClick", "update:triggerrData"]);

const {t} = useI18n();

const expandedNames: Array<string> = computed(() => {
  const rs = new Array<string>();
  props.triggerData.forEach((item: DataType) => {
    rs.push(item.name);
  });
  return rs;
});

// 连接器分类
const activeName = ref("connector");

// 折叠面板
const connectorActiveNames = ref(["trigger"]);

const onCardClick = (type: string, text: string, iconClassName: string) => {
  emit("cardClick", type, text, iconClassName);
};
</script>

<style scoped lang="scss">
// 调整页签内容的内边距
.designer-component-tabs {
  padding: 10px;

  .designer-component-tab {
    padding: 10px;
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
</style>
