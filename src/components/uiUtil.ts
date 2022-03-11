import { reactive } from "vue";
import { GameState } from "../js/GameState";
import { RequiredVarFields, UiStateMethods, defaultUiVarFields, ExtraVarFields, RequiredStateFields, RequiredMilestoneFields, ExtraMilestoneFields, defaultUiMilestoneFields } from "../js/GameVarManager";
import { callEach } from "../js/util";

export interface UiVar extends RequiredVarFields {
  visible?: boolean 
  janky?: boolean
};

export type UiMilestone = RequiredMilestoneFields;

export type UiState = { 
    vars: { [any: string]: UiVar },
    milestones: { [any: string]: { reached: boolean}}
};

export type UiGameState = GameState<UiState, UiVar, UiMilestone>;

export function init( modeToComponentMap: ModeMap, initializedGameState: UiGameState) {
   modeMap = modeToComponentMap; 
   gameState = initializedGameState;
}

export function onUiMounted() {
  gameState.start();
}

let modeMap : ModeMap = null; // init
let gameState : UiGameState = null; // init

export type ModeMap = 
  { 'Options' : any
  , 'Dependencies' : any  
  , 'Graph' : any
  , 'Milestones' : any
  , 'Story' : any
  , 'Sidebars' : any
  , 'Help' : any
  };

export function showHelp() {
  setMode('Help', true, false);
}

export function sidebarModeList() : SidebarModesT[] { 
  return Object.keys(modeMap) as SidebarModesT[]
};

export type SidebarModesT = keyof ModeMap;

export function sidebarComponent() {
  return getMode(Globals.sidebarMode);
}

function getMode(modeStr: SidebarModesT) : any {
  return modeMap[modeStr] || modeMap['Sidebars'];
}

let priorModes : SidebarModesT[] = ['Sidebars'];
export function gotoPriorMode() : void {
  if ( priorModes.length == 0) { setMode('Sidebars', false); return;}
  setMode(priorModes.pop(), false);
}

export function setMode(modeStr: SidebarModesT, setPrior = true, setHelp = true) : void {
  if ( setHelp ) { Globals.helpKey = modeStr; }

  if ( setPrior && Globals.sidebarMode !== 'Sidebars' ) { priorModes.push( Globals.sidebarMode); }
  if ( priorModes.length > 20 ) priorModes.splice(0, priorModes.length-20);
  Globals.sidebarMode = modeStr;
}

export function popupStory() {
  Globals.sidebarMode = 'Story';
}

export const Globals = reactive({
    graphedVarName : "",
    selectedVarName : "",
    dependencies : [],
    dependents : [],
    sidebarMode : 'Story' as SidebarModesT,
    helpKey: "",
});


export const defaultExtraVarFields = {
  visible: true,
  janky: false
}


export const uiState: UiState = reactive( { vars: {}, milestones: {}} );

function cloneUiState(state: UiState) : UiState {
  const newState : UiState = { vars: {}, milestones: {}};
  
  for (let varName in state.vars) {
    newState.vars[varName] = {...state.vars[varName]};
  }

  newState.milestones = {...state.milestones};
  return newState;
}

export const uiStateMethods : UiStateMethods<UiState, UiVar, UiMilestone> = {
    cloner: (m: UiState) => cloneUiState(m),
    varAdder: (m: UiState, n: string, extra: ExtraVarFields<UiVar>) => m.vars[n] = reactive({...defaultExtraVarFields, ...defaultUiVarFields, ...extra}),
    varGetter: (m: UiState, n: string, k: string) => m.vars[n][k],
    varSetter: (m: UiState, n: string, k: string, v: number) => m.vars[n][k]= v, 
    milestoneAdder: (m: UiState, n: string, extra: ExtraMilestoneFields<UiMilestone>) => m.milestones[n] = reactive({...defaultUiMilestoneFields, ...defaultUiMilestoneFields, ...extra}),
    milestoneGetter: (m: UiState, n: string) => m.milestones[n].reached,
    milestoneSetter: (m: UiState, n: string, v: boolean) => m.milestones[n].reached = v,
}

export function isVisible(varname: string) : boolean {
  return uiState.vars[varname].visible;    
}

export function getValue(varName: string) {
  const val = uiState.vars[varName].value;
  return val;
}

export function getTotal(varName: string) {
  const val = uiState.vars[varName].total;
  return val;
}

export function getSellCost(varName: string) {
  const val = uiState.vars[varName].sellCost;
  return val;
}

export function getCost(varName: string) {
  const val = uiState.vars[varName].cost;
  return val;
}

export function milestoneReached(name: string) {
    return (uiState.milestones[name]||{}).reached;
}


export function mainClick(varName: string) {
  
  if ( Globals.sidebarMode === 'Dependencies') {
    if ( Globals.selectedVarName === varName) { // unselect if already selected
      Globals.selectedVarName = "";
      Globals.dependencies = [];
      Globals.dependents = [];
    } else {
      Globals.selectedVarName = varName;
      let newDependencies = gameState.getDependencies(varName);
      let newDependents = gameState.getDependents(varName);

      Globals.dependencies = newDependencies;
      Globals.dependents = newDependents;
    }
  }
  
  if ( Globals.sidebarMode === 'Graph' ) {
    Globals.graphedVarName = varName;
    refreshGraph(false);
  }
  
}

  function graphTitle(varName: string) : string {
    const prefix = gameState.isBuyable(varName) ? "Cost of " : "";
    return prefix + gameState.getDisplayName(varName);
  }
  
  export function refreshGraph(delay = true) : void {
    if ( Globals.graphedVarName === '' ) { return; }
    if ( delay ) {
      // wait 1 tick for variables to update before refreshing graph
      gameState.schedule( () => {
        gameState.displayFunction(Globals.graphedVarName, '#test-graph-expr', gameState.getNameMap(), graphTitle(Globals.graphedVarName));  
      }, 0, 1); 
    } else {
        gameState.displayFunction(Globals.graphedVarName, '#test-graph-expr', gameState.getNameMap(), graphTitle(Globals.graphedVarName));  
    }
  }
  
  function engineCallbackRunner( callback: EngineCallback ) {
    return (...args) => {
      const [ fn1, fns ] = engineCallbacks[callback];
      const runner = callEach( fn1, ...fns);
      runner( ...args);
    }
  }

  const engineCallbacks : Record<string, [ handler: any, otherHandlers: any[]]> = {
    milestoneReached: [onMilestoneReached, []],
    something: [(n: number) => {}, []]
  }

  export { engineCallbackUI as engineCallbacks };
  let engineCallbackUI = buildEngineCallbackUI();
  
  function buildEngineCallbackUI() {
    const entries = Object.keys(engineCallbacks).map( (key) => [key, engineCallbackRunner(key)]);
    
    return Object.fromEntries(entries);
  }

  export type EngineCallback = keyof typeof engineCallbacks;


  export function onEngineCallback( 
    callback : EngineCallback, 
    handler,
    ) : void {
     engineCallbacks[callback][1].push(handler)
  }
    
  function onMilestoneReached(milestoneName: string, storyPoint: string ) {

    gameState.schedule( () => {
      setMode('Story')
    });
    if (!storyPoint) {
      gameState.schedule( () => {
        if (Globals.sidebarMode === 'Story') { gotoPriorMode(); }
      }, 0, 2);
    }
  }
  


  
