// генератор ид (https://www.npmjs.com/package/nanoid)
let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

// управление
const buttonChild = document.getElementById("addChild");
const buttonSwithParent = document.getElementById("swithParent");
const buttonDelete = document.getElementById("delContainer");
const buttonClear = document.getElementById("clear");
// редактирование заголовка
const changeInput = document.getElementById("changeInput");
const changeButton = document.getElementById("changeButton");
// масштаб
const increaseScale = document.getElementById("increaseScale");
const decreaseScale = document.getElementById("decreaseScale");
const spanScale = document.getElementById("spanScale");
// файлы
const saveButton = document.getElementById("saveButton");
const file = document.getElementById("file");
// гит
const gitReq = document.getElementById("gitReq");
const urlImput = document.getElementById("urlImput");
const urlSelector = document.getElementById("urlSelector");
const gitPanel = document.getElementById("gitPanel");
// канвас
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const elementInfo = document.getElementsByClassName("elementInfo_text");
const center = document.getElementsByClassName("centralization");

class Container {
    constructor(width, height, y, x, level, id, isActiv, parentId, title) {
        this.width = width;
        this.height = height;
        this.area = 500;
        this.x = x;
        this.y = y;
        this.id = id;
        this.isBranch = false;
        this.isActiv = isActiv;
        this.isOpen = false;
        this.isDisable = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.title = title;
    }
};

const root = new Container(46, 18, rect.height / 2 - 23, 20, 1, nanoid(), true, 'parentID', 'root');

const containers = [root];
changeInput.value = root;
let activContainer = root; // ссылка на активный элемент в массиве
let gitBlob = [];
let gitTree = [];

// переменные масштабирования
let scale = 1;
spanScale.innerText = scale;

// переменные перемещения
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

let dragIndex = null;

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
function sortRecursion(container) {
    if (container.child.length === 0) {
        return;
    };
    // сохраняем количество детей
    const lengthChild = [];
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, containers, 'childFound');
        lengthChild.push(foundChild.child.length);
    });
    const priorityChild = tranformPriority(lengthChild); // конвертируем количество детей в приоритет
    const areaPriority = priorityChild.reduce((acc, element) => acc + element); // сумма приоритетов
    // назначение координат
    let count = 0;
    container.child.forEach((childId, index) => {
        const foundChild = serchParam(childId, containers, 'childFound');
        foundChild.x = 75 * container.level; // изменение х от уровня
        foundChild.area = container.area / areaPriority * priorityChild[index]; // расчет занимаймой контенером зоны
        //  помещаем контенер в середину его зоны (относительно его родителя)
        count += foundChild.area / 2;
        foundChild.y = (container.y - (container.area / 2)) + count; // распределяет относительно оцовского контенера
        count += foundChild.area / 2;
        sortRecursion(foundChild);
    });
};
function tranformPriority(arr) {
    return arr.map((element) => {
        let count = 1;
        arr.forEach((element2) => {
            if (element > element2) {
                count += 1;
            };
        });
        return count;
    });
};

// добавить ребенка
buttonChild.addEventListener("click", () => {
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    const obj = createNewContainer(activContainer, 'Name');
    containers.push(obj);
    sortRecursion(root);
    draw();
    infoPanelFilling();
});

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
    changeInput.value = root;
    scale = 1;
    spanScale.innerText = scale;
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY);
});

// редактирование
let inputValue;
changeInput.addEventListener("change", (event) => {
    inputValue = event.target.value;
});
changeButton.addEventListener("click", () => {
    activContainer.title = inputValue;
    draw();
});

