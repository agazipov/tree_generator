import { draw } from "./draw.js";
import { Container } from "./сlass.js";
import {
    sortRecursion,
    serchChilds,
    delBranch,
    clearParentContainerForChild,
    serchParentIsBranch,
    changeLevel,
    disableContainer,
    handleActivContainer,
    infoPanelFilling,
    switchParent
} from "./arrayFunction.js"
import { nanoid } from "./nanoid.js";
import { sub } from "./subscription.js";

sub.urlImputUser.value = 'agazipov'; // **
sub.urlImputProject.value = 'react-2023-05-25'; // **

const ctx = sub.ctx();
const rect = sub.rect();

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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
    infoPanelFilling(containers, sub, activContainer);
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
    handleActivContainer(null, containers, sub, activContainer);
    serchParentIsBranch(null, containers);
    sortRecursion(root, containers);
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
});

// очистка
sub.buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    activContainer =  handleActivContainer(root, containers, sub, activContainer);
    sub.titleInput.value = root;
    scale = 1;
    sub.spanScale.innerText = scale;
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
});

// редактирование
sub.titleButton.addEventListener("click", () => {
    activContainer.title = sub.titleInput.value;
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
});


activContainer = handleActivContainer(root, containers, sub, activContainer);

sub.canvas.addEventListener("click", (event) => {
    const clickX = (event.clientX - rect.left) * scaleModify - offsetX;
    const clickY = (event.clientY - rect.top) * scaleModify - offsetY;
    // Проверяем объекты на пересечение с кликом
    !isSwitch && handleActivContainer(null, containers, sub, activContainer); // если не в режиме смены родителя, обнуляет активный контенер перед кликом
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
                        activContainer = handleActivContainer(object, containers, sub, activContainer)
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
                    switchParent(object, containers, sub, root, activContainer, isSwitch);
                }
            }
        })
    }
    draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
        draw(dx, dy, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
    draw(valueX, valueY, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
            draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
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
        draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer)
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
sub.gitElements.addEventListener('click', addChild);


draw(null, null, offsetX, offsetY, scaleModify, root, containers, isSwitch, rect, ctx, activContainer);
