import { FunctionDefManager } from "./FunctionDef";
import { GameVarManager } from "./GameVar";

export function gameSetup<T> ( vars: GameVarManager<T>, functions: typeof FunctionDefManager) {

const id = functions.get('id');

const times = functions.create('times', ['x','b'], 'x*b');
const reciprical = functions.create('reciprical', ['x'], '1/(x+1)');
const zigZag = functions.create('zigZag', ['x'], '1-2 * acos((1- smoother) * sin(2 * pi * x))/pi');
const squareWave = functions.create('squareWave', ['x'], '2 * atan( sin(2 * pi * x)/ smoother )/pi');
const sawtooth = functions.create('sawtooth', ['x'], '(1+zigZag((2 * x - 1)/4) * squareWave(x/2))/2');
const steps = functions.create('steps', ['x'], 'x - sawtooth(x)');
const logSquares = functions.create('logSquares', ['x','b'], 'log(x^2+b^2)');
const curvedSawtooth = functions.create('curvedSawtooth', ['x'], 'logSquares(x^smoother,sawtooth(x))');
const calcMarketValue = functions.create('calcMarketValue', ['x'], 'curvedSawtooth(x)*(marketScale+1)');

vars.newPlain('money', '$', false, 1);
vars.newBuyable( 'stability', 'Market Stability', true, times, {'x': 1.25, b: 'stability+2/1.25'}, 'money', false);
vars.newBuyable( 'marketScale', 'Market Scale', true, times, {'x': 2, b: 'marketScale+1'}, 'stability', false);
vars.newCalculation( 'smoother', 'Smoother', false, times, {x: 'stability', b: 0.01});
vars.newCalculation('marketValue', 'Market Value', true, calcMarketValue, {x: 't'});

vars.newBuyable( 'shares', 'Shares', true, id, {x: 'marketValue'}, 'money', true);

}