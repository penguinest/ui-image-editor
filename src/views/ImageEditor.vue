<template>
  <div class="image-editor">
    <Tools
      @apply-changes="imageCanvasRef?.applyChanges()"
      @image-toggle="imageCanvasRef?.toggleVerticalImage()"
      @update-cropArea="updateCropArea"
      @update-outputSize="updateOutputSize"
      :cropArea="state.crop"
      :outputSize="state.outputSize"
    />
    <ImageCanvas
      class="image-canvas"
      ref="imageCanvasRef"
      :cropArea="state.crop"
      :lockedOutputSize="state.outputSize"
      :imageEditor="imageEditor"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ImageCanvas from '@/components/ImageCanvas.vue';
import Tools from '@/components/Tools.vue';
import ImageEditor from '@/ts/image-editor';
import { CardinalArea, Size } from '@/ts/image-editor/helpers/layout/definitions';

export default defineComponent({
  components: {
    ImageCanvas,
    Tools
  },
  setup() {
    //![0] Variable definition
    const imageEditor = new ImageEditor();
    const state = imageEditor.state;

    const imageCanvasRef = ref<InstanceType<typeof ImageCanvas>>();
    //![1] Variable definition

    //![0] Methods definition
    const updateCropArea = (value: CardinalArea) => imageEditor.setCropAreaPosition(value);
    const updateOutputSize = (value: Size) => imageEditor.setOutputSize(value);
    //![1] Methods definition

    return {
      imageCanvasRef,
      imageEditor,
      state,
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
