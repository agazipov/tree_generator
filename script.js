let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

//  структура
const buttonChild = document.getElementById("addChild");
const buttonDelete = document.getElementById("delContainer");
const buttonClear = document.getElementById("clear");
// редактирование заголовка
const changeInput = document.getElementById("changeInput");
const changeButton = document.getElementById("changeButton");
// масштаб
const increaseScale = document.getElementById("increaseScale");
const decreaseScale = document.getElementById("decreaseScale");
const spanScale = document.getElementById("spanScale");
// ширина
const increaseWidth = document.getElementById("increaseWidth");
const decreaseWidth = document.getElementById("decreaseWidth");
const spanWidth = document.getElementById("spanWidth");
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

class Container {
    constructor(width, height, y, x, level, id, isActiv, parentId, title) {
        this.width = width;
        this.height = height;
        this.area = 500;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.id = id;
        this.isBranch = false;
        this.isDrag = false;
        this.isActiv = isActiv;
        this.isOpen = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.globalIndex = 0;
        this.title = title;
    }
};

const root = new Container(46, 18, rect.height / 2 - 23, 20, 1, nanoid(), true, 0, 'root');

const containers = [root];
changeInput.value = containers[0].title;
let activContainer = root;
let gitBlob = [];
let gitTree = [];
let factorWidth = 1;

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

// генерация на отрисовку
function motion() {
    containers.forEach((container) => {
        container.x = container.startX * scale;
        container.y = container.startY * scale;
        // версия для старого смещения
        //     container.x = (container.startX + offsetX) * scale;
        //     container.y = (container.startY + offsetY) * scale;
        container.width *= scale;
        container.height *= scale;
    });
    draw();
};

// генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewContainer(parent, title) {
    let width, height, x, y, level, id, isActiv, parentId;

    id = nanoid();
    parent.child.push(id); // добавляем ид дочернего в родителя
    width = 46;
    height = 18;
    x = 75 * parent.level;
    y = 75;
    level = parent.level + 1;
    parentId = parent.id
    isActiv = false;

    return new Container(width, height, y, x, level, id, isActiv, parentId, title);
};

// поиск контейнера по заданным параметрам
function serchParam(param, arr, property) {
    let value;
    arr.find((container) => {
        if (container?.[property] === param) value = container;
    });
    return value;
};

// макс в массиве
function maxNumInArr(arr, width) {
    let value = 0, newWidth = width;
    arr.forEach((element) => {
        if (element > value) {
            value = element;
        };
    });
    if (value > 7) {
        return newWidth = ((value - 7) * 100) + width;
    }
    return newWidth;
};

// считаем детей
function childNumber(arr) {
    let value = 0;
    arr.forEach((element) => {
        if (element.child.length > 3) {
            value = value + element.child.length - 3;
        };
    });
    return value;
};

