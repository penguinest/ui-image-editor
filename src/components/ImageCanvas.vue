<template>
  <div class="canvas-wrapper" ref="canvasWrapperRef">
    <canvas id="canvas" ref="canvasRef"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, ref, watch } from 'vue';
import ImageEditor, { EditorMode } from '@/ts/image-editor';
import { LayoutDefinitions } from '@/ts/image-editor/helpers/layout';

export default defineComponent({
  props: {
    lockedOutputSize: {
      type: Object as PropType<LayoutDefinitions.Size>
    },
    mode: {
      type: Number as PropType<EditorMode>,
      default: EditorMode.ALL
    }
  },
  setup(props) {
    const useVerticalImage = ref(false);

    //![0] Variable definition
    const imageEditor = new ImageEditor();
    const canvasRef = ref<HTMLCanvasElement>();
    const canvasWrapperRef = ref<HTMLDivElement>();
    //![1] Variable definition

    //![0] Methods definition
    const applyChanges = async () => {
      const result = await imageEditor.apply();
      console.log(`ImageEditor result: ${result}`);
    };
    const loadImage = async () => {
      await imageEditor.setImageSource(
        useVerticalImage.value
          ? 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=1500'
          : 'https://images.unsplash.com/photo-1538991383142-36c4edeaffde?auto=format&fit=crop&w=1500'
      );
    };
    const toggleVerticalImage = () => {
      useVerticalImage.value = !useVerticalImage.value;
    };
    //![1] Methods definition

    //![0] Watchers definition
    watch(useVerticalImage, () => loadImage());
    //![1] Watchers definition

    onMounted(async () => {
      document.body.style.overflow = 'hidden';

      try {
        // ImageEditor will be in charge of validation this objects
        const canvas = canvasRef.value!;
        const wrapper = canvasWrapperRef.value!;

        if (
          imageEditor.initialize({
            canvas,
            wrapper,
            lockedOutputSize: props.lockedOutputSize,
            mode: props.mode
          })
        ) {
          loadImage();
        }
      } catch (error) {
        // Handler errors as you prefers
        console.log(error);
      }
    });
    onUnmounted(() => {
      // Avoid bouncing on touch devices.
      document.body.style.overflow = 'auto';
      imageEditor.destroy();
    });

    return {
      applyChanges,
      canvasRef,
      canvasWrapperRef,
      toggleVerticalImage,
      useVerticalImage
    };
  }
});
</script>

<style lang="scss" scoped>
.canvas-wrapper {
  display: grid;
  flex: 1;
  width: 80%;
  margin: auto;
  border: 2px solid rgb(187, 255, 0);
  border-radius: 2px;
  background-color: rgb(187, 187, 187);
  //image-rendering: -moz-crisp-edges;
  //image-rendering: -webkit-crisp-edges;
  //image-rendering: pixelated;
  //image-rendering: crisp-edges;
  overflow: auto;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  canvas {
    margin: auto;
  }

  @media screen and (min-width: 768px) {
    flex-direction: row-reverse;
    width: 80%;
  }
}
</style>
