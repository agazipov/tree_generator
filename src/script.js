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
import { addChild } from "./listenrsCallback.js";

sub.urlImputUser.value = 'agazipov'; // **
sub.urlImputProject.value = 'react-2023-05-25'; // **

const ctx = sub.ctx();
const rect = sub.rect();

const initialContainer = new Container(1, '', 'initial', 'initial');
const root = initialContainer.createRoot(rect.height, nanoid)
const state = new GlobalState(root, initialContainer);

const containers = [root];
sub.titleInput.value = root.title;
sub.accordionTextArea.value = root.description;
let activContainer = root; // ссылка на активный элемент в массиве
let gitBlob = [];
let gitTree = [];

// переменные масштабирования
let scale = 1;
let scaleModify = 1;
sub.spanScale.innerText = scale;

// переменные перемещения
let isSwitch = false;
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

// // добавить ребенка
// function addChild(event) {
//     if (!state.activContainer) {
//         console.log(`Нет активного контейнера`);
//         return;
//     };
//     let check = event.target.id === 'addChild' ? 'Name' : event.target.innerText;
//     const obj = initialContainer.createNewContainer(state.activContainer, check, nanoid);
//     containers.push(obj);
//     sortRecursion(root, containers);
//     draw(null, state, sub, containers);
//     infoPanelFilling(containers, sub, state.activContainer);
// }

// обработка клика кнопки add
sub.buttonChild.addEventListener("click", (event) => addChild(event, containers, sub, state));

// удаление контейнера
sub.buttonDelete.addEventListener("click", () => {
    if (!state.activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    if (containers[0].child.length === 0) {
        console.log(`Нельзя удалить рут`);
        return;
    };
    delBranch(state.activContainer, containers);
    clearParentContainerForChild(state.activContainer, containers);
    state.activContainer = handleActivContainer(null, containers, sub, state.activContainer);
    serchParentIsBranch(null, containers);
    sortRecursion(root, containers);
    draw(null, state, sub, containers);
});

// очистка
sub.buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    activContainer = handleActivContainer(root, containers, sub, activContainer);
    sub.titleInput.value = root;
    scale = 1;
    sub.spanScale.innerText = scale;
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw({translateX: valueX, translateY: valueY}, state, sub, containers);
});

// редактирование
sub.titleButton.addEventListener("click", () => {
    activContainer.title = sub.titleInput.value;
    draw(null, state, sub,  containers);
});
sub.accordionTextArea.addEventListener("change", (event) => {
    activContainer.description = event.target.value;
});

// масштабирование ** не работает с перемещением
sub.increaseScale.addEventListener("click", () => {
    // scale = 1.333;
    scale = 2;
    scaleModify = 1;
    sub.spanScale.innerText = scaleModify;
    sub.increaseScale.disabled = true;
    sub.decreaseScale.disabled = false
    root.area = 500;
    root.y = rect.height / 2 - 9;
    ctx.scale(scale, scale);
    sortRecursion(root, containers);
    draw(null, state, sub, containers);
});
sub.decreaseScale.addEventListener("click", () => {
    // scale = 0.75;
    scale = 0.5;
    scaleModify = 2;
    sub.spanScale.innerText = scale;
    sub.increaseScale.disabled = false;
    sub.decreaseScale.disabled = true;
    root.area = 1000;
    root.y = rect.height - 9;
    ctx.scale(scale, scale);
    sortRecursion(root, containers);
    draw(null, state, sub,  containers);
});

// смена родителя (принимает компонент на который перенесли)
// свич

sub.buttonSwithParent.addEventListener("click", () => {
    isSwitch = !isSwitch;
    if (isSwitch) {
        sub.buttonSwithParent.textContent = 'Select Parent';
        serchChilds(activContainer, disableContainer, containers);
    } else {
        sub.buttonSwithParent.textContent = 'Switch Parent';
        containers.forEach((container) => {
            container.isDisable = false;
        });
    };
    draw(null, state, sub,  containers);
});


