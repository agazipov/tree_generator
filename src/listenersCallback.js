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
    switchParent,
    createTreeFromGit
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

// удаление контейнера
export function delContainer(arr, sub, state) {
    if (!state.activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    if (arr[0].child.length === 0) {
        console.log(`Нельзя удалить рут`);
        return;
    };
    delBranch(state.activContainer, arr);
    clearParentContainerForChild(state.activContainer, arr);
    state.activContainer = handleActivContainer(null, arr, sub, state.activContainer);
    serchParentIsBranch(null, arr);
    sortRecursion(arr[0], arr);
    draw(null, state, sub, arr);
    infoPanelFilling(arr, sub, null);
}

// очистка
export function clearCanvas(arr, sub, state) {
    arr.length = 1;
    arr[0].child.length = 0;
    state.activContainer = handleActivContainer(arr[0], arr, sub);
    infoPanelFilling(arr, sub, arr[0])
    sub.titleInput.value = arr[0];
    state.scale = 1;
    sub.spanScale.innerText = state.scale;
    const valueX = -state.offsetX, valueY = -state.offsetY;
    state.offsetX = 0;
    state.offsetY = 0;
    draw({ translateX: valueX, translateY: valueY }, state, sub, arr);
}

// масштабирование
export function scaleCanvas(increase, arr, sub, state) {
    const ctx = sub.ctx();
    const rect = sub.rect();
    if (increase) {
        state.scale = 2;
        state.scaleModify = 1;
        sub.spanScale.innerText = state.scaleModify;
        sub.increaseScaleButton.disabled = true;
        sub.decreaseScaleButton.disabled = false
        arr[0].y = rect.height / 2 - 9;
    } else {
        state.scale = 0.5;
        state.scaleModify = 2;
        sub.spanScale.innerText = state.scale;
        sub.increaseScaleButton.disabled = false;
        sub.decreaseScaleButton.disabled = true;
        arr[0].y = rect.height - 9;
    }
    ctx.scale(state.scale, state.scale);
    sortRecursion(arr[0], arr);
    draw(null, state, sub, arr);
}

// свич
export function switchActivation(arr, sub, state) {
    state.isSwitch = !state.isSwitch;
    if (state.isSwitch) {
        sub.buttonSwithParent.textContent = 'Select Parent';
        serchChilds(state.activContainer, disableContainer, arr);
    } else {
        sub.buttonSwithParent.textContent = 'Switch Parent';
        arr.forEach((container) => {
            container.isDisable = false;
        });
    };
    draw(null, state, sub, arr);
}

// клик по холсту
export function canvasClick(event, arr, sub, state) {
    const rect = sub.rect();
    const clickX = (event.clientX - rect.left) * state.scaleModify - state.offsetX;
    const clickY = (event.clientY - rect.top) * state.scaleModify - state.offsetY;
    // Проверяем объекты на пересечение с кликом
    if (!state.isSwitch) {
        serchParentIsBranch(null, arr);
        state.activContainer = handleActivContainer(null, arr, sub, state.activContainer);
        infoPanelFilling(arr, sub, null);
        arr.forEach((object) => {
            // Обработка клика на объекте
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                object.isActiv ? // при повторном клике
                    (
                        object.isActiv = false,
                        sub.titleInput.value = '',
                        sub.accordionTextArea.value = '',
                        state.activContainer = null
                    )
                    :
                    (
                        sub.titleInput.value = object.title,
                        sub.accordionTextArea.value = object.description,
                        serchParentIsBranch(object, arr),
                        state.activContainer = handleActivContainer(object, arr, sub, state.activContainer),
                        infoPanelFilling(arr, sub, state.activContainer)
                    );
                console.log(`activContainer`, state.activContainer);
            } else {
                object.isActiv = false;
            }
        })
    } else {
        arr.forEach((object) => {
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                if (object.isDisable || object.id === activContainer.id || object.id === activContainer.parentId) {
                    console.log(`dont pick`);
                    return;
                } else {
                    serchParentIsBranch(null, arr); // ** дублирование
                    switchParent(object, arr, sub, root, state.activContainer, state.isSwitch);
                }
            }
        })
    }
    draw(null, state, sub, arr);
}

// запрос репозитория
const gitBlob = [];
const gitTree = [];
export function getRepoDirectory(sub) {
    fetch(`https://api.github.com/repos/${sub.urlImputUser.value}/${sub.urlImputProject.value}/git/trees/main?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitTree = data.tree.filter(({ path, type }) => type === 'tree' && !path.includes('/'));
            gitTree.forEach((element) => {
                const newOption = document.createElement('option');
                newOption.textContent = element.path;
                sub.urlSelector.insertAdjacentElement('afterbegin', newOption);
            });
        })
}
 
export function getRepoFiles(event, arr, sub, state, id) {
    let shaTree;
    gitTree.forEach(({ path, sha }) => {
        if (path === event.target.value) {
            shaTree = sha;
        }
    })
    fetch(`https://api.github.com/repos/${sub.urlImputUser.value}/${sub.urlImputProject.value}/git/trees/${shaTree}?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitBlob = data.tree.filter(({ path, type }) => type === 'blob' && path.includes('.jsx')).map(({ path }, index) => {
                const newElement = document.createElement('div');
                newElement.textContent = path.substr(path.lastIndexOf('/') + 1).replace('.jsx', '');
                newElement.className = 'gitElement';
                sub.gitElements.insertAdjacentElement('beforeEnd', newElement);
            });
            createTreeFromGit(data.tree, arr, state.initialContainer.createNewContainer, id);
            draw(null, state, sub, arr);
        })
}

// сохранение загрузка
export function saveProject(arr) {
    let blob = new Blob([JSON.stringify(arr)], { type: "application/json" });
    saveAs(blob, "object.json");
}
export function loadProject(event, arr, sub, state) {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
        const contents = e.target.result;
        const parsedData = JSON.parse(contents);

        arr.length = 0;
        arr.push(...parsedData);
        draw(null, state, sub, arr)
    };

    reader.readAsText(file);
}