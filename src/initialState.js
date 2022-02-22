import * as GameVar from './js/GameVar'

import * as FunctionDef from './js/FunctionDef';

const timeGameVar = GameVar.newGameVar('t', 'Time', 0, false, true, 'id', [], 'id', [])
const scoreGameVar = GameVar.newGameVar('score', 'Score', 0, false, false, 'id', [], 'id', [])
const smootherGameVar = GameVar.newGameVar('smoother', 'Market Stability', .001, true, true, 'id', [], 'times', [.001])
const marketValueGameVar = GameVar.newGameVar('marketValue', 'Market Value', 0, false, true, 'id', [], 'calcMarketValue', [])

export const initialState = {
    varMap: {
        t: timeGameVar,
        score: scoreGameVar,
        smoother: smootherGameVar,
        marketValue: marketValueGameVar,
    },
    functionDefMap: { 
        // we don't need to explicitly create builtin functions but here is how we could
        // sin: FunctionDef.newFunctionDef('sin', true, ['a'],''),
        // ...FunctionDef.fromBuiltin('acos'),  
        id: FunctionDef.newFunctionDef('id', false, ['x'], ['x'], 'x'),
        times: FunctionDef.newFunctionDef('times', false, ['x','b'], ['x','3'], 'x*b'),
        zigZag: FunctionDef.newFunctionDef('zigZag', false, ['x'], ['x'], '1-2 * acos((1- smoother) * sin(2 * pi * x))/pi'),
        squareWave: FunctionDef.newFunctionDef('squareWave', false, ['x'], ['x'], '2 * atan( sin(2 * pi * x)/ smoother )/pi'),
        sawtooth: FunctionDef.newFunctionDef('sawtooth', false, ['x'], ['x'], '(1+zigZag((2 * x - 1)/4) * squareWave(x/2))/2'),
        steps: FunctionDef.newFunctionDef('steps', false, ['x'], ['x'], 'x - sawtooth(x)'),
        logSquares: FunctionDef.newFunctionDef('logSquares', false, ['x','b'], ['x',2], 'log(x^2+b^2)'),  // need a better name for this
        curvedSawtooth: FunctionDef.newFunctionDef('curvedSawtooth', false, ['x'], ['x'], 'logSquares(x^smoother,sawtooth(x))'),
        calcMarketValue: FunctionDef.newFunctionDef('calcMarketValue', false, ['x'], ['x'], 'curvedSawtooth(t)'),
    },
}