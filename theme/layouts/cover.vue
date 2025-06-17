<template>
  <div class="slidev-layout cover wrapper flex justify-center items-center relative">
    <div class="top-5 left-5 absolute z-10 flex justify-center items-end gap-2">
      <img src="/theme/BsStab.svg" alt="Logo" class="h-[100px]" />
      <span class="logo-wrapper text-white">Kanton Basel-Stadt</span>
    </div>

    <div class="slot-wrapper mb-70 font-bold text-white z-10 text-shadow-lg">
      <slot />
    </div>

    <div class="absolute bottom-10 right-10 z-10">
      <img class="w-15" src="/theme/DataBSLogo.svg">
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background-image: url('/theme/image14.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.logo-wrapper {
  font-weight: 800;
  font-size: 2rem;
}
</style>