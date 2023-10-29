// генератор ид (https://www.npmjs.com/package/nanoid)
let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

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
// гит
const gitReq = document.getElementById("gitReq");
const urlImputUser = document.getElementById("gitUrlImputUser");
const urlImputProject = document.getElementById("gitUrlImputProject");
urlImputUser.value = 'agazipov'; // **
urlImputProject.value = 'react-2023-05-25'; // **
const urlSelector = document.getElementById("urlSelector");
const gitElements = document.getElementById("gitElements");
// канвас
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const elementInfo = document.getElementsByClassName("elementInfo_text");
const center = document.getElementsByClassName("centralization");

// area
const areaPlus = document.getElementById("areaPlus");
const areaMinus = document.getElementById("areaMinus");
areaPlus.addEventListener('click', areaChange);
areaMinus.addEventListener('click', areaChange);

function areaChange(event) {
    if (event.target.id === "areaPlus") {
        root.area += 100;
    }
    if (event.target.id === "areaMinus") {
        root.area -= 100;
    }
    sortRecursion(root);
    draw();
    infoPanelFilling();
}

class Container {
    constructor(width, height, y, x, level, id, isActiv, parentId, title) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.id = id;
        this.isBranch = false;
        this.isActiv = isActiv;
        this.isDisable = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.title = title;
        this.description = 'description';
        this.countLeavesArea = 0; // **
    }
};

const root = new Container(46, 18, rect.height / 2 - 9, 20, 1, nanoid(), true, 'parentID', 'root');

const containers = [root];
titleInput.value = root.title;
accordionTextArea.value = root.description;
let activContainer = root; // ссылка на активный элемент в массиве
let gitBlob = [];
let gitTree = [];

// переменные масштабирования
let scale = 1;
let scaleModify = 1;
spanScale.innerText = scale;

// переменные перемещения
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

// генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewContainer(parent, title) {
    let width, height, x, y, level, id, isActiv, parentId;

    id = nanoid();
    parent.child.push(id); // добавляем ид дочернего в родителя
    width = 46;
    height = 18;
    x = 75;
    y = 75;
    level = parent.level + 1;
    parentId = parent.id
    isActiv = false;

    return new Container(width, height, y, x, level, id, isActiv, parentId, title);
};

// поиск контейнера по заданным параметрам
function serchParam(param, arr, property) {
    if (param === "parentID") {
        return;
    }
    if (!param) {
        console.log(`Не верный параметр поиска ${param} в ${property}`);
        return;
    };
    let value;
    arr.find((container) => {
        if (container?.id === param) value = container;
    });
    return value;
};

// поиск детей 
function serchChilds(container, func) {
    if (container.child.length === 0) {
        return;
    };
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, containers, 'childFound');
        func(container, foundChild);
        serchChilds(foundChild, func);
    });
};
// изменение уровня и сброс  прозрачности
function changeLevel(parent, child) {
    child.level = parent.level + 1;
    child.isDisable = false;
};
// дизайбл контенера
function disableContainer(_parent, child) {
    child.isDisable = true;
}

// сортировка массива
function countingLeavesArea(container) {
    if (container.child.length === 0) {
        container.countLeavesArea = 30;
        return 30;
    };
    container.countLeavesArea = 0;
    // ищем листья
    container.child.forEach((childId, index) => {
        const foundChild = serchParam(childId, containers, 'childFound');
        container.countLeavesArea += countingLeavesArea(foundChild);
    });
    return container.countLeavesArea;
}
function assignmentCoordinates(container) {
    if (container.child.length === 0) {
        return;
    };
    // назначение координат
    let count = 0;
    container.child.forEach((childId, index) => {
        const foundChild = serchParam(childId, containers, 'childFound');
        foundChild.x = 75 * container.level; // изменение х от уровня
        //  помещаем контенер в середину его зоны (относительно его родителя)
        count += foundChild.countLeavesArea / 2;
        foundChild.y = (container.y - (container.countLeavesArea / 2)) + count; // распределяет относительно отцовского контенера
        count += foundChild.countLeavesArea / 2;
        assignmentCoordinates(foundChild);
    });
}
function sortRecursion(container) {
    countingLeavesArea(container);
    assignmentCoordinates(container);
}

// добавить ребенка
function addChild(event) {
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let check = event.target.id === 'addChild' ? 'Name' : event.target.innerText;
    const obj = createNewContainer(activContainer, check);
    containers.push(obj);
    sortRecursion(root);
    draw();
    infoPanelFilling();
}
// обработка клика кнопки add
buttonChild.addEventListener("click", addChild);

