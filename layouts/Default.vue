<template>
    <div class="wrapper flex justify-center items-center relative">
        <div class="absolute right-0 right-1 bottom-20">
            <img src="/image5.png" alt="Background Image" />
        </div>

        <div class="slot-wrapper mb-40 z-10">
            <slot />
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
    background-color: white;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>