// сортировка массива
let newHeight = rect.height;
function sortContainers(arr) {
    // реализация компоновки с распределением от количеста детей
    // приоритет компонента в зависимости от кол-ва дейтей
    arr.forEach((container, _index, arr) => {
        container.priority = 1;
        arr.forEach((container2) => {
            if (container.parentId === container2.parentId) {
                if (container.child.length > container2.child.length) {
                    container.priority += 1;
                };
            };
        });
    });
    // сумма приоритетов для конкретного элемента
    arr.forEach((container) => {
        let count = 0;
        if (container.child.length !== 0) {
            container.child.forEach((child, index) => {
                let childContainer = serchParam(child, arr, 'id');
                count += childContainer.priority;
            });
            container.child.forEach((child, index) => {
                let childContainer = serchParam(child, arr, 'id');
                childContainer.areaPriority = count;
            });
        };
    });
    // расчет зоны контейнера в зависимости от его уровня приоритета (за основу берется зона родительского контейнера)
    arr.forEach((container) => {
        let parentContainer = serchParam(container.parentId, arr, 'id');
        if (container.level !== 1) {
            container.area = parentContainer.area / (container.areaPriority) * container.priority;
        }
    });
    // расчет координаты при разных зонах контейнера
    arr.forEach((container) => {
        let count = 0;
        if (container.child.length !== 0) {
            container.child.forEach((child, index) => {
                let childContainer = serchParam(child, arr, 'id');
                count += childContainer.area / 2;
                childContainer.startY = (container.startY - (container.area / 2)) + count;
                count += childContainer.area / 2;
            });
        };
    });
    // при равномерной зоне контейнеров
    arr.forEach((container) => {
        let parentContainer = serchParam(container.parentId, arr, 'id');
        if (container.level === 100) {
            let widthElement = parentContainer.area / parentContainer.child.length;
            container.startY = (parentContainer.startY - (parentContainer.area / 2)) + (widthElement * parentContainer.child.indexOf(container.id)) + (widthElement / 2);
        };
    });

    // старая реализация с равномерным распределением от ширины
    // считаем сколько элементов на уровне
    let map = [];
    newHeight = rect.height + (factorWidth * 150);
    arr.forEach((container) => {
        if (!map[container.level - 1]) {
            map[container.level - 1] = 0;
        };
        if (map[container.level - 1] < map[container.level - 2]) {
            map[container.level - 1] = map[container.level - 2];
        }
        map[container.level - 1] += 1;
    });
    arr.forEach((container, index, arr) => {
        container.globalIndex = index; // для удаления элемента

        if (container.level === 100) {
            // растягивание по ширине уровня
            let parentContainer = serchParam(container.parentId, arr, 'id');

            container.startY =
                ((newHeight / (parentContainer.child.length + 1)) / map[container.level - 2]
                    * (parentContainer.child.indexOf(container.id) + 1))
                + (parentContainer.startY - ((newHeight / map[container.level - 2]) / 2));
        };
    });
};

// добавить ребенка
buttonChild.addEventListener("click", () => {
    // let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер ** получать индексы отдельно
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let obj = createNewContainer(activContainer, 'Name');

    containers.push(obj);
    sortContainers(containers);

    motion();
});

// удаляем контейнер
buttonDelete.addEventListener("click", () => {
    // let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    // пока с потомками не удаляет
    if (activContainer.child.length !== 0) {
        console.log(`У контейнера есть потомки`);
        return;
    };
    if (containers[0].child.length === 0) {
        console.log(`Нельзя удалить рут`);
        return;
    };
    containers.splice(activContainer.globalIndex, 1);

    // зачистка родительского контейнера от удаленного ребенка (находим глобальный индекс родителя)
    let serchParent = serchParam(activContainer.parentId, containers, 'id');
    containers[serchParent.globalIndex].child = containers[serchParent.globalIndex].child.filter((child) => activContainer.id !== child);

    sortContainers(containers);
    motion();
});

// очистка
buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    containers[0].isActiv = true;
    changeInput.value = containers[0].title;
    activContainer = containers[0];
    scale = 1;
    spanScale.innerText = scale;
    offsetX = 0;
    offsetY = 0;
    motion();
});

// редактирование
let inputValue;
changeInput.addEventListener("change", (event) => {
    inputValue = event.target.value;
});
changeButton.addEventListener("click", () => {
    // let activContainer = serchParam(true, containers, 'isActiv');
    containers[activContainer.globalIndex].title = inputValue;
    motion();
});

// масштабирование
// * не меняются координаты при масштабировании
increaseScale.addEventListener("click", () => {
    scale += 0.25;
    spanScale.innerText = scale;
    motion();
});
decreaseScale.addEventListener("click", () => {
    scale -= 0.25;
    spanScale.innerText = scale;
    motion();
});
// изменение ширины
increaseWidth.addEventListener("click", () => {
    factorWidth += 1;
    spanWidth.innerText = factorWidth;
    sortContainers(containers);
    motion();
});
decreaseWidth.addEventListener("click", () => {
    factorWidth -= 1;
    spanWidth.innerText = factorWidth;
    sortContainers(containers);
    motion();
});