// удаляем контейнер
// зачистка родительского контейнера от удаленного ребенка (находим глобальный индекс родителя)
function clearParentContainerForChild() {
    const serchParent = serchParam(activContainer.parentId, containers, 'activDel');
    serchParent.child = serchParent.child.filter((child) => activContainer.id !== child);
};
function delBranch(container) {
    if (container.child.length === 0) {
        const containerIndex = containers.indexOf(container);
        containers.splice(containerIndex, 1);
        return;
    };
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, containers, 'childDel');
        delBranch(foundChild);
    });
    const containerIndex = containers.indexOf(container);
    containers.splice(containerIndex, 1);
};
buttonDelete.addEventListener("click", () => {
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    if (containers[0].child.length === 0) {
        console.log(`Нельзя удалить рут`);
        return;
    };
    delBranch(activContainer);
    clearParentContainerForChild();
    handleActivContainer(null);
    serchParentIsBranch(null);
    sortRecursion(root);
    draw();
});

// очистка
buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    handleActivContainer(root);
    titleInput.value = root;
    scale = 1;
    spanScale.innerText = scale;
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY);
});

// редактирование
titleButton.addEventListener("click", () => {
    activContainer.title = titleInput.value;
    draw();
});
accordionTextArea.addEventListener("change", (event) => {
    activContainer.description = event.target.value;
});

// масштабирование ** не работает с перемещением
increaseScale.addEventListener("click", () => {
    // scale = 1.333;
    scale = 2;
    scaleModify = 1;
    spanScale.innerText = scaleModify;
    increaseScale.disabled = true;
    decreaseScale.disabled = false
    root.area = 500;
    root.y = rect.height / 2 - 9;
    ctx.scale(scale, scale);
    sortRecursion(root);
    draw();
});
decreaseScale.addEventListener("click", () => {
    // scale = 0.75;
    scale = 0.5;
    scaleModify = 2;
    spanScale.innerText = scale;
    increaseScale.disabled = false;
    decreaseScale.disabled = true;
    root.area = 1000;
    root.y = rect.height - 9;
    ctx.scale(scale, scale);
    sortRecursion(root);
    draw();
});

// смена родителя (принимает компонент на который перенесли)
// свич
let isSwitch = false;
buttonSwithParent.addEventListener("click", () => {
    isSwitch = !isSwitch;
    if (isSwitch) {
        buttonSwithParent.textContent = 'Select Parent';
        serchChilds(activContainer, disableContainer);
    } else {
        buttonSwithParent.textContent = 'Switch Parent';
        containers.forEach((container) => {
            container.isDisable = false;
        });
    };
    draw();
});
function switchParent(object) {
    clearParentContainerForChild(); // удаляем инфу о ребенке в родительском контейнере
    activContainer.parentId = object.id; // назначаем выделенному контенеру контенер-родитель
    object.child.push(activContainer.id); // добавляем контейнеру в дети активный контенер
    buttonSwithParent.textContent = 'Switch Parent';
    isSwitch = !isSwitch;   // дизейбл функции кнопки для клика
    serchChilds(object, changeLevel); // меняем уровень у контенера и детей ** засунуть в сортировку
    sortRecursion(root);  // сортировка
    serchParentIsBranch(activContainer); // обнуляем путь у массива
    infoPanelFilling();
};

