<template>
  <div class="x-designer-control">
    <left-operation></left-operation>
    <middle-operation></middle-operation>
    <right-operation></right-operation>
  </div>
</template>
<script setup lang="ts">
import LeftOperation from "./components/LeftOperation.vue";
import MiddleOperation from "./components/MiddleOperation.vue";
import RightOperation from "./components/RightOperation.vue";
</script>

<style scoped lang="scss">
.x-designer-control {
  position: absolute;
  top: 32px;
  width: 100%;
  left: 0;
  z-index: 500;
  display: flex;
  font-size: 12px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}
</style>
