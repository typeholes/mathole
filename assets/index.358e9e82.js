import { _ as _default, p as parser$1, a as parse, s as simplify, d as derivative, b as pushScopeId, c as popScopeId, e as defineComponent, i as inject, o as openBlock, f as createElementBlock, u as unref, g as createBaseVNode, t as toDisplayString, n as normalizeClass, h as createTextVNode, j as createCommentVNode, r as ref, k as createVNode, l as isRef, F as Fragment, m as renderList, w as withDirectives, v as vModelText, q as shallowRef, x as provide, y as onMounted, z as createBlock, A as resolveDynamicComponent, K as KeepAlive, B as createApp } from './vendor.825307ee.js';

const p = function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(script) {
        const fetchOpts = {};
        if (script.integrity)
            fetchOpts.integrity = script.integrity;
        if (script.referrerpolicy)
            fetchOpts.referrerPolicy = script.referrerpolicy;
        if (script.crossorigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (script.crossorigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
};true&&p();

function typeset(parts) { //}: { id: string; toTex: () => string; }[]) {
    const partPromises = parts.map((part) => {
      var el = document.getElementById(part.id);
      var tex = part.toTex();
      return MathJax.tex2chtmlPromise(tex, { em: 64, ex: 16, display: false, scale: 2 }).then(
        nodeHtml => {
          if (el) {
            el.innerHTML = '';
            el.appendChild(nodeHtml);
          }
        });
    });
  
  
    MathJax.typesetClear();
  
    Promise.all(partPromises).then(MathJax.typesetPromise()).then(createHovers);
  }

const addHandlers = function (x) {
    if (x.name) {
      x.toTex =
        () => "\\class{hover varname-" + x.name + "}{" + x.name + "}";
    }
    return x;
  };

function plot(target, expr, title) {
  _default({
    target,
    title,
    yAxis: { domain: [-1, 9] },
    grid: true,
    data: [
      { fn: expr, color: "purple", graphType: "polyline" }
    ],
    tip: {
      renderer: function(x, y, index) {
        return y.toString();
      }
    }
  });
}

function removeValuefromArray(arr, value) {
  const idx = arr.indexOf(value);
  if (idx === -1) {
    return;
  }
  arr.splice(idx, 1);
}
function unique(arr) {
  const check = (value, index, self) => self.indexOf(value) === index;
  return arr.filter(check);
}

const parser = parser$1();
function setVariable(varName, value) {
  parser.set(varName, value);
}
function getDerivative(node, by, args = {}) {
  var expanded = expand(node, true, args);
  var derived = derivative(expanded, by);
  return derived;
}
function expand(node, replaceConstants, localScope = {}, maxDepth = Number.MAX_SAFE_INTEGER, depth = 1) {
  if (node.content) {
    node.content = expand(node.content, replaceConstants, localScope, maxDepth, depth + 1);
    return node;
  }
  if (node.op) {
    node.args = node.args.map((a) => expand(a, replaceConstants, localScope, maxDepth, depth + 1));
    return node;
  }
  if (node.fn) {
    let def = FunctionDefManager.get(node.fn);
    if (typeof def == "undefined" || depth > maxDepth) {
      node.args = node.args.map((a) => expand(a, replaceConstants, localScope, maxDepth, depth));
      return node;
    } else {
      var bodyNode = parse(def.body);
      var bodyScope = {};
      for (var i = 0; i < def.argNames.length; i++) {
        var argName = def.argNames[i];
        var argValue = node.args[i];
        bodyScope[argName] = expand(argValue, replaceConstants, { ...localScope }, maxDepth, depth + 1);
      }
      var newNode = expand(bodyNode, replaceConstants, { ...localScope, ...bodyScope }, maxDepth, depth + 1);
      return newNode;
    }
  }
  if (node.name) {
    const value = localScope[node.name] || parser.get(node.name);
    if (typeof value == "undefined") {
      try {
        const result = node.evaluate();
        if (typeof result === "number") {
          return parse(result.toString());
        } else {
          return node;
        }
      } catch (err) {
        return node;
      }
    }
    if (typeof value == "object") {
      return value;
    }
    return parse(value);
  }
  if (node.value) {
    return node;
  }
}
function runDefinition(str) {
  var result = "Valid";
  var fn = null;
  try {
    fn = parser.evaluate(str);
  } catch (err) {
    result = err;
  }
  return { result, fn };
}
function runString(str) {
  var result = "Not Run";
  try {
    result = parser.evaluate(str);
  } catch (err) {
    result = err;
  }
  return result;
}
function texExpr(expr, doExpand, replaceConstants, args = {}) {
  let parenthesis = "keep";
  let implicit = "hide";
  return function() {
    let node = parse(expr);
    let expanded = doExpand ? expand(node, replaceConstants, args) : node;
    let simplified = simplify(expanded);
    return simplified.transform(addHandlers).toTex({ parenthesis, implicit });
  };
}
function texDerivative(expr, selectedVar, args = {}) {
  let parenthesis = "keep";
  let implicit = "hide";
  return function() {
    let derivative = getDerivative(expr, selectedVar, args);
    return derivative.transform(addHandlers).toTex({ parenthesis, implicit });
  };
}
function displayFunction(functionDef, elementIdPrefix = "", graphId = "", args = {}) {
  if (typeof elementIdPrefix !== "undefined" && elementIdPrefix !== "") {
    displayExpr(functionDef.body, "x", elementIdPrefix, args);
  }
  const expr = functionDef.body;
  const expanded = expand(parse(expr), true, args);
  const filtered = expanded.filter(function(node) {
    return node.isSymbolNode && typeof parser.get(node.name) !== "undefined";
  });
  const freeVars = unique(filtered.map((x) => x.name));
  if (freeVars.length > 1) {
    throw "too many free variables in " + functionDef.name + ": " + freeVars.join(", ");
  }
  const free = freeVars[0];
  const makeX = free === "x" ? "" : free + "=x;";
  plot(graphId, makeX + expanded.toString(), free);
}
function displayExpr(expr, selectedVar, elementIdPrefix = "", args = {}) {
  const parts = [
    {
      id: elementIdPrefix + "pretty",
      toTex: texExpr(expr, false, false)
    },
    {
      id: elementIdPrefix + "pretty-val",
      toTex: texExpr(expr, true, false, args)
    },
    {
      id: elementIdPrefix + "derivative",
      toTex: texDerivative(expr, selectedVar)
    },
    {
      id: elementIdPrefix + "derivative-val",
      toTex: texDerivative(expr, selectedVar, args)
    }
  ];
  typeset(parts);
}

class FunctionDef {
  name;
  argNames;
  body;
  _fn;
  constructor(name, argNames, def) {
    this.name = name;
    this.argNames = argNames;
    this.body = def;
    this._fn = runDefinition(this.defString()).fn;
  }
  evalArgValues(args) {
    return this.argNames.map((name) => runString(args[name]));
  }
  argValues(args) {
    return this.argNames.map((name) => args[name]);
  }
  defString() {
    return this.name + "(" + this.argNames.join(",") + ") = " + this.body;
  }
  run(args) {
    return this._fn(...this.evalArgValues(args));
  }
  callStr(args) {
    return this.name + "(" + this.argValues(args).join(",") + ")";
  }
  callStrEvaluatedArgs(args) {
    return this.name + "(" + this.evalArgValues(args).join(",") + ")";
  }
}
class FunctionDefManager {
  static _instance = new FunctionDefManager();
  map = {};
  static add(fn) {
    FunctionDefManager._instance.map[fn.name] = fn;
  }
  static get(name) {
    return FunctionDefManager._instance.map[name];
  }
  static create(name, argNames, def) {
    const fn = new FunctionDef(name, argNames, def);
    FunctionDefManager.add(fn);
    return fn;
  }
  static adjust(fn, newName, bodyModifier) {
    const ret = this.create(newName, fn.argNames, bodyModifier(fn.body));
    return ret;
  }
}

class GameVar {
  name;
  displayName;
  visible;
  fn;
  args;
  get value() {
    const val = this.fn.run(this.args);
    return val;
  }
  constructor(name, displayName, visible, fn, args) {
    this.name = name;
    this.displayName = displayName;
    this.visible = visible;
    this.fn = fn;
    this.args = args;
  }
  dependsOn(name) {
    const found = Object.values(this.args).find((argValue) => typeof argValue === "string" && argValue.split(/[^a-zA-Z]/).includes(name));
    return !(typeof found === "undefined");
  }
}
class GameTime extends GameVar {
  static instance = new GameTime();
  time = 0;
  constructor() {
    super("t", "Time", false, null, {});
  }
  get value() {
    return this.time;
  }
}
class GameCalculation extends GameVar {
}
class GameBuyable extends GameVar {
  forceSetCounts(cnt, totalCnt) {
    this._cntBought = cnt;
    this._totalBought = totalCnt;
  }
  _cntBought = 0;
  _totalBought = 0;
  currency;
  constructor(name, displayName, visible, fn, args, currency) {
    super(name, displayName, visible, fn, args);
    this.currency = currency;
  }
  get cost() {
    return super.value;
  }
  get value() {
    return this._cntBought;
  }
  get totalBought() {
    return this._totalBought;
  }
  buy() {
    this._cntBought++;
    this._totalBought++;
  }
  spend(cnt) {
    this._cntBought -= cnt;
  }
}
class GameVarManager {
  uiState;
  varAdder;
  costGetter;
  costSetter;
  valueGetter;
  valueSetter;
  constructor(uiState, varAdder, costGetter, costSetter, valueGetter, valueSetter) {
    this.uiState = uiState;
    this.varAdder = varAdder;
    this.costGetter = costGetter;
    this.costSetter = costSetter;
    this.valueGetter = valueGetter;
    this.valueSetter = valueSetter;
    this.add(GameTime.instance);
  }
  getUIValue(gameVar) {
    return this.valueGetter(this.uiState, gameVar.name);
  }
  setUIValue(gameVar, makeDirty = "clean") {
    const value = gameVar.value;
    const varName = gameVar.name;
    this.valueSetter(this.uiState, varName, value);
    setVariable(varName, value);
    if (gameVar instanceof GameBuyable) {
      this.valueSetter(this.uiState, gameVar.name + "_total", gameVar.totalBought);
      setVariable(varName + "_total", gameVar.totalBought);
    }
    if (makeDirty === "dirty") {
      this._dirty.push(varName);
    }
  }
  getUICost(gameVar) {
    return this.costGetter(this.uiState, gameVar.name);
  }
  setUICost(gameVar) {
    if (gameVar instanceof GameBuyable) {
      this.costSetter(this.uiState, gameVar.name, gameVar.cost);
    }
  }
  newCalculation(name, displayName, visible, fn, args) {
    const ret = new GameCalculation(name, displayName, visible, fn, args);
    this.add(ret);
    return ret;
  }
  newBuyable(name, displayName, visible, fn, args, currency) {
    this.varAdder(this.uiState, name + "_total");
    const ret = new GameBuyable(name, displayName, visible, fn, args, currency);
    this.add(ret);
    this.setUIValue(ret);
    this.setUICost(ret);
    const currencyVar = this._items[currency];
    if (currencyVar instanceof GameCalculation) {
      currencyVar.fn = FunctionDefManager.adjust(currencyVar.fn, name + "_" + currency, (body) => body + " - " + fn.callStr(args).replace(name, name + "_total") + " + " + fn.callStrEvaluatedArgs(args));
    }
    this.setUIValue(currencyVar, "dirty");
    return ret;
  }
  add(g) {
    this.varAdder(this.uiState, g.name);
    this._dependencies[g.name] = [];
    this._calculateDependencies(g);
    this._order.push(g.name);
    this._items[g.name] = g;
    this.setUIValue(g, "dirty");
  }
  get(name) {
    return this._items[name];
  }
  getNames() {
    return [...this._order];
  }
  _items = { t: GameTime.instance };
  _order = [];
  _dependencies = {};
  _dirty = [];
  _calculateDependencies(tgt) {
    for (const name in this._items) {
      if (tgt.dependsOn(name)) {
        this._dependencies[name].push(tgt.name);
      }
    }
  }
  tick(elapsedTime) {
    const t = this._items.t;
    t.time += elapsedTime;
    this.valueSetter(this.uiState, "t", t.time);
    this._dirty.push("t");
    this._order.forEach((name) => {
      if (this._dirty.includes(name)) {
        const dirtyVar = this._items[name];
        this.setUIValue(dirtyVar);
        removeValuefromArray(this._dirty, name);
        this._dirty.push(...this._dependencies[name]);
      }
    });
  }
  isBuyable(varName) {
    return this.get(varName) instanceof GameBuyable;
  }
  getCurrency(varName) {
    const buyable = this.get(varName);
    if (!(buyable instanceof GameBuyable)) {
      return;
    }
    return this.get(buyable.currency);
  }
  getCurrencyName(varName) {
    const currency = this.getCurrency(varName);
    if (!currency) {
      return "";
    }
    return currency.name;
  }
  buy(varName) {
    const buyable = this.get(varName);
    if (!(buyable instanceof GameBuyable)) {
      return;
    }
    const currencyName = this.getCurrencyName(varName);
    const currency = this.get(currencyName);
    const cost = buyable.cost;
    if (cost > this.valueGetter(this.uiState, currencyName)) {
      return;
    }
    buyable.buy();
    this.setUIValue(currency, "dirty");
    this.setUIValue(buyable, "dirty");
    this.setUICost(buyable);
    if (currency instanceof GameBuyable) {
      currency.spend(cost);
      this.setUIValue(currency);
      this.setUICost(currency);
    }
    this._dirty.push(varName);
  }
  setFromUIValues() {
    this._order.forEach((varName) => {
      const gameVar = this._items[varName];
      if (gameVar instanceof GameBuyable) {
        gameVar.forceSetCounts(this.valueGetter(this.uiState, varName), this.valueGetter(this.uiState, varName + "_total"));
      } else if (gameVar instanceof GameTime) {
        gameVar.time = this.valueGetter(this.uiState, varName);
      }
      this._dirty.push(varName);
      setVariable(varName, this.valueGetter(this.uiState, varName));
    });
  }
}

const StorageKey = "matholeSaves";
class SaveManager {
  constructor(uiStateGetter) {
    this.uiStateGetter = uiStateGetter;
    const saveStr = window.localStorage.getItem(StorageKey);
    if (saveStr) {
      this.parseSaveStr(saveStr);
    } else {
      this.save("default");
    }
  }
  saves = {};
  uiStateGetter;
  save(saveName) {
    this.buildNewSave(saveName);
    this.writeSaves();
  }
  load(saveName) {
    return this.saves[saveName];
  }
  readSave(saveName) {
    return false;
  }
  parseSaveStr(str) {
    this.saves = JSON.parse(str);
  }
  writeSaves() {
    const saveStr = JSON.stringify(this.saves);
    window.localStorage.setItem(StorageKey, saveStr);
  }
  buildNewSave(name) {
    this.saves[name] = this.uiStateGetter();
  }
}

class GameState {
  canTick = true;
  static init(uiState, cloner, varAdder, costGetter, costSetter, valueGetter, valueSetter, gameSetup) {
    GameState._instance = new GameState(uiState, cloner, varAdder, costGetter, costSetter, valueGetter, valueSetter, gameSetup);
    return uiState;
  }
  static getInstance() {
    return GameState._instance;
  }
  displayFunction(varName, graphTgt) {
    const gameVar = this.gameVarManager.get(varName);
    displayFunction(gameVar.fn, "", graphTgt, gameVar.args);
  }
  getCost(name) {
    return this.costGetter(this.uiState, name);
  }
  getValue(name) {
    return this.valueGetter(this.uiState, name);
  }
  getNames() {
    return this.gameVarManager.getNames();
  }
  tick(elapsedTime) {
    if (this.canTick) {
      this.canTick = false;
      if (this.gameVarManager) {
        this.gameVarManager.tick(elapsedTime);
      }
      this.canTick = true;
    }
  }
  getDisplayName(varName) {
    return this.gameVarManager.get(varName).displayName;
  }
  isVisible(varName) {
    return this.gameVarManager.get(varName).visible;
  }
  buy(varName) {
    this.gameVarManager.buy(varName);
  }
  isBuyable(varName) {
    return this.gameVarManager.isBuyable(varName);
  }
  getCurrencyName(varName) {
    return this.gameVarManager.getCurrencyName(varName);
  }
  getCurrencyDisplayName(varName) {
    return this.getDisplayName(this.getCurrencyName(varName));
  }
  save() {
    this.canTick = false;
    this.saveManager.save("default");
    this.canTick = true;
  }
  load() {
    this.canTick = false;
    const newState = this.saveManager.load("default");
    for (const key in newState) {
      const val = newState[key].value;
      const cost = newState[key].cost;
      this.valueSetter(this.uiState, key, val);
      this.costSetter(this.uiState, key, cost);
    }
    this.gameVarManager.setFromUIValues();
    this.canTick = true;
  }
  static _instance;
  gameVarManager;
  saveManager;
  uiState;
  cloner;
  costGetter;
  valueGetter;
  costSetter;
  valueSetter;
  constructor(uiState, cloner, varAdder, costGetter, costSetter, valueGetter, valueSetter, gameSetup) {
    this.uiState = uiState;
    this.cloner = cloner;
    this.costGetter = costGetter;
    this.valueGetter = valueGetter;
    this.costSetter = costSetter;
    this.valueSetter = valueSetter;
    this.gameVarManager = new GameVarManager(uiState, varAdder, costGetter, costSetter, valueGetter, valueSetter);
    const vars = this.gameVarManager;
    gameSetup(vars, FunctionDefManager);
    this.saveManager = new SaveManager(() => this.cloner(this.uiState));
  }
}

pushScopeId("data-v-09900752");
const _hoisted_1$3 = { key: 0 };
const _hoisted_2$2 = ["disabled"];
const _hoisted_3$2 = /* @__PURE__ */ createTextVNode();
const _hoisted_4$2 = /* @__PURE__ */ createBaseVNode("br", null, null, -1);
popScopeId();
var _sfc_main$6 = /* @__PURE__ */ defineComponent({
  props: {
    varName: { type: String, required: true, default: "" },
    forceVisible: { type: Boolean, required: true, default: false },
    dependencies: { type: Array, required: true, default: () => [] },
    dependents: { type: Array, required: true, default: () => [] },
    graphed: { type: String, required: true, default: "" }
  },
  emits: ["update:dependencies", "update:graphed", "update:dependents"],
  setup(__props, { emit }) {
    const clickActions = inject("clickActions")();
    const gameState = GameState.getInstance();
    function getValue(varName) {
      const val = gameState.getValue(varName);
      return Math.round(val * 100) / 100;
    }
    function getCost(varName) {
      const val = gameState.getCost(varName);
      return Math.round(val * 100) / 100;
    }
    function canBuy(varName) {
      const currencyName = gameState.getCurrencyName(varName);
      if (!currencyName) {
        return false;
      }
      const currency = gameState.getValue(currencyName);
      return currency >= getCost(varName);
    }
    function labelClass(varName, dependencies, dependents) {
      let ret = { dependent: false, depends: false };
      if (clickActions.dependents && dependencies.includes(varName)) {
        ret.dependent = true;
      }
      if (clickActions.dependencies && dependents.includes(varName)) {
        ret.depends = true;
      }
      return ret;
    }
    function labelClick(varName) {
      let newDependencies = varName === "stability" ? ["marketValue", "stability"] : ["marketScale"];
      let newDependents = varName === "marketScale" ? ["marketValue", "stability"] : ["stability"];
      emit("update:dependencies", newDependencies);
      emit("update:dependents", newDependents);
      emit("update:graphed", varName);
      if (clickActions.graph) {
        gameState.displayFunction(varName, "#test-graph-expr");
      }
    }
    function buy(varName, graphedVar) {
      gameState.buy(varName);
      if (graphedVar !== "") {
        gameState.displayFunction(graphedVar, "#test-graph-expr");
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        __props.forceVisible || unref(gameState).isVisible(__props.varName) ? (openBlock(), createElementBlock("div", _hoisted_1$3, [
          createBaseVNode("span", {
            class: normalizeClass(labelClass(__props.varName, __props.dependencies, __props.dependents)),
            onClick: _cache[0] || (_cache[0] = ($event) => labelClick(__props.varName))
          }, toDisplayString(unref(gameState).getDisplayName(__props.varName)) + ": ", 3),
          createTextVNode(" " + toDisplayString(getValue(__props.varName)) + " ", 1),
          unref(gameState).isBuyable(__props.varName) ? (openBlock(), createElementBlock("button", {
            key: 0,
            onClick: _cache[1] || (_cache[1] = ($event) => buy(__props.varName, __props.graphed)),
            disabled: !canBuy(__props.varName)
          }, " Cost: " + toDisplayString(getCost(__props.varName)) + " " + toDisplayString(unref(gameState).getCurrencyDisplayName(__props.varName)), 9, _hoisted_2$2)) : createCommentVNode("", true),
          _hoisted_3$2,
          _hoisted_4$2
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});

var GameVarView_vue_vue_type_style_index_0_scoped_true_lang = "\nbutton[data-v-09900752] {\r\n  background-color: #dee7a7;\n}\nbutton.selected[data-v-09900752] {\r\n background-color: #9342b9;\n}\n.dependent[data-v-09900752] {\r\n background-color: #6cf5de;\n}\n.depends[data-v-09900752] {\r\n  background-color: #9e83f8;\n}\r\n";

_sfc_main$6.__scopeId = "data-v-09900752";

pushScopeId("data-v-36aede9d");
const _hoisted_1$2 = /* @__PURE__ */ createBaseVNode("div", {
  id: "test-graph-expr",
  class: "graphDiv"
}, null, -1);
popScopeId();
var _sfc_main$5 = /* @__PURE__ */ defineComponent({
  setup(__props) {
    const gameState = GameState.getInstance();
    let dependencies = ref([]);
    let dependents = ref([]);
    let graphedVar = ref("");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createBaseVNode("h1", null, [
          createVNode(_sfc_main$6, {
            varName: "score",
            dependencies: unref(dependencies),
            "onUpdate:dependencies": _cache[0] || (_cache[0] = ($event) => isRef(dependencies) ? dependencies.value = $event : dependencies = $event),
            dependents: unref(dependents),
            "onUpdate:dependents": _cache[1] || (_cache[1] = ($event) => isRef(dependents) ? dependents.value = $event : dependents = $event),
            forceVisible: "",
            graphed: unref(graphedVar),
            "onUpdate:graphed": _cache[2] || (_cache[2] = ($event) => isRef(graphedVar) ? graphedVar.value = $event : graphedVar = $event)
          }, null, 8, ["dependencies", "dependents", "graphed"])
        ]),
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(gameState).getNames(), (varName) => {
          return openBlock(), createElementBlock("div", null, [
            createVNode(_sfc_main$6, {
              varName,
              dependencies: unref(dependencies),
              "onUpdate:dependencies": _cache[3] || (_cache[3] = ($event) => isRef(dependencies) ? dependencies.value = $event : dependencies = $event),
              dependents: unref(dependents),
              "onUpdate:dependents": _cache[4] || (_cache[4] = ($event) => isRef(dependents) ? dependents.value = $event : dependents = $event),
              graphed: unref(graphedVar),
              "onUpdate:graphed": _cache[5] || (_cache[5] = ($event) => isRef(graphedVar) ? graphedVar.value = $event : graphedVar = $event)
            }, null, 8, ["varName", "dependencies", "dependents", "graphed"])
          ]);
        }), 256)),
        _hoisted_1$2
      ]);
    };
  }
});

var Game_vue_vue_type_style_index_0_scoped_true_lang = "\nbutton[data-v-36aede9d] {\r\n  background-color: #dee7a7;\n}\nbutton.selected[data-v-36aede9d] {\r\n  background-color: #9342b9;\n}\r\n";

_sfc_main$5.__scopeId = "data-v-36aede9d";

pushScopeId("data-v-fad43050");
const _hoisted_1$1 = /* @__PURE__ */ createTextVNode(" function: ");
const _hoisted_2$1 = /* @__PURE__ */ createBaseVNode("br", null, null, -1);
const _hoisted_3$1 = /* @__PURE__ */ createBaseVNode("br", null, null, -1);
const _hoisted_4$1 = /* @__PURE__ */ createBaseVNode("div", {
  id: "view-fn-graph-expr",
  class: "graphDiv"
}, null, -1);
popScopeId();
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  setup(__props) {
    let expr = ref("x");
    let displayExpr = ref("x");
    function showGraph() {
      let node = parse(expr.value);
      let expanded = expand(node, true, {}).toString();
      plot("#view-fn-graph-expr", expanded, "0");
      displayExpr.value = expand(node, true, {}, 1).toString();
    }
    function replaceWithExpanded() {
      expr.value = displayExpr.value;
      showGraph();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        _hoisted_1$1,
        withDirectives(createBaseVNode("input", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(expr) ? expr.value = $event : expr = $event),
          onChange: showGraph,
          size: "50"
        }, null, 544), [
          [vModelText, unref(expr)]
        ]),
        _hoisted_2$1,
        createTextVNode(" expanded: " + toDisplayString(unref(displayExpr)) + " ", 1),
        _hoisted_3$1,
        createBaseVNode("button", { onClick: replaceWithExpanded }, "replace with expanded"),
        _hoisted_4$1
      ]);
    };
  }
});