// активная кнопка
// поиск родителя (окраска пути до компонента)
function serchParentIsBranch(container) {
    if (!container) {
        // клик не в контейнер сбрасывает отображение ветки
        containers.forEach((container) => container.isBranch = false);
        return;
    } else {
        let parentContainer = serchParam(container.parentId, containers, 'parentBranch');
        if (!parentContainer) {
            return;
        };
        parentContainer.isBranch = true;
        serchParentIsBranch(parentContainer);
    };
};
// назначение активного контейнера
function handleActivContainer(object) {
    if (object?.id === containers[0].id || object === null) {
        buttonSwithParent.disabled = true;
    } else {
        buttonSwithParent.disabled = false;
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
        titleInput.value = '';
        elementInfo[0].innerHTML = '';
        return;
    };
    elementInfo[0].innerHTML = '';
    const nameArray = ['id', 'area', 'child', 'branch', `countLeavesArea`] // ** фиксировать изменения из change
    for (let index = 0; index < nameArray.length; index++) {
        switch (nameArray[index]) {
            case 'branch':
                const branchNameParent = containers.filter((el) => el.isBranch === true).map(el => el.id).join(', \n');
                const listParents = document.createElement('li');
                listParents.textContent = `Parents: \n ${branchNameParent}`;
                elementInfo[0].insertAdjacentElement('beforeend', listParents);
                break;
            case 'child':
                const branchName = activContainer.child.join(', \n');
                const lisstChilds = document.createElement('li');
                lisstChilds.textContent = `Childs: \n ${branchName}`;
                elementInfo[0].insertAdjacentElement('beforeend', lisstChilds);
                break;
            default:
                const property = document.createElement('li');
                property.textContent = `${nameArray[index]}: ` + activContainer[nameArray[index]];
                elementInfo[0].insertAdjacentElement('beforeend', property);
                break;
        };
    };
};
canvas.addEventListener("click", (event) => {
    const clickX = (event.clientX - rect.left) * scaleModify - offsetX;
    const clickY = (event.clientY - rect.top) * scaleModify - offsetY;

    // Проверяем объекты на пересечение с кликом
    !isSwitch && handleActivContainer(null); // если не в режиме смены родителя, обнуляет активный контенер перед кликом
    if (!isSwitch) {
        serchParentIsBranch(null);
        containers.forEach((object) => {
            // Обработка клика на объекте
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                object.isActiv ? // при повторном клике
                    (object.isActiv = false, titleInput.value = '', accordionTextArea.value = '')
                    :
                    (titleInput.value = object.title, accordionTextArea.value = object.description, serchParentIsBranch(object), handleActivContainer(object));
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
                    serchParentIsBranch(null); // ** дублирование
                    switchParent(object);
                }
            }
        })
    }
    draw();
});

// перемещение
let savePositionX, savePositionY;
canvas.addEventListener('mousedown', (event) => {
    if (event.button === 3) { // Проверяем нажатие правой кнопки мыши
        isDragging = true;
        startDragX = event.clientX;
        startDragY = event.clientY;
    }
});
canvas.addEventListener('mousemove', (event) => {
    const dx = event.clientX - startDragX; // Смещение по оси X
    const dy = event.clientY - startDragY; // Смещение по оси Y
    if (isDragging) {
        startDragX = event.clientX;
        startDragY = event.clientY;
        offsetX += dx;
        offsetY += dy;
        draw(dx, dy);
    }
});
canvas.addEventListener('mouseup', (event) => {
    if (event.button === 3) { // Проверяем отпускание правой кнопки мыши
        isDragging = false;
    }
});
//централизация
center[0].addEventListener('click', () => {
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY);
});


// сейвинг загрузинг
saveButton.addEventListener('click', function () {
    let objectToSave = containers; // Replace this with your object

    let blob = new Blob([JSON.stringify(objectToSave)], { type: "application/json" });
    saveAs(blob, "object.json");
});
file.addEventListener('change', (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
        const contents = e.target.result;
        const parsedData = JSON.parse(contents);

        containers.push(...parsedData);
        draw()
    };

    reader.readAsText(file);
});

// запросинг
gitReq.addEventListener('click', () => {
    fetch(`https://api.github.com/repos/${urlImputUser.value}/${urlImputProject.value}/git/trees/main?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitTree = data.tree.filter(({ path, type }) => type === 'tree' && !path.includes('/'));
            gitTree.forEach((element) => {
                const newOption = document.createElement('option');
                newOption.textContent = element.path;
                urlSelector.insertAdjacentElement('afterbegin', newOption);
            });
        })

});
urlSelector.addEventListener('change', (event) => {
    let shaTree;
    gitTree.forEach(({ path, sha }) => {
        if (path === event.target.value) {
            shaTree = sha;
        }
    })
    fetch(`https://api.github.com/repos/${urlImputUser.value}/${urlImputProject.value}/git/trees/${shaTree}?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitBlob = data.tree.filter(({ path, type }) => type === 'blob' && path.includes('.jsx')).map(({ path }, index) => {
                const newElement = document.createElement('div');
                newElement.textContent = path.substr(path.lastIndexOf('/') + 1).replace('.jsx', '');
                newElement.className = 'gitElement';
                gitElements.insertAdjacentElement('beforeEnd', newElement);
            });
            createTreeFromGit(data.tree);
        })
});
//переносим запрос в дерево
function createTreeFromGit(arr) {
    let node = {}; // записываем индекс в мейн массиве
    arr.forEach((element) => {
        let path = element.path.split('/'); // разбивка пути на массив ['app','api']
        // инициализация (когда родителя нет)
        if (path.length === 1) {
            const obj = createNewContainer(root, element.path);
            containers.push(obj);
            node[element.path] = { index: containers.length - 1 }; // последний добавленый элемент
            return;
        };

        const obj = createNewContainer(containers[node[path[path.length - 2]].index], path[path.length - 1]); // в парент передаем индекс родителя
        // path[path.length - 2] предпоследний элемент указывает на родителя
        containers.push(obj);
        node[path[path.length - 1]] = { index: containers.length - 1 };
    });
    sortRecursion(root);
    draw();
};
// обработка события элементов гита
gitElements.addEventListener('click', addChild);