// масштабирование
// * не меняются координаты при масштабировании
increaseScale.addEventListener("click", () => {
    scale += 0.25;
    spanScale.innerText = scale;
    draw();
});
decreaseScale.addEventListener("click", () => {
    scale -= 0.25;
    spanScale.innerText = scale;
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
        elementInfo[0].innerHTML = '';
        return;
    };
    elementInfo[0].innerHTML = '';
    const nameArray = ['id', 'child', 'branch'] // ** фиксировать изменения из change
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
    const clickX = event.clientX - rect.left - offsetX;
    const clickY = event.clientY - rect.top - offsetY;

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
                    (object.isActiv = false, changeInput.value = "")
                    :
                    (changeInput.value = object.title, serchParentIsBranch(object), handleActivContainer(object));
                console.log(`activContainer`, object);
            } else {
                object.isActiv = false;
                changeInput.value = "";
            };
        });
    } else {
        containers.forEach((object) => {
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                if (object.isDisable || object.id === activContainer.id) {
                    console.log(`dont pick`);
                    return;
                } else {
                    serchParentIsBranch(null); // ** дублирование
                    switchParent(object);
                };
            };
        });
    }
    draw();
});

// перемещение
let savePositionX, savePositionY;
canvas.addEventListener('mousedown', (event) => {
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    if (event.button === 0) { // Проверяем нажатие правой кнопки мыши
        isDragging = true;
        startDragX = event.clientX;
        startDragY = event.clientY;
    }

    // перемещаем гитовые элементы
    gitBlob.forEach((element, index) => {
        if (
            clickX >= element.x &&
            clickX <= element.x + 100 &&
            clickY >= element.y &&
            clickY <= element.y + 16
        ) {
            dragIndex = index;
            console.log(dragIndex);
            savePositionX = element.x;
            savePositionY = element.y;
        };
    });
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
    };

    if (dragIndex !== null) {
        gitBlob[dragIndex].x = event.clientX - rect.left - 50;
        gitBlob[dragIndex].y = event.clientY - rect.top - 8;
        draw();
    };
});
canvas.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Проверяем отпускание правой кнопки мыши
        isDragging = false;
    };

    if (dragIndex !== null) {
        containers.forEach((element) => {
            if (
                gitBlob[dragIndex].x + 50 >= element.x &&
                gitBlob[dragIndex].x + 50 <= element.x + 100 &&
                gitBlob[dragIndex].y + 8 >= element.y &&
                gitBlob[dragIndex].y + 8 <= element.y + 16
            ) {
                activContainer = element;
                let obj = createNewContainer(activContainer, gitBlob[dragIndex].name);

                containers.push(obj);
                sortContainers(containers);

                draw();
            };
        });
        gitBlob[dragIndex].x = savePositionX;
        gitBlob[dragIndex].y = savePositionY
        dragIndex = null;
    };
});
//централизация
center[0].addEventListener('click', () => {
    const valueX = -offsetX, valueY = -offsetY;
    offsetX = 0;
    offsetY = 0;
    draw(valueX, valueY);
});

// открываем/скрываем панель элементов гита
let openGitPanel = false;
gitPanel.addEventListener('click', () => {
    openGitPanel = !openGitPanel;
    draw();
});

// ссылка на репу
let urlImputValue;
urlImput.addEventListener('change', (event) => {
    urlImputValue = event.target.value;
})

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
    fetch(`https://api.github.com/repos/${urlImputValue}/git/trees/main?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitTree = data.tree.filter(({ path, type }) => type === 'tree' && !path.includes('/'))
            gitTree.forEach((element) => {
                const newOption = document.createElement('option');
                newOption.textContent = element.path;
                urlSelector.insertAdjacentElement('afterbegin', newOption);
            });
            console.log(gitTree);
        })

});
urlSelector.addEventListener('change', (event) => {
    let shaTree;
    gitTree.forEach(({ path, sha }) => {
        if (path === event.target.value) {
            shaTree = sha;
        }
    });
    fetch(`https://api.github.com/repos/${urlImputValue}/git/trees/${shaTree}?recursive=1`)
        .then((response) => response.json())
        .then((data) => {
            gitBlob = data.tree.filter(({ path, type }) => type === 'blob' && path.includes('.jsx')).map(({ path }, index) => {
                return { name: path.substr(path.lastIndexOf('/') + 1), x: canvas.width - 100, y: index * 15 };
                // return path.includes('/') ? path.substr(path.lastIndexOf('/') + 1) : path;
            });
            console.log(gitBlob);
            draw();
        })
});