var FunctionViewer_vue_vue_type_style_index_0_scoped_true_lang = "\nbutton[data-v-fad43050] {\r\n  background-color: #dee7a7;\n}\nbutton.selected[data-v-fad43050] {\r\n  background-color: #9342b9;\n}\r\n";

_sfc_main$4.__scopeId = "data-v-fad43050";

var VarEditor_vue_vue_type_style_index_0_scoped_true_lang = "\nbutton[data-v-06a44740] {\r\n  background-color: #dee7a7;\n}\nbutton.selected[data-v-06a44740] {\r\n  background-color: #9342b9;\n}\r\n";

const _sfc_main$3 = {
  setup(__props) {


// import { inject, provide, ref} from 'vue';
// import GameVarView from './GameVarView.vue';
// import * as GameVar from '../js/GameVar';
// import { uiVars } from '../GameState';

// const varMap = ref ( uiVars );

// var selectedVarName = ref("t");
// var varObj = ref(varMap.t);

// const newVarName = ref(' ');

// function selectVar(event) {
//     selectedVarName.value=event.target.value;
//     varObj.value  = varMap[selectedVarName.value];
// }

// function runVarFunction(name) {
//     const gameVar = varMap[selectedVarName.value];
//     if (!gameVar) { return 0; }
//     var ret = "";
//     try {
//         ret =  name == 'valueMathFunction' ? GameVar.getValue(gameVar, varMap) : GameVar.getCost(gameVar, varMap) ;
//     } 
//     catch(err) {ret = err }
//     return ret;
// }


// function getField(name) {
//     const gameVar = varMap[selectedVarName.value];
//     const ret = gameVar && gameVar[name]; 
//     if (typeof ret === 'function') return 'function';
//     return ret;
// }


// function getArray(name) {
//     const gameVar = varMap.value()[selectedVarName.value];
//     const ret = gameVar && gameVar[name]; 
//     return JSON.stringify(ret);
// }

// function update(event, name, src='value') {
//     var value = event.target[src];
//     varMap.setVarField( {varName: selectedVarName.value, name: name, value: value});        
//     // clear the actual functions when the function names change so they will get rebuilt
//     // probably should be on the action
//     if (name == 'costFn' || name == 'costArgs') {
//         varMap.setVarField( {varName: selectedVarName.value, name: 'costMathFunction', value: null});        
//     }
//     if (name == 'valueFn'|| name == 'valueArgs') {
//         varMap.setVarField( {varName: selectedVarName.value, name: 'valueMathFunction', value: null});        
//     }    
// }

// function updateArray(event, name, src='value') {
//     var value = event.target[src];
//     var json = JSON.parse(value);
//     varMap.setVarField( {varName: selectedVarName.value, name: name, value: json});        
// }

// function addNewVar() {
//     if (!newVarName.value) return;
//     const name = newVarName.value.trim();
//     if (!name) return;
//     varMap.addVar(newVarName.value);
// }


return (_ctx, _cache) => {
  return null
}
}

};