// функция рисования
function draw(x, y) {
    ctx.clearRect(0 - offsetX, 0 - offsetY, canvas.width * scaleModify, canvas.height * scaleModify); // Очищаем холст
    (x || y) && ctx.translate(x, y);
    drawGrid(); // сетка

    // отрисовываем линии
    serchChilds(root, drawLine);

    containers.forEach(container => {
        // отрисовываем контейнеры
        roundedRect(container);
    });
};

// рисовальня линий
function drawLine(container, foundChild) {
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.shadowBlur = 0;
    ctx.moveTo(container.x + 23, container.y + 9);
    ctx.lineTo(foundChild.x + 23, foundChild.y + 9);
    (foundChild.isBranch || foundChild.isActiv) ? ctx.strokeStyle = 'green' : ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
};

// отрисовка контейнера
function roundedRect({ ...param }) {

    ctx.beginPath(); // Начните новый путь
    // отображение теней при свиче (*лаконичней)
    if (
        (isSwitch && !param.isDisable) &&
        (isSwitch && param.id !== activContainer.id) &&
        (isSwitch && param.id !== activContainer.parentId)
    ) {
        ctx.shadowColor = '#0a58ca';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
    };
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.moveTo(param.x, param.y); // Начало пути в верхнем левом углу прямоугольника
    ctx.lineTo(param.x + param.width, param.y); // Рисуем линию от левого верхнего угла до правого верхнего угла
    ctx.lineTo(param.x + param.width, param.y + param.height); // Рисуем линию в правый нижний угол
    ctx.lineTo(param.x, param.y + param.height); // Рисуем линию в нижний левый угол
    ctx.lineTo(param.x, param.y); // Рисуем линию в левый верхний угол
    ctx.stroke(); // Закончите путь
    // ctx.fillRect(x, y, width, height);

    // прозрачность при дизейдле
    if (param.isDisable) {
        ctx.globalAlpha = 0.3;
    } else {
        ctx.globalAlpha = 1;
    };

    // Заполните прямоугольник с заданным цветом
    if (param.isActiv) {
        ctx.fillStyle = "red";
    } else if (param.isBranch) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = 'white';
    };
    ctx.fill();
    // текст в контейнере перенести в функцию
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    ctx.fillText(param.title, param.x + 6, param.y + 12);
    // ctx.fillText(id.substr(0, 6), x + 6, y + 12);
};

// инфо
function infoRect(x, y, radius, open = false) {

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI); // рисует круг
    ctx.fillStyle = "yellow"; // устанавливает цвет для заполнения
    ctx.fill(); // заполняет круг указанным цветом

    // Рисует восклицательный знак
    ctx.font = "12px Arial"; // устанавливает шрифт и размер текста
    ctx.fillStyle = "black"; // устанавливает цвет для заполнения текста
    ctx.textAlign = "center"; // выравнивание текста по центру
    ctx.fillText(open ? "X" : "!", x, y + 5); // рисует текст в указанных координатах
    ctx.closePath();
};

// сеточка
const gridSize = 100; // размер ячейки сетки
function drawGrid() {
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';

    // рисуем вертикальные линии
    for (let x = 0 - offsetX; x <= (canvas.width * scaleModify) - offsetX; x += gridSize) {
        ctx.moveTo(x, 0 - offsetY);
        ctx.lineTo(x, (canvas.height * scaleModify) - offsetY);
        ctx.stroke();
    };

    // рисуем горизонтальные линии
    for (let y = 0 - offsetY; y <= (canvas.height * scaleModify) - offsetY; y += gridSize) {
        ctx.moveTo(0 - offsetX, y);
        ctx.lineTo((canvas.width * scaleModify) - offsetX, y);
        ctx.stroke();
    };
};

draw();
