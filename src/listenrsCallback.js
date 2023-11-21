import { draw } from "./draw.js";
import { Container, GlobalState } from "./сlass.js";
import {
    sortRecursion,
    serchChilds,
    delBranch,
    clearParentContainerForChild,
    serchParentIsBranch,
    disableContainer,
    handleActivContainer,
    infoPanelFilling,
    switchParent
} from "./arrayFunction.js"
import { nanoid } from "./nanoid.js";
import { sub } from "./subscription.js";

// добавить ребенка
export function addChild(event, arr, sub, state) {
    if (!state.activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let check = event.target.id === 'addChild' ? 'Name' : event.target.innerText;
    const obj = state.initialContainer.createNewContainer(state.activContainer, check, nanoid);
    arr.push(obj);
    sortRecursion(arr[0], arr);
    draw(null, state, sub, arr);
    infoPanelFilling(arr, sub, state.activContainer);
}