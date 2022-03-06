<script setup lang="ts">
import { Globals } from './uiUtil';
import { GameState } from '../js/GameState';

const gameState = GameState.getInstance();
</script>

<template>
<div>
    Dependencies: {{ Globals.dependencies.map( (x) => gameState.getDisplayName(x) ).join(", ") }} <br><br>
    Dependents: {{ Globals.dependents.map( (x) => gameState.getDisplayName(x) ).join(", ") }} 
</div>
</template>