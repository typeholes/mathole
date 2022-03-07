import { reactive } from "vue";
import { GameState } from "../js/GameState";
import { UiVarFields, UiStateMethods, defaultUiVarFields } from "../js/GameVarManager";
import { callEach, objMap} from "../js/util";

export function init<T>( modeToComponentMap: ModeMap, initializedGameState: GameState<T>) {
   modeMap = modeToComponentMap; 
   gameState = initializedGameState;
}

export function onUiMounted() {
  gameState.start();
}

let modeMap : ModeMap = null; // init
let gameState : GameState<any> = null; // init

export type ModeMap = 
  { 'Options' : any
  , 'Dependencies' : any  
  , 'Graph' : any
  , 'Milestones' : any
  , 'Story' : any
  , 'Sidebars' : any
  };

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

export function setMode(modeStr: SidebarModesT, setPrior = true) : void {
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
    sidebarMode : 'Story' as SidebarModesT
});

export type UiVar = UiVarFields;
export type UiState = { 
    vars: { [any: string]: UiVar },
    milestones: { [any: string]: boolean}
};

export const uiState: UiState = reactive( { vars: {}, milestones: {}} );

function cloneUiState(state: UiState) : UiState {
  const newState : UiState = { vars: {}, milestones: {}};
  
  for (let varName in state.vars) {
    newState.vars[varName] = {...state.vars[varName]};
  }

  newState.milestones = {...state.milestones};
  return newState;
}

export const uiStateMethods : UiStateMethods<UiState> = {
    cloner: (m) => cloneUiState(m),
    varAdder: (m,n) => m.vars[n] = reactive({...defaultUiVarFields}),
    varGetter: (m,n,k) => m.vars[n][k],
    varSetter: (m,n,k,v) => m.vars[n][k]= v, 
    milestoneGetter: (m,n) => m.milestones[n],
    milestoneSetter: (m,n,v) => m.milestones[n] = v
}


export function getValue(varName: string) {
  const val = uiState.vars[varName].value;
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
    return uiState.milestones[name];
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
    refreshGraph();
  }
  
}

  function graphTitle(varName: string) : string {
    const prefix = gameState.isBuyable(varName) ? "Cost of " : "";
    return prefix + gameState.getDisplayName(varName);
  }
  
  export function refreshGraph() : void {
    if ( Globals.graphedVarName === '' ) { return; }
    gameState.displayFunction(Globals.graphedVarName, '#test-graph-expr', gameState.getNameMap(), graphTitle(Globals.graphedVarName));  
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
    
  function onMilestoneReached(milestoneName: string, storyPoint: string) {
    gameState.schedule( () => {
      setMode('Story')
    });
    if (!storyPoint) {
      gameState.schedule( () => {
        if (Globals.sidebarMode === 'Story') { gotoPriorMode(); }
      }, 0, 2);
    }
  }
  


  
