<script setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
<div>
  <div id="dino">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 817 296" id="glasses">
        <path fill="#E5F2E7" d="M795.4,7H18.6C12.2,7,7,12.2,7 …" />
        <rect x="57.5" y="48.1" fill="#f00" width="254.5" height="186.9" rx="26" ry="26" />
        <rect x="493" y="48.1" fill="#0ff" width="254.5" height="186.9" rx="26" ry="26" />
  <div class="btnPanel">
    <div class="scroll">
      <div class="slider"> |
      </div>
    </div>
 
    <button class="btn"> hi </button>
    <button class="btn"> bye </button>
    <button class="btn"> maybe </button>
    <button class="btn"> later </button>
    
  </div>
</div>
</template>

<style >

  .btnPanel {
		height: 200px;
    display: grid;
    grid-template-rows: repeat(5, 50px) ;
    grid-template-columns: 1fr 20px;
    row-gap: 5px;
    column-gap: 1px;
    overflow: hidden;
  }
  
  .scroll {
    grid-column: 2;
    grid-row: 1/-1;
    border: 1px;
    
      }
  
  .btn {
    grid-column: 1;
}
  
  .slider {
      
    background-color: white;
    background-blend-mode: lighten;
    height: 10px;
    width: 1px;
  }
  
</style>