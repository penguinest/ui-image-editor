<template>
  <div class="image">
    <Header @imageCrop="apply" @imageToggle="toggle" />
    <div class="editor" ref="editorEl">
      <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import Header from '@/components/Header.vue';
import ImageEditor from '@/ts/image-editor';
import { EditorMode } from '@/ts/image-editor/definitions';

export default defineComponent({
  name: 'Image',
  components: {
    Header
  },
  setup() {
    //![0] Variable definition
    const imageEditor = new ImageEditor();
    const verticalImage = ref(false);
    const canvasEl = ref<HTMLCanvasElement | null>(null);
    const editorEl = ref<HTMLDivElement | null>(null);
    //![1] Variable definition

    //![0] Methods definition
    const applyImage = async () => {
      await imageEditor.setImageSource(
        verticalImage.value
          ? 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=1500'
          : 'https://images.unsplash.com/photo-1538991383142-36c4edeaffde?auto=format&fit=crop&w=1500'
      );
    };
    const apply = async () => {
      const result = await imageEditor.apply();
      console.log(`ImageEditor result: ${result}`);
    };
    const toggle = () => {
      verticalImage.value = !verticalImage.value;
    };
    //![1] Methods definition

    //![0] Watchers definition
    watch(verticalImage, () => applyImage());
    //![1] Watchers definition

    onMounted(() => {
      document.body.style.overflow = 'hidden';

      try {
        // ImageEditor will be in charge of validation this objects
        const canvas = canvasEl.value!;
        const wrapper = editorEl.value!;

        if (
          imageEditor.initialize({
            canvas,
            wrapper,
            mode: EditorMode.CROP
          })
        ) {
          applyImage();
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
      apply,
      canvasEl,
      editorEl,
      toggle,
      verticalImage
    };
  }
});
</script>

<style lang="scss" scoped>
.image {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  .editor {
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
  }
}
</style>
