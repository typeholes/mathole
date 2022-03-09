<script setup lang="ts">
import { processSlotOutlet } from '@vue/compiler-core';
import { reactive } from 'vue';

interface Props {
    collapsed: boolean,
    leftColSpec?: string,
    rightColSpec?: string,
}

const props = withDefaults(defineProps<Props>(), {
    collapsed: false,
    leftColSpec: "45%",
    rightColSpec: "2fr"
});

const emit = defineEmits<{
 (e: 'update:collapsed', value: boolean): void
}>();

type LeftRight = 'left';


const theme = reactive({
    color : 'rgb(255,255,255)',
    left : { width: props.leftColSpec, collapsed: props.collapsed, label: '<' },
});

    function toggle(side: LeftRight) {
        if ( props.collapsed ) {
            theme[side].width = props.leftColSpec;
            theme[side].label = '<';
        } else {
            theme[side].width = '0%';
            theme[side].label = '>';
        }
        emit('update:collapsed', !props.collapsed);
    }
    
</script>

<template>
<div class="container">
    <div class="vSplitter">
       <div v-if="!props.collapsed" class="vLeft">
           <slot name="left"></slot>
       </div> 
       <div @click="toggle('left')" class="collapseLeft"> {{ theme['left'].label }} </div>
       <div class="vRight">
           <slot name="right"></slot>
       </div> 
    </div>
    </div>
</template>

<style scoped>
 .vSplitter {
   display: grid;
   grid-template-columns: v-bind('theme["left"].width') min-content v-bind('props.rightColSpec');
   grid-template-rows: 1fr min-content 1fr;
   grid-gap: 1px;
}

.vSplitter > div {
    background-color: v-bind('theme.color'); 
}
.vLeft   {
  grid-column: 1;;
  grid-row: 1/span 3;
}

.vRight {
  grid-column:3;
  grid-row: 1/span 3;
}

.collapseLeft {
    grid-column: 2;
    grid-row: 2;
} 

</style>