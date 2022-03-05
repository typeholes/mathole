<script setup lang="ts">

import { GameState } from '../js/GameState';
import { milestoneReached } from './uiUtil';

const props = defineProps<{name: string}>();

const gameState = GameState.getInstance();
</script>

<template>
    <div :class="{milestone: true, reached: milestoneReached(name)}">
        {{ gameState.getMilestoneDisplayName(name) }}: 
        {{ gameState.getMilestoneCondition(name) }}
        {{ gameState.getMilestoneReward(name) }}
    </div>
</template>

<style>
.milestone {
    background-color: rgb(0, 224, 150);
}

.milestone.reached {
    background-color: rgb(140, 125, 255);
}


</style>