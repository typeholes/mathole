export function makeViewMap(inject, provide, id, handleSelection, selectedRef, ...entries) {

const appGetView = inject('appGetView');
const appAddViewMap = inject('appAddViewMap');

entries.forEach(entry => {
const [key, value] = entry;
appAddViewMap(id, key, value);
});

function getView(componentId) { 
    const view = appGetView(id, componentId); 
    return view;
}

provide('handleSelection', handleSelection);
provide('viewMapKey', id);
provide('getView', getView);
provide('isSelected', (item,selected)=> {
    if ( (item.varName && item.varName === selectedRef.value.varName ) || (item.op && item.op === selectedRef.value.op)) {
        return "selected";
    } else {
        return "";
    }
});

return getView;

}
