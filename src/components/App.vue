<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, provide } from 'vue'
import Mathole from './Mathole.vue';
import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';

var viewMaps = {}

function addViewMap(containerId, key, value, maps=viewMaps) {
  maps[containerId] ||= {};
  maps[containerId][key]=value;
}

function getView(containerId, key, maps=viewMaps) { return maps[containerId][key]; }

provide('appAddViewMap', addViewMap);
provide('appGetView', getView);


</script>

<template>
<Mathole></Mathole>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>