// активная кнопка
// поиск ветки
function serchBranch(container) {
    if (!container) {
        containers.forEach((container) => container.isBranch = false);
    } else {
        let parentContainer = serchParam(container.parentId, containers, 'id');
        if (!parentContainer) {
            return;
        };
        parentContainer.isBranch = true;
        serchBranch(parentContainer);
    };
};
// вывод инфы об активном контенере 
function handleActivContainer(object) {
    if (object === null) {
        activContainer = object;
        elementInfo[0].innerHTML = '';
        return;
    };
    activContainer = object;
    const nameArray = ['title', 'id', 'globalIndex', 'branch'] // ** фиксировать изменения из change
    for (let index = 0; index < nameArray.length; index++) {
        if (nameArray[index] === 'branch') {
            const branchName = containers.filter((el) => el.isBranch === true).map(el => el.id).join(', \n');
            const property = document.createElement('li');
            property.textContent = `Branch: \n ${branchName}`;
            elementInfo[0].insertAdjacentElement('beforeend', property);
        } else {
            const property = document.createElement('li');
            property.textContent = `${nameArray[index]}: ` + activContainer[nameArray[index]];
            elementInfo[0].insertAdjacentElement('beforeend', property);
        };
    };
};
handleActivContainer(root);
canvas.addEventListener("click", (event) => {
    const clickX = event.clientX - rect.left - offsetX;
    const clickY = event.clientY - rect.top - offsetY;

    // Проверяем объекты на пересечение с кликом
    handleActivContainer(null);
    serchBranch(null); // ** не выполнять при повторных кликах
    containers.forEach((object) => {
        if (
            clickX >= object.x &&
            clickX <= object.x + object.width &&
            clickY >= object.y &&
            clickY <= object.y + object.height
        ) {
            // Обработка клика на объекте
            object.isActiv ? // при повторном клике
                (object.isActiv = false, changeInput.value = "")
                :
                (object.isActiv = true, changeInput.value = object.title, serchBranch(object), handleActivContainer(object));
            console.log(`activContainer`, object);
        } else {
            object.isActiv = false;
        };
        // кlик по плашке инфо
        // if (
        //     clickX >= object.x + 44 &&
        //     clickX <= object.x + 56 &&
        //     clickY >= object.y - 3 &&
        //     clickY <= object.y + 9
        // ) {
        //     object.isOpen = true;
        // };
        // if (
        //     clickX >= object.x + 74 &&
        //     clickX <= object.x + 86 &&
        //     clickY >= object.y - 3 &&
        //     clickY <= object.y + 9
        // ) {
        //     object.isOpen = false;
        // };
    });
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

                motion();
            };
        });
        gitBlob[dragIndex].x = savePositionX;
        gitBlob[dragIndex].y = savePositionY
        dragIndex = null;
    };
});

// открываем/скрываем панель элементов гита
let openGitPanel = false;
gitPanel.addEventListener('click', () => {
    openGitPanel = !openGitPanel;
    motion();
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
        motion()
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
            motion();
        })
});

// функция рисования
function draw(x, y) {
    ctx.clearRect(0 - offsetX, 0 - offsetY, canvas.width, canvas.height); // Очищаем холст
    (x || y) && ctx.translate(x, y);

    drawGrid();

    containers.forEach(container => {
        // отрисовываем линии
        container.child.forEach((childId) => {
            // поиск дочерних у родителя на нижнем уровне
            const findContainer = containers.find((container) => container.id === childId);
            if (findContainer) {
                ctx.beginPath();
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
function roundedRect({ x, y, isActiv, isBranch, isOpen, child, globalIndex }, width, height) {

    ctx.beginPath(); // Начните новый путь
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
    ctx.fillText(globalIndex, x + 6, y + 12);
    isOpen && ctx.fillText(`Child: ${child.length}`, x + 6, y + 24)
};

// кружок с воскицательным знаком
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
