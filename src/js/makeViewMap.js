export function makeViewMap(inject, provide, id, handleSelection, ...entries) {

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

}
