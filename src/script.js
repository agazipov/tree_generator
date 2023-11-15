import { draw } from "./draw.js";
import { Container } from "./сlass.js";
import {
    sortRecursion,
    serchChilds,
    serchParam,
    delBranch,
    clearParentContainerForChild,
    serchParentIsBranch
} from "./arrayFunction.js"
import { nanoid } from "./nanoid.js";
import { sub } from "./subscription.js";

// управление
const buttonChild = document.getElementById("addChild");
const buttonSwithParent = document.getElementById("swithParent");
const buttonDelete = document.getElementById("delContainer");
const buttonClear = document.getElementById("clear");
// редактирование заголовка
const titleInput = document.getElementById("titleInput");
const titleButton = document.getElementById("titleButton");
// редактирование описания
const accordionTextArea = document.getElementById("accordionTextArea");
// масштаб
const increaseScale = document.getElementById("increaseScale");
const decreaseScale = document.getElementById("decreaseScale");
const spanScale = document.getElementById("spanScale");
// файлы
const saveButton = document.getElementById("saveButton");
const file = document.getElementById("file");
// обработка запросов
// гит
const urlImputUser = document.getElementById("gitUrlImputUser");
const urlImputProject = document.getElementById("gitUrlImputProject");
sub.urlImputUser.value = 'agazipov'; // **
sub.urlImputProject.value = 'react-2023-05-25'; // **
const gitReq = document.getElementById("gitReq");
const urlSelector = document.getElementById("urlSelector");
const gitElements = document.getElementById("gitElements");
// канвас
const canvas = document.getElementById("myCanvas");
const ctx = sub.ctx();
const rect = sub.rect();
const elementInfo = document.getElementsByClassName("elementInfo_text");
const center = document.getElementsByClassName("centralization");

// const root = new Container(46, 18, rect.height / 2 - 9, 20, 1, nanoid(), true, 'parentID', 'root');
const initialContainer = new Container(1, '', 'initial', 'initial');
const root = initialContainer.createRoot(rect.height, nanoid)

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
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

// изменение уровня и сброс  прозрачности
function changeLevel(parent, child) {
    child.level = parent.level + 1;
    child.isDisable = false;
};
// дизайбл контенера
function disableContainer(_parent, child) {
    child.isDisable = true;
}

// добавить ребенка
function addChild(event) {
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let check = event.target.id === 'addChild' ? 'Name' : event.target.innerText;
    const obj = initialContainer.createNewContainer(activContainer, check, nanoid);
    containers.push(obj);
    sortRecursion(root, containers);
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
    infoPanelFilling();
}
// обработка клика кнопки add
sub.buttonChild.addEventListener("click", addChild);

// удаление контейнера
sub.buttonDelete.addEventListener("click", () => {
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    if (containers[0].child.length === 0) {
        console.log(`Нельзя удалить рут`);
        return;
    };
    delBranch(activContainer, containers);
    clearParentContainerForChild(activContainer, containers);
    handleActivContainer(null);
    serchParentIsBranch(null, containers);
    sortRecursion(root, containers);
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
});

// очистка
sub.buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    handleActivContainer(root);
    sub.titleInput.value = root;
    scale = 1;
    sub.spanScale.innerText = scale;
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
});

// редактирование
sub.titleButton.addEventListener("click", () => {
    activContainer.title = sub.titleInput.value;
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
});

// смена родителя (принимает компонент на который перенесли)
// свич
let isSwitch = false;
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
});
function switchParent(object) {
    clearParentContainerForChild(activContainer, containers); // удаляем инфу о ребенке в родительском контейнере
    activContainer.parentId = object.id; // назначаем выделенному контенеру контенер-родитель
    object.child.push(activContainer.id); // добавляем контейнеру в дети активный контенер
    sub.buttonSwithParent.textContent = 'Switch Parent';
    isSwitch = !isSwitch;   // дизейбл функции кнопки для клика
    serchChilds(object, changeLevel, containers); // меняем уровень у контенера и детей ** засунуть в сортировку
    sortRecursion(root, containers);  // сортировка
    serchParentIsBranch(activContainer, containers); // обнуляем путь у массива
    infoPanelFilling();
};


