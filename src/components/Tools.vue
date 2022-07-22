<template>
  <div class="image-tools">
    <button @click="$emit('image-toggle')">Toggle image</button>
    <div class="input-wrapper">
      <p>Position:</p>
      <div class="input-position-item">
        <div>
          <p class="input-item"><strong>x:</strong></p>
          <input id="position-w" autocomplete="nope" :disabled="!cropArea" :value="cropArea?.x" @input="updateUnit('x', $event)" />
        </div>
        <div>
          <p class="input-item"><strong>y:</strong></p>
          <input id="position-h" autocomplete="nope" :disabled="!cropArea" :value="cropArea?.y" @input="updateUnit('y', $event)" />
        </div>
      </div>
    </div>
    <div class="input-wrapper">
      <p>Size:</p>
      <div class="input-size-item">
        <div>
          <p class="input-item"><strong>w:</strong></p>
          <input id="size-w" autocomplete="nope" :disabled="!cropArea" :value="cropArea?.width" @input="updateUnit('width', $event)" />
        </div>
        <div>
          <p class="input-item"><strong>h:</strong></p>
          <input id="size-h" autocomplete="nope" :disabled="!cropArea" :value="cropArea?.height" @input="updateUnit('height', $event)" />
        </div>
      </div>
    </div>
    <div class="input-wrapper">
      <p>Restrict output:</p>
      <div class="input-size-item">
        <div>
          <p class="input-item"><strong>w:</strong></p>
          <input id="restrict-size-w" autocomplete="nope" />
        </div>
        <div>
          <p class="input-item"><strong>h:</strong></p>
          <input id="restrict-size-h" autocomplete="nope" />
        </div>
      </div>
    </div>
    <button :disabled="!cropArea" @click="$emit('apply-changes')">Apply</button>
  </div>
</template>

<script lang="ts">
import { CardinalArea } from '@/ts/image-editor/helpers/layout/definitions';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    cropArea: {
      type: Object as PropType<CardinalArea> | null,
      default: null
    }
  },
  setup(props, { emit }) {
    const validateInputAreaUnit = (unit: number) => unit >= 0;

    const updateUnit = (unit: keyof CardinalArea, event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      const intValue = +value;
      if (props.cropArea && !Number.isNaN(intValue) && validateInputAreaUnit(intValue)) {
        emit('update-cropArea', { ...props.cropArea, [unit]: intValue });
      }
    };

    return {
      updateUnit
    };
  }
});
</script>

<style lang="scss" scoped>
.image-tools {
  display: flex;
  flex-flow: row nowrap;
  margin: 12px auto;
  gap: 18px;
  justify-content: space-between;
  p {
    margin: 0;
  }
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    p {
      text-align: initial;
    }
    .input-position-item,
    .input-size-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 8px;
      > div {
        display: inline-flex;
      }
    }
  }
  @media screen and (min-width: 768px) {
    flex-flow: column nowrap;
    margin: auto 12px;
    .selection-size {
      display: flex;
      flex: column;
      max-width: 120px;
    }
  }
}
</style>