state.activContainer = handleActivContainer(root, containers, sub, state.activContainer);

sub.canvas.addEventListener("click", (event) => {
    const clickX = (event.clientX - rect.left) * scaleModify - offsetX;
    const clickY = (event.clientY - rect.top) * scaleModify - offsetY;
    // Проверяем объекты на пересечение с кликом
    !isSwitch && (state.activContainer = handleActivContainer(null, containers, sub, state.activContainer)); // если не в режиме смены родителя, обнуляет активный контенер перед кликом
    if (!isSwitch) {
        serchParentIsBranch(null, containers);
        containers.forEach((object, _index, arr) => {
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
                        state.activContainer = handleActivContainer(object, containers, sub, state.activContainer)
                    );
                console.log(`activContainer`, state.activContainer);
            } else {
                object.isActiv = false;
            }
        })
    } else {
        containers.forEach((object) => {
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
                    serchParentIsBranch(null, containers); // ** дублирование
                    switchParent(object, containers, sub, root, activContainer, isSwitch);
                }
            }
        })
    }
    draw(null, state, sub,  containers);
});

// перемещение
sub.canvas.addEventListener('mousedown', (event) => {
    if (event.button === 3) { // Проверяем нажатие правой кнопки мыши
        isDragging = true;
        startDragX = event.clientX;
        startDragY = event.clientY;
    }
});
sub.canvas.addEventListener('mousemove', (event) => {
    const dx = event.clientX - startDragX; // Смещение по оси X
    const dy = event.clientY - startDragY; // Смещение по оси Y
    if (isDragging) {
        startDragX = event.clientX;
        startDragY = event.clientY;
        offsetX += dx;
        offsetY += dy;
        draw({translateX: dx, translateY: dy}, state, sub, containers);
    }
});
sub.canvas.addEventListener('mouseup', (event) => {
    if (event.button === 3) { // Проверяем отпускание правой кнопки мыши
        isDragging = false;
    }
});
//централизация
sub.center[0].addEventListener('click', () => {
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw({translateX: valueX, translateY: valueY}, state, sub,  containers);
});

//репозиторий
sub.gitReq.addEventListener('click', () => {
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

});
sub.urlSelector.addEventListener('change', (event) => {
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
            createTreeFromGit(data.tree, containers, initialContainer.createNewContainer, root);
            draw(null, state, sub,  containers);
        })
});


// сейвинг загрузинг
sub.saveButton.addEventListener('click', function () {
    let objectToSave = containers; // Replace this with your object

    let blob = new Blob([JSON.stringify(objectToSave)], { type: "application/json" });
    saveAs(blob, "object.json");
});
sub.file.addEventListener('change', (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
        const contents = e.target.result;
        const parsedData = JSON.parse(contents);

        containers.push(...parsedData);
        draw(null, state, sub,  containers)
    };

    reader.readAsText(file);
});

//переносим запрос в дерево
export function createTreeFromGit(data, arr, callback, root) {
    let node = {}; // записываем индекс в мейн массиве
    data.forEach((element) => {
        let path = element.path.split('/'); // разбивка пути на массив ['app','api']
        // инициализация (когда родителя нет)
        if (path.length === 1) {
            const obj = callback(root, element.path, nanoid);
            arr.push(obj);
            node[element.path] = { index: arr.length - 1 }; // последний добавленый элемент
            return;
        };

        const obj = callback(
            arr[node[path[path.length - 2]].index],
            path[path.length - 1],
            nanoid
        ); // в парент передаем индекс родителя
        // path[path.length - 2] предпоследний элемент указывает на родителя
        arr.push(obj);
        node[path[path.length - 1]] = { index: arr.length - 1 };
    });
    sortRecursion(root, arr);
};
// обработка события элементов гита
sub.gitElements.addEventListener('click', (event) => addChild(event, containers, sub, state));

draw(null, state, sub, containers);
