import { UiState, UiVar, UiMilestone } from "../components/uiUtil";
import { FunctionDefManager } from "./FunctionDef";
import { GameMilestoneManager } from "./GameMilestoneManager";
import { GameVarManager} from "./GameVarManager";

export function gameSetup ( vars: GameVarManager<UiState, UiVar, UiMilestone>, functions: typeof FunctionDefManager, milestones: GameMilestoneManager<UiMilestone, UiVar>) {


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

vars.newPlain({ name: 'money', displayName: '$', visible: false, value: 1, extra: {} });

vars.newBuyable(
    { name: 'stability', displayName: 'Market Stability', visible: true, 
      fn: times, args: {'x': 1.25, b: 'stability+2/1.25'}, 
      currency: 'money', sellable: false, extra: {} 
});

vars.newBuyable({ 
    name: 'marketScale', displayName: 'Market Scale', visible: true, 
    fn: times, args: {'x': 2, b: 'marketScale+1'}, 
    currency: 'stability', sellable: false, extra: {} 
});

vars.newCalculation({ 
    name: 'smoother', displayName: 'Smoother', visible: false, 
    fn: times, args: {x: 'stability', b: 0.01}, extra: {} 
});

vars.newCalculation({
    name: 'marketValue', displayName: 'Market Value', visible: true, 
    fn: calcMarketValue, args: {x: 't'}, extra: {}
});


vars.newBuyable({
    name: 'shares', displayName: 'Shares', visible: true, 
    fn: id, args: {x: 'marketValue'}, 
    currency: 'money', sellable: true, extra: {}
});

vars.newBuyable({
    name: 'premiumJanky', displayName: 'Premium', visible: true,
    fn: id, args: {x: '100'},
    currency: 'money', sellable: false, extra: {janky: true}
})

vars.newToggle({
    name: 'reallyFree', displayName: "Yes I'm sure", visible: true, reversible: false, extra: {janky: true}, gameAction: { setUiFields: { loggedIn: {visible: true}, reallyFree: {visible: false} } }
})

vars.newToggle({
    name: 'freeAccount', displayName: 'Switch to a free account now', visible: true, reversible: false, extra: {janky: true}
})

vars.newToggle({
    name: 'loggedIn', displayName: 'Log In', visible: false, reversible: false, extra: {janky: true, visible: false}
})


//vars.newCalculation( 'dummy', 'dummy', true, id, {x:'2^(t*10)'});
//vars.newBuyable( 'sdummy', 'Dummy', true, id, {x: 'dummy'}, 'money', true);

milestones.create('startStory', 'Went Bankrupt', 't > 0', true, "You start the game from scratch"
    , {storyPoint: "You went bankrupt. All you have left is your library card and a dollar's worth of coins you found in the gutter. Time to head to the library, grab a computer, and login to jankyMarketTrader.com"
        + "\n\n Warning: this is just a preview release so there will likely be bugs"
        + "\n There is no auto save. Use the save and load buttons"
        + "\n It is possible to price yourself out of the market until you reach the \"Too Stable?\" milestone"
        + "\n this is intended to force some strategic play while the cost of having to restart is low"
    }, {}
);

milestones.create('tooStable', 'Too Stable?', 'stability > 3', true, 'Can sell Market Stability'
    , { setSellable: {stability: true}
      , storyPoint: "It is harder to make money in stable markets. Maybe you should trade some of that stability to increase the scale of the market."
    }, {}
    
);

milestones.create('scaled', 'Insider Trading', 'marketScale >= 1', true, 'Better price when selling shares '
    , {adjustFunctions: {shares: {sellCost: ' 1.1 * <&>'}}}, {}
);

}
