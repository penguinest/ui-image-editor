<template>
  <div class="image-editor">
    <Tools @applyChanges="imageCanvasRef?.applyChanges" @imageToogle="imageCanvasRef?.toggleVerticalImage()" />
    <ImageCanvas class="image-canvas" ref="imageCanvasRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ImageCanvas from '@/components/ImageCanvas.vue';
import Tools from '@/components/Tools.vue';

export default defineComponent({
  components: {
    ImageCanvas,
    Tools
  },
  setup() {
    const imageCanvasRef = ref<InstanceType<typeof ImageCanvas>>();
    return {
      imageCanvasRef
    };
  }
});
</script>

<style lang="scss" scoped>
.image-editor {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  .image-canvas {
    height: 100%;
  }
  @media screen and (min-width: 768px) {
    flex-direction: row-reverse;
  }
}
</style>
