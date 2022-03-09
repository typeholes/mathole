<script setup lang="ts">
import { ref } from 'vue';

interface Props {
    swap: boolean,
}

const props = defineProps<Props>();

</script>

<template>
<div class="container">
       <div v-if="swap">
           <slot name="after"></slot>
       </div> 
       <div v-else>
           <slot name="before"></slot>
       </div>
    </div>
</template>
