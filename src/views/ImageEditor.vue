<template>
  <div class="image-editor">
    <Tools
      @apply-changes="() => imageCanvasRef?.applyChanges()"
      @image-toggle="imageCanvasRef?.toggleVerticalImage()"
      @update-cropArea="updateCropArea"
      @update-outputSize="updateOutputSize"
      :cropArea="cropArea"
      :outputSize="outputSize"
    />
    <ImageCanvas class="image-canvas" ref="imageCanvasRef" v-model:cropArea="cropArea" v-model:outputSize="outputSize" />
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from 'vue';
import ImageCanvas from '@/components/ImageCanvas.vue';
import Tools from '@/components/Tools.vue';
import { CardinalArea, Size } from '@/ts/image-editor/helpers/layout/definitions';

export default defineComponent({
  components: {
    ImageCanvas,
    Tools
  },
  setup() {
    const imageCanvasRef = ref<InstanceType<typeof ImageCanvas>>();
    const cropArea: Ref<CardinalArea | undefined> = ref();
    const outputSize: Ref<Size | undefined> = ref();

    const updateCropArea = (value: CardinalArea) => imageCanvasRef.value?.updateCropArea(value);
    const updateOutputSize = (value: Size) => imageCanvasRef.value?.updateLockedOutputSize(value);

    return {
      cropArea,
      outputSize,
      imageCanvasRef,
      updateCropArea,
      updateOutputSize
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