// функция рисования
function draw(x, y) {
    ctx.clearRect(0 - offsetX, 0 - offsetY, canvas.width, canvas.height); // Очищаем холст
    (x || y) && ctx.translate(x, y);
    drawGrid(); // сетка

    containers.forEach(container => { // ** багуля с отрисовкой при смене родителя
        // отрисовываем линии
        container.child.forEach((childId) => {
            // поиск дочерних у родителя на нижнем уровне
            const findContainer = containers.find((container) => container.id === childId);
            if (findContainer) {
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.shadowColor = 'rgba(0, 0, 0, 0)';
                ctx.shadowBlur = 0;
                ctx.moveTo(container.x + 23, container.y + 9);
                ctx.lineTo(findContainer.x + 23, findContainer.y + 9);
                (findContainer.isBranch || findContainer.isActiv) ? ctx.strokeStyle = 'green' : ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        });

        // отрисовываем контейнеры
        if (container.isOpen) {
            roundedRect(container, container.width + 30, container.height + 30);
            // infoRect(container.x + 80, container.y + 3, 6, true);
        } else {
            roundedRect(container, container.width, container.height, 5);
            // infoRect(container.x + 50, container.y + 3, 6);
        };
    });

    openGitPanel && gitBlob.forEach(({ name, x, y }) => {
        ctx.beginPath();
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.fillStyle = "black";
        ctx.fillRect(x - 2, y + 2, 104, 16);
        ctx.clearRect(x, y + 4, 100, 14);
        ctx.fillStyle = "#ADADAD";
        ctx.fillRect(x, y + 4, 100, 14);
        ctx.fill();
        ctx.font = "bold 12px arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "start";
        ctx.fillText(name, x + 10, y + 15);
        ctx.closePath();
    });
};

// контейнер
function roundedRect({ x, y, isActiv, isBranch, isOpen, child, id, isDisable }, width, height) {

    ctx.beginPath(); // Начните новый путь
    // тени исчезают в полдень
    if (isSwitch && !isDisable) {
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
    ctx.moveTo(x, y); // Начало пути в верхнем левом углу прямоугольника
    ctx.lineTo(x + width, y); // Рисуем линию от левого верхнего угла до правого верхнего угла
    ctx.lineTo(x + width, y + height); // Рисуем линию в правый нижний угол
    ctx.lineTo(x, y + height); // Рисуем линию в нижний левый угол
    ctx.lineTo(x, y); // Рисуем линию в левый верхний угол
    ctx.stroke(); // Закончите путь
    // ctx.fillRect(x, y, width, height);

    // прозрачность при дизейдле
    if (isDisable) {
        ctx.globalAlpha = 0.3;
    } else {
        ctx.globalAlpha = 1;
    };

    // Заполните прямоугольник с заданным цветом
    if (isActiv) {
        ctx.fillStyle = "red";
    } else if (isBranch) {
        ctx.fillStyle = "green";
    } else {
        ctx.fillStyle = 'white';
    };
    ctx.fill();
    // текст в контейнере перенести в функцию
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    // ctx.fillText(title, x + 6, y + 12);
    ctx.fillText(id, x + 6, y + 12);
    isOpen && ctx.fillText(`Child: ${child.length}`, x + 6, y + 24)
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
    for (let x = 0 - offsetX; x <= canvas.width - offsetX; x += gridSize) {
        ctx.moveTo(x, 0 - offsetY);
        ctx.lineTo(x, canvas.height - offsetY);
        ctx.stroke();
    };

    // рисуем горизонтальные линии
    for (let y = 0 - offsetY; y <= canvas.height - offsetY; y += gridSize) {
        ctx.moveTo(0 - offsetX, y);
        ctx.lineTo(canvas.width - offsetX, y);
        ctx.stroke();
    };
};

draw();
