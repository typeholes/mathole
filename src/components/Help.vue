<script setup lang="ts">
import { Globals, ModeMap } from './uiUtil';

const help: ModeMap = {
    Sidebars: "Click a button in the sidebar to set the sidebar mode",
    Options: "Just save and load for now.  More planned",
    Dependencies: `
Click a label in the main pane to show the relationships between values.  
<= means "affects the selected value"
(=) means "is the selected value"
=> means "affected by the selected value"
`,
    Graph: `
Click a label in the main pane to show a graph for the value.
The title of the graph will be X -> Y
TODO describe graph types

Bug: graph is not updated after loading.
`,
    Help: "hover over the ? icon in the top right of the side bar to get help for the current sidebar mode",
    Story: "Shows the most recently reached milestone and associated story point",
    Milestones: `
Shows milestones
Pink = unreached
Green = reached

TODO interact with eselected value
`
}



</script>

<template>
    <div>
        <span style="white-space: pre-wrap">
            {{ help[Globals.helpKey] || "TODO" }}
        </span>
    </div>
</template>