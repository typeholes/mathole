<script setup lang="ts">
import { sidebarModeList, setMode } from './uiUtil';
</script>

<template>
<div class="contents" v-for="(sidebarMode) in sidebarModeList()">
    <div><button @click="setMode(sidebarMode)">{{sidebarMode}}</button></div>
</div>
</template>