<template>
  <div class="component-card-item" @click="onClick">
    <div class="item-icon-wrap">
      <div
          class="icon-container"
          :style="{ width: props.iconWidth, height: props.iconHeight }"
          :class="props.iconClassName"
      ></div>
    </div>
    <n-tooltip placement="top" :delay="500" trigger="hover">
      <template #trigger>
        <div class="item-text-wrap">{{ props.text }}</div>
      </template>
      <span> {{ props.text }} </span>
    </n-tooltip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  iconClassName: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  iconWidth: {
    type: String,
    default: "",
  },
  iconHeight: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);

const onClick = () => {
  emit("click", props.type, props.text, props.iconClassName);
};
</script>

<style scoped lang="scss">
.component-card-item {
  margin: 0;
  height: 100px;
  width: 100px;
  box-sizing: border-box;
  cursor: pointer;
  border: 2px solid transparent;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #f2f5fc;
    border-radius: 8px;
    cursor: pointer;
  }

  .item-text-wrap {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-top: 7px;
    text-align: center;
    font-weight: 600;
    color: #252b3a;
  }

  .item-icon-wrap {
    .icon-container {
      margin: 0 auto;
      background-position: 50%;
      width: 55px;
      height: 55px;
      background-size: 100% 100%;
    }
  }
}
</style>
