<template>
  <div class="icon-wrap">
    <div class="icon-container">
      <div class="icon-container-img" :class="props.iconClassName"></div>
      <div class="icon-container-blur" :class="props.iconClassName"></div>
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
  width: 64px;
  height: 100%;
  background-color: rgba(217, 233, 251, 0.1);
  border-radius: 8px 0 0 8px;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;

  .icon-container {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;

    .icon-container-img {
      background-position: 50%;
      width: 46px;
      height: 46px;
      background-size: 100% 100%;
    }

    .icon-container-blur {
      width: 96px;
      height: 96px;
      background-size: 100% 100%;
      background-position: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      filter: blur(5px);
      opacity: 0.1;
    }
  }
}
</style>
