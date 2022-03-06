<script setup lang="ts">
import { GameState } from '../js/GameState';

const gameState = GameState.getInstance();

</script>

<template>
<div>
    <button @click="gameState.save">save</button>
    <button @click="gameState.load">load</button>
</div>
</template>          
                    
                              
                                        
                                                  
                                                            
                                                                      
                                                                                
                                                                                          