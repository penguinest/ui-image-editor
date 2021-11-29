<template>
  <div class="header">
    <button @click="$emit('image-toggle')">Cambiar imagen</button>
    <button @click="$emit('image-crop')">Recortar</button>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: inline-flex;
  height: 26px;
  margin: 12px auto;
  gap: 18px;
}
</style>
