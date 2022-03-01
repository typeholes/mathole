const StorageKey = 'matholeSaves';

export class SaveManager<T> {

    constructor( uiStateGetter: () => T ) {
        this.uiStateGetter = uiStateGetter;
        
        const saveStr = window.localStorage.getItem(StorageKey);
        if ( saveStr) { 
            this.parseSaveStr(saveStr);
        } else {
            this.save('default');
        }
    }

    private saves : {[any: string]: T} = {};
    private uiStateGetter : () => T;

    save(saveName: string) {
        this.buildNewSave(saveName);
        this.writeSaves();
    }

    load(saveName: string) : T {
        return this.saves[saveName];
    }

    private readSave(saveName: string) : boolean {
        return false;
    }

    private parseSaveStr(str: string) : void {
        this.saves = JSON.parse(str);
    }

    private writeSaves() : void {
        const saveStr = JSON.stringify(this.saves);
        window.localStorage.setItem(StorageKey, saveStr);
    }

    private buildNewSave(name: string) : void {
        this.saves[name] =this.uiStateGetter();
    }

}