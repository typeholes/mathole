<script setup lang="ts">
import Milestone from './Milestone.vue';
import { onEngineCallback } from './uiUtil';
import { reactive } from 'vue';

let state = reactive( { milestoneName: "", storyPoint: ""} );

onEngineCallback('milestoneReached', 
    (milestoneName: string, storyPoint: string) => {
        state.milestoneName = milestoneName;
        state.storyPoint = storyPoint
    }
);

</script>

<template>
<div>
    <div> 
        <Milestone :name="state.milestoneName"></Milestone>
    </div>
    <span style="white-space: pre-wrap">
        {{ state.storyPoint }}
    </span>
</div>
</template>