<script setup>

import { inject} from 'vue';


defineProps({
    src: null,
})

</script>

<template>
    <div>
        {{ src.displayName }}: {{ src.value }} {{ src.buyable }}
        <button @click="src.value++" v-if="src.buyable">
            buy
        </button>
    </div>
</template>

<style scoped>
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}
</style>
