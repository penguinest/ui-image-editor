<template>
  <div class="image-editor">
    <Tools
      @apply-changes="() => imageCanvasRef?.applyChanges()"
      @image-toggle="imageCanvasRef?.toggleVerticalImage()"
      @update-cropArea="imageCanvasRef?.updateCropArea"
      :cropArea="cropArea"
    />
    <ImageCanvas class="image-canvas" ref="imageCanvasRef" v-model:cropArea="cropArea" />
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import ImageCanvas from '@/components/ImageCanvas.vue';
import Tools from '@/components/Tools.vue';
import { CardinalArea } from '@/ts/image-editor/helpers/layout/definitions';

export default defineComponent({
  components: {
    ImageCanvas,
    Tools
  },
  setup() {
    const imageCanvasRef = ref<InstanceType<typeof ImageCanvas>>();
    const cropArea: Ref<CardinalArea | null> = ref(null);

    return {
      cropArea,
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
