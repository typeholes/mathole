export type Action = () => void;
export type TickStep = { actions: Action[], delay: number};

function emptyStep() : TickStep { return { actions: [], delay: 0 }; }

export class TickBuffer {
    private buffer: TickStep[] = [emptyStep()];
    private priorityActions: Action[] = [];
    private delay = 0;
    
    tick() : void {
        const priorities = this.priorityActions;
        this.priorityActions = [];
        priorities.forEach( (a) => a() );
   
        if ( this.delay > 0) {
            this.delay--;
            return;
        }

        if (this.buffer.length < 1) { return; }
        const { actions, delay } = this.buffer.shift();
        this.delay = delay;
        
        actions.forEach( (a) => a() );
    }
    
    // jump the queue for really important things
    asap(...actions: Action[]) : void {
        this.priorityActions.push(...actions);
    }

    schedule(action: Action|Action[], waitAfter: number = 0, minWait = 0) : void {
        const newActions = Array.isArray(action) ?  action : [action];

        if ( this.buffer.length < 1) {
            this.buffer.push( emptyStep());
        }
        const step = this.buffer[this.buffer.length-1];
        
        if ( step.delay < 1 && minWait<1 ) {
            step.actions.push(...newActions);
            step.delay = waitAfter;
        } else {
            if ( step.delay < minWait ) {
                step.delay = minWait;
            } 
            this.buffer.push( {actions: newActions, delay: waitAfter});
        }
    }    
}