<template>
  <div class="slidev-layout cover wrapper flex justify-center items-center relative">
    <div class="absolute left-0 right-0 top-0 bottom-0">
      <img src="/image4.png" alt="Background Image" />
      <img src="/image3.png" alt="Background Image" />
    </div>

    <div class="mb-35 z-10 text-center">
      <slot />
    </div>

    <div class="sub-wrapper absolute bottom-10 left-10 z-10">
      <div class="text-white">
        <slot name="sub1" />
      </div>
      <div class="text-yellow-500">
        <slot name="sub2" />
      </div>
    </div>

    <div class="absolute bottom-10 right-10 z-10">
      <img class="w-15" src="/DataBSLogo.svg">
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: Arial, Helvetica, sans-serif;
}

.wrapper {
  width: 100%;
  height: 100%;
  background-color: black;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sub-wrapper {
  font-size: 2rem;
}
</style>