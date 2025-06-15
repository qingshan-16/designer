<template>
  <div class="designer-panel-header">
    <!-- 组件信息-->
    <div class="header-title">
      <div class="title-name-editor">
        <div class="name-editor-icon" :class="headerIcon"></div>
        <div class="name-editor-info">
          <!-- 显示状态 -->
          <div v-if="headerNameDisplay === 'display'" class="info-text">
            <div class="node-name">
              <div class="name-text">
                {{ headerNameText }}
              </div>
              <div
                  v-if="headerIcon !== 'icon-node-base'"
                  class="name-text-edit-icon"
                  @click="onHeaderNameEdit"
              >
                <IconEdit></IconEdit>
              </div>
            </div>
            <div v-if="headerIcon !== 'icon-node-base'" class="node-id">
              <span>{{ t("panel.header.nodeid") }}：{{ headerId }} </span>
              <icon-copy></icon-copy>
            </div>
          </div>

          <!-- 编辑状态 -->
          <div v-if="headerNameDisplay === 'edit'" class="info-edit">
            <n-input
                ref="headerNameInputRef"
                v-model:value="headerNameEdit"
                :placeholder="t('panel.header.name.reset')"
                :clearable="true"
                @blur="onHeaderNameEditBlur"
                @focus="onHeaderNameEditFocus"
            >
            </n-input>
            <div class="info-edit-operation">
              <span>
                <IconYes @mousedown="onSaveEdit"></IconYes>
              </span>
              <span>
                <IconNo @mousedown="onCancelEdit"></IconNo>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="title-close-button" @click="onClose">
        <IconClose></IconClose>
      </div>
    </div>

    <!-- 菜单选择-->
    <div class="header-tabs">
      <n-tabs
          type="segment"
          animated
          v-model:value="props.tabsValue"
          @before-leave="onBeforeLeave"
      >
        <n-tab name="select" :tab="t('panel.header.select')"></n-tab>
        <n-tab name="config" :tab="t('panel.header.config')"></n-tab>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, useTemplateRef} from "vue";
import {BaseNodeModel} from "@logicflow/core";
import IconCopy from "@/assets/image/svg/icon-copy.svg";
import IconEdit from "@/assets/image/svg/icon-edit.svg";
import IconYes from "@/assets/image/svg/icon-yes.svg";
import IconNo from "@/assets/image/svg/icon-no.svg";
import IconClose from "@/assets/image/svg/icon-close.svg";
import {panelRegistry} from "@/view/panel/PanelView.ts";
import type {PanelComponentMeta} from "@/type";
import {useI18n} from "vue-i18n";

const props = defineProps({
  currentModel: {
    type: BaseNodeModel,
    required: true,
  },
  tabsValue: {
    type: String,
    required: true,
    default: "select",
  },
});

const emit = defineEmits([
  "update:current-model",
  "update:tabs-value",
  "before-leave",
  "close",
]);

const {t} = useI18n();

// #region 组件信息相关
// 组件图片
const headerIcon = computed(() => {
  const panelMeta: PanelComponentMeta | undefined = panelRegistry.get(
      props.currentModel.type,
  );
  if (panelMeta === undefined) {
    return "";
  }
  return panelMeta.icon;
});
// 组件展示名称
const headerNameText = computed(() => {
  // 这里先从国际化里拿。就算没有好像也是会返回原值？？？
  const headerName = t(props.currentModel.properties.displayName);
  return headerName ? headerName : props.currentModel.properties.displayName;
});
// 组件id
const headerId = computed(() => {
  return props.currentModel ? props.currentModel.id : "";
});

const headerNameEdit = ref<string>("");
// "edit"或"display"
const headerNameDisplay = ref<string>("display");

// headername的编辑按钮
const onHeaderNameEdit = () => {
  headerNameEdit.value = headerNameText.value;
  headerNameDisplay.value = "edit";
  nextTick().then(() => {
    headerNameInputRef.value?.focus();
  });
};

const headerNameInputRef = useTemplateRef<HTMLElement>("headerNameInputRef");
// 保存编辑结果
const onSaveEdit = () => {
  props.currentModel!.properties.displayName = headerNameEdit.value;
  onHeaderNameEditBlur();
};
// 取消编辑结果
const onCancelEdit = () => {
};
// headername输入框失去焦点时的回调
const onHeaderNameEditBlur = () => {
  headerNameDisplay.value = "display";
};

const onHeaderNameEditFocus = () => {
};

const onBeforeLeave = (
    name: string | number,
    oldName: string | number | null,
) => {
  return emit("before-leave", name, oldName);
};

// 关闭按钮
const onClose = () => {
  emit("close");
};

onMounted(() => {
});
</script>

<style scoped lang="scss">
.designer-panel-header {
  margin: 0;
  //min-height: 80px;
  padding: 15px 20px 0px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: none;

  .header-title {
    height: 60px;
    width: 420px;
    line-height: 22px;
    margin: 0;
    padding: 3px;

    .title-name-editor {
      height: 60px;
      width: 420px;
      align-items: center;
      display: flex;
      margin: 0;
      padding: 0;

      .name-editor-icon {
        margin-right: 20px;
        width: 40px;
        height: 40px;
        background-size: 100% 100%;
      }

      .name-editor-info {
        width: calc(100% - 50px);
        position: relative;
        justify-content: center;
        flex-direction: column;
        display: flex;

        .info-text {
          flex-direction: column;

          .node-name {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            font-size: 18px;
            max-width: calc(100% - 50px);
            display: flex;
            margin-right: 4px;
            line-height: 20px;
            font-weight: bold;

            .name-text {
              display: inline-block;
              color: #252b3a;
              margin-right: 6px;
            }

            .name-text-edit-icon {
              justify-content: center;
              align-items: center;
              display: flex;
              cursor: pointer;
            }
          }

          .node-id {
            color: #575d6c;
            font-weight: 400;
            font-size: 12px;
            display: flex;
            align-items: center;
            padding-top: 5px;
          }
        }

        .info-edit {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 30px;
          width: calc(100% - 160px);

          .info-edit-operation {
            display: flex;

            span {
              width: 20px;
              height: 20px;
              margin-right: 8px;
              cursor: pointer;

              i {
                font-size: 24px;
                cursor: pointer;
              }
            }
          }
        }
      }
    }

    .title-expand-button {
      position: absolute;
      top: 23px;
      right: 65px;
      cursor: pointer;
      margin: 0;
      padding: 0;
      display: block;
      width: 18px;
      height: 18px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .title-close-button {
      top: 23px;
      right: 25px;
      position: absolute;
      z-index: 10;
      width: 25px;
      height: 25px;
      color: #000000;
      font-style: normal;
      text-align: center;
      background: 0 0;
      border: 0;
      transition: color 0.3s;
      cursor: pointer;


      svg {
        width: 100%;
        height: 100%;
      }
    }

    /* 伪元素用于背景颜色变化 */
    .title-close-button::before {
      content: '';
      position: absolute;
      top: 50%; /* 定位到按钮的垂直中心 */
      left: 50%; /* 定位到按钮的水平中心 */
      width: 32px;
      height: 32px;
      border-radius: 8px; /* 保持圆形 */
      transition: background-color 0.3s ease; /* 平滑过渡效果 */
      transform: translate(-50%, -50%); /* 调整中心对齐 */
      z-index: -1; /* 放置在内容后面 */
    }

    /* 鼠标悬浮时的样式 */
    .title-close-button:hover::before {
      background-color: rgba(0, 0, 0, 0.2); /* 悬浮时的背景颜色 */
    }
  }

  .header-tabs {
    padding: 5px;
    display: flex;
  }
}
</style>
