<template>
  <div class="print-root">
    <slot />
  </div>
</template>

<style>
@page {
  size: A4;
  margin: 0;
}

.print-root {
  background: white;
}
</style>