// назначение активного контейнера
function handleActivContainer(object) {
    if (object?.id === containers[0].id || object === null) {
        sub.buttonSwithParent.disabled = true;
    } else {
        sub.buttonSwithParent.disabled = false;
    };
    activContainer = object;
    if (activContainer) {
        activContainer.isActiv = true;
    };
    infoPanelFilling((object === null));
};
handleActivContainer(root);
// вывод инфы об активном контенере 
function infoPanelFilling(clear = false) {
    if (clear) {
        sub.titleInput.value = '';
        sub.elementInfo[0].innerHTML = '';
        return;
    };
    sub.elementInfo[0].innerHTML = '';
    const nameArray = ['id', 'child', 'branch', `countLeavesArea`] // ** фиксировать изменения из change
    for (let index = 0; index < nameArray.length; index++) {
        switch (nameArray[index]) {
            case 'branch':
                const branchNameParent = containers.filter((el) => el.isBranch === true).map(el => el.id).join(', \n');
                const listParents = document.createElement('li');
                listParents.textContent = `Parents: \n ${branchNameParent}`;
                sub.elementInfo[0].insertAdjacentElement('beforeend', listParents);
                break;
            case 'child':
                const branchName = activContainer.child.join(', \n');
                const lisstChilds = document.createElement('li');
                lisstChilds.textContent = `Childs: \n ${branchName}`;
                sub.elementInfo[0].insertAdjacentElement('beforeend', lisstChilds);
                break;
            default:
                const property = document.createElement('li');
                property.textContent = `${nameArray[index]}: ` + activContainer[nameArray[index]];
                sub.elementInfo[0].insertAdjacentElement('beforeend', property);
                break;
        };
    };
};
sub.canvas.addEventListener("click", (event) => {
    const clickX = (event.clientX - rect.left) * scaleModify - offsetX;
    const clickY = (event.clientY - rect.top) * scaleModify - offsetY;
    // Проверяем объекты на пересечение с кликом
    !isSwitch && handleActivContainer(null); // если не в режиме смены родителя, обнуляет активный контенер перед кликом
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
                        sub.accordionTextArea.value = ''
                    )
                    :
                    (
                        sub.titleInput.value = object.title,
                        sub.accordionTextArea.value = object.description,
                        serchParentIsBranch(object, arr),
                        handleActivContainer(object)
                    );
                console.log(`activContainer`, activContainer);
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
                    switchParent(object);
                }
            }
        })
    }
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
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
        draw(dx, dy, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
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
    draw(valueX, valueY, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
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
            createTreeFromGit(data.tree);
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
        draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer)
    };

    reader.readAsText(file);
});

//переносим запрос в дерево
export function createTreeFromGit(arr) {
    let node = {}; // записываем индекс в мейн массиве
    arr.forEach((element) => {
        let path = element.path.split('/'); // разбивка пути на массив ['app','api']
        // инициализация (когда родителя нет)
        if (path.length === 1) {
            const obj = initialContainer.createNewContainer(root, element.path, nanoid);
            containers.push(obj);
            node[element.path] = { index: containers.length - 1 }; // последний добавленый элемент
            return;
        };

        const obj = initialContainer.createNewContainer(
            containers[node[path[path.length - 2]].index],
            path[path.length - 1],
            nanoid
        ); // в парент передаем индекс родителя
        // path[path.length - 2] предпоследний элемент указывает на родителя
        containers.push(obj);
        node[path[path.length - 1]] = { index: containers.length - 1 };
    });
    sortRecursion(root, containers);
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
};
// обработка события элементов гита
sub.gitElements.addEventListener('click', addChild);


draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, sub.canvas, ctx, activContainer);
