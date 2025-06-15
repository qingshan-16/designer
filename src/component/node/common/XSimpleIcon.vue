<template>
  <div class="icon-wrap">
    <div class="icon-container">
      <div class="icon-container-img" :class="props.iconClassName"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  iconClassName: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.icon-wrap {
  // width: 64px;
  // height: 100%;
  // background-color: rgba(217, 233, 251, 0.1);
  // border-radius: 8px 0 0 8px;
  display: flex;
  // overflow: hidden;
  justify-content: center;
  align-items: center;

  position: relative;
  width: 38px;
  height: 38px;
  box-sizing: border-box;

  .icon-container {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;

    .icon-container-img {
      background-position: 50%;
      width: 34px;
      height: 34px;
      background-size: 100% 100%;
    }
  }
}
</style>
