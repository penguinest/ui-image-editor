<template>
  <div class="image-tools">
    <button @click="$emit('image-toggle')">Cambiar imagen</button>
    <button @click="$emit('apply-changes')">Aplicar</button>
  </div>
</template>

<style lang="scss" scoped>
.image-tools {
  display: flex;
  flex-flow: row nowrap;
  margin: 12px auto;
  gap: 18px;
  justify-content: space-between;
  > button {
    height: 26px;
  }
  @media screen and (min-width: 768px) {
    flex-flow: column nowrap;
    margin: auto 12px;
  }
}
</style>
