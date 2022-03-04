import { parseDependencies } from "mathjs";

export function removeValuefromArray<T>(arr: T[], value: T) : void {
    const idx = arr.indexOf(value);
    if (idx === -1) { return; }       
    arr.splice(idx,1);
}

export function *zip (...iterables){
    let iterators = iterables.map(i => i[Symbol.iterator]() )
    while (true) {
        let results = iterators.map(iter => iter.next() )
        if (results.some(res => res.done) ) return
        else yield results.map(res => res.value )
    }
}


export function unique(arr: any[]) : any[] {
    const check = (value, index, self) => self.indexOf(value) === index;
    return arr.filter(check);
}

export function formatNumber(n: number, pad: number = 8) {
   if (typeof n !== 'number') { return n; }
   const fixed = n > 1000 ? n.toExponential(2) : n.toFixed(2);
   const str = fixed.toString().replace('+','');
   return str.padStart(pad,"\u2000");
//   const pad = Math.max(10 - str.length,0)
//   return fixed + '&nbsp'.repeat(pad);

}