_sfc_main$3.__scopeId = "data-v-06a44740";

function gameSetup(vars, functions) {
  functions.create("id", ["x"], "x");
  const times = functions.create("times", ["x", "b"], "x*b");
  functions.create("reciprical", ["x"], "1/(x+1)");
  functions.create("zigZag", ["x"], "1-2 * acos((1- smoother) * sin(2 * pi * x))/pi");
  functions.create("squareWave", ["x"], "2 * atan( sin(2 * pi * x)/ smoother )/pi");
  functions.create("sawtooth", ["x"], "(1+zigZag((2 * x - 1)/4) * squareWave(x/2))/2");
  functions.create("steps", ["x"], "x - sawtooth(x)");
  functions.create("logSquares", ["x", "b"], "log(x^2+b^2)");
  functions.create("curvedSawtooth", ["x"], "logSquares(x^smoother,sawtooth(x))");
  const calcMarketValue = functions.create("calcMarketValue", ["x"], "curvedSawtooth(x)*(marketScale+1)");
  vars.newCalculation("score", "Score", false, times, { "x": "t", b: 2 });
  vars.newBuyable("stability", "Market Stability", true, times, { "x": 1.25, b: "stability+1" }, "score");
  vars.newBuyable("marketScale", "Market Scale", true, times, { "x": 2, b: "marketScale+1" }, "stability");
  vars.newCalculation("smoother", "Smoother", false, times, { x: "stability", b: 0.01 });
  vars.newCalculation("marketValue", "Market Value", true, calcMarketValue, { x: "t" });
}

