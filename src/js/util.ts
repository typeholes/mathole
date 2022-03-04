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

