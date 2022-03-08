<script setup lang="ts">
import { reactive } from 'vue';
import { Globals } from './uiUtil';

  const state = reactive ({
    loggedIn: false,
  });

  function shout() {
    alert('JankyMarketTrader.com says\\nCould not process payment for user: Password123');
  }
  
  function getFreeAccount() : boolean {
    return Globals.freeAccount;
  }
</script>

<template>
  <div class="jankyPane">
  <hr>
  <h5>http://jankymarkettrader.com</h5>
  <hr>

  <!-- intentionally broken marquee and type for premium -->
  <div id="mqdiv">
  <div id="mqdiv1">
    &nbsp;Upgrade to a <b class="glow">Premuim</b> account now!!!!!!
  </div>
  <div id="mqdiv2">
    &nbsp;Upgrade to a <b>Premuim</b> account now!!!!!!
  </div>
  </div>

  <div v-if="!getFreeAccount()">
    <button v-if="!state.loggedIn" @click="state.loggedIn=true">Log in</button>
    <div v-if="state.loggedIn">
      <div class="blink_me">Your account has been disabled due to automatic payments being declined</div>
      <input type="text"><button @click="shout()">Update Credit Card</button>
      <button @click="Globals.freeAccount=true">Switch to a free account now</button>
    </div>
  </div>
  <div v-else>
    freebee
  </div>
  
  </div>
</template>

<style scoped>
#mqdiv{
  border: 2px solid black;
  overflow: hidden;
  white-space: nowrap;
}

#mqdiv1 {
  display: inline-block;
  animation: marquee 10s linear infinite;
}

#mqdiv2 {
  display: inline-block;
  animation: marquee2 10s linear infinite;
  animation-delay: 5s;
}

@keyframes marquee {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes marquee2 {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-200%);
  }
}

.jankyPane {
  filter: invert(100%);
  background-color: antiquewhite;
}

.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.glow {
  font-size: 30px;
  color: #fff;
  text-align: center;
  animation: glow 1s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 1px #fff, 0 0 2px #fff, 0 0 2px #e60073, 0 0 2px #e60073, 0 0 2px #e60073, 0 0 2px #e60073, 0 0 2px #e60073;
  }
  to {
    text-shadow: 0 0 4px #fff, 0 0 10px #ff4da6, 0 0 10px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}

</style>