var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  props: {
    label: { type: String, required: true },
    state: { type: Boolean, required: true }
  },
  emits: ["update:state"],
  setup(__props, { emit }) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("button", {
        class: normalizeClass({ toggled: __props.state }),
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:state", !__props.state))
      }, toDisplayString(__props.label), 3);
    };
  }
});

var ToggleButton_vue_vue_type_style_index_0_scoped_true_lang = "\n.toggled[data-v-af584eb2]  {\r\n  background-color: #9342b9;\n}\nbutton[data-v-af584eb2] {\r\n  background-color: #dee7a7;\n}\r\n";

_sfc_main$2.__scopeId = "data-v-af584eb2";

pushScopeId("data-v-185c34f8");
const _hoisted_1 = /* @__PURE__ */ createTextVNode(" todo ");
const _hoisted_2 = {
  width: "100%",
  border: "1"
};
const _hoisted_3 = {
  rowspan: "3",
  width: "10%"
};
const _hoisted_4 = /* @__PURE__ */ createTextVNode(" Click Actions ");
const _hoisted_5 = /* @__PURE__ */ createBaseVNode("tr", null, [
  /* @__PURE__ */ createBaseVNode("td")
], -1);
popScopeId();
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  props: {},
  setup(__props) {
    ref(GameState.init(ref({}), (m) => m, (m, n) => m.value[n] = { cost: 0, value: 0 }, (m, n) => m.value[n].cost, (m, n, cost) => m.value[n].cost = cost, (m, n) => m.value[n].value, (m, n, value) => m.value[n].value = value, gameSetup));
    const gameState = GameState.getInstance();
    const mode = shallowRef(_sfc_main$3);
    function setMode(newMode) {
      mode.value = newMode;
    }
    const deltaDisplay = ref(0);
    const clickActions = ref({
      dependencies: false,
      dependents: false,
      graph: false,
      sticky: false
    });
    provide("clickActions", () => clickActions.value);
    function clearClickActions() {
      if (!clickActions.value.sticky) {
        for (let key in clickActions.value) {
          clickActions.value[key] = false;
        }
      }
    }
    let priorTime = 0;
    function loop(elapsedTime) {
      const delta = elapsedTime - priorTime;
      if (gameState.canTick && delta >= 500) {
        gameState.tick(delta / 1e4);
        priorTime = elapsedTime;
        deltaDisplay.value = Math.floor(delta);
      }
      window.requestAnimationFrame(loop);
    }
    onMounted(() => {
      console.log("mounted ");
      window.requestAnimationFrame(loop);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        _hoisted_1,
        createBaseVNode("table", _hoisted_2, [
          createBaseVNode("tr", null, [
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[0] || (_cache[0] = ($event) => setMode(_sfc_main$5))
              }, "Game"),
              createBaseVNode("button", {
                onClick: _cache[1] || (_cache[1] = (...args) => unref(gameState).save && unref(gameState).save(...args))
              }, "save"),
              createBaseVNode("button", {
                onClick: _cache[2] || (_cache[2] = (...args) => unref(gameState).load && unref(gameState).load(...args))
              }, "load"),
              createBaseVNode("button", {
                onClick: _cache[3] || (_cache[3] = ($event) => setMode(_sfc_main$4))
              }, "Function Viewer")
            ]),
            createBaseVNode("td", _hoisted_3, [
              _hoisted_4,
              createVNode(_sfc_main$2, {
                label: "Dependencies",
                state: clickActions.value.dependencies,
                "onUpdate:state": _cache[4] || (_cache[4] = ($event) => clickActions.value.dependencies = $event)
              }, null, 8, ["state"]),
              createVNode(_sfc_main$2, {
                label: "Dependents",
                state: clickActions.value.dependents,
                "onUpdate:state": _cache[5] || (_cache[5] = ($event) => clickActions.value.dependents = $event)
              }, null, 8, ["state"]),
              createVNode(_sfc_main$2, {
                label: "Graph",
                state: clickActions.value.graph,
                "onUpdate:state": _cache[6] || (_cache[6] = ($event) => clickActions.value.graph = $event)
              }, null, 8, ["state"]),
              createVNode(_sfc_main$2, {
                label: "Sticky",
                state: clickActions.value.sticky,
                "onUpdate:state": _cache[7] || (_cache[7] = ($event) => clickActions.value.sticky = $event)
              }, null, 8, ["state"])
            ])
          ]),
          createBaseVNode("tr", null, [
            createBaseVNode("td", { onClick: clearClickActions }, [
              (openBlock(), createBlock(KeepAlive, null, [
                (openBlock(), createBlock(resolveDynamicComponent(unref(mode))))
              ], 1024))
            ])
          ]),
          _hoisted_5
        ])
      ], 64);
    };
  }
});

var Mathole_vue_vue_type_style_index_0_scoped_true_lang = "\na[data-v-185c34f8] {\r\n  color: #000000;\n}\nspan.error[data-v-185c34f8] {\r\n  color: #c70404\n}\r\n";

_sfc_main$1.__scopeId = "data-v-185c34f8";

var App_vue_vue_type_style_index_0_lang = "\n#app {\r\n  font-family: Avenir, Helvetica, Arial, sans-serif;\r\n  -webkit-font-smoothing: antialiased;\r\n  -moz-osx-font-smoothing: grayscale;\r\n  text-align: center;\r\n  color: #2c3e50;\r\n  margin-top: 60px;\n}\r\n";

const _sfc_main = {
  setup(__props) {

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
var viewMaps = {};

function addViewMap(containerId, key, value, maps=viewMaps) {
  maps[containerId] ||= {};
  maps[containerId][key]=value;
}

function getView(containerId, key, maps=viewMaps) {
   return maps[containerId][key]; 
}

provide('appAddViewMap', addViewMap);
provide('appGetView', getView);


return (_ctx, _cache) => {
  return (openBlock(), createBlock(_sfc_main$1))
}
}

};

window.global = {};



let app = createApp(_sfc_main);
//app.use(ST.init());
app.mount('#app');
