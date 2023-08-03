let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonDelete = document.getElementById("delContainer");
const buttonClear = document.getElementById("clear");
const changeInput = document.getElementById("changeInput");
const changeButton = document.getElementById("changeButton");
const increaseScale = document.getElementById("increaseScale");
const decreaseScale = document.getElementById("decreaseScale");
const spanScale = document.getElementById("spanScale");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Container {
    constructor(width, height, x, y, level, id, isActiv, parentId, parentIndex) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.id = id;
        this.isDrag = false;
        this.isActiv = isActiv;
        this.isOpen = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.localIndex = 0;
        this.globalIndex = 0;
        this.parentIndex = parentIndex;
        this.title = "Name";
    }
};

const root = new Container(46, 18, rect.width / 2, 20, 1, nanoid(), true, null, 0);

const containers = [root];
let mask = containers.map((container) => ({ ...container }));
changeInput.value = containers[0].title;
let activContainer = root;

// переменные масштабирования
let scale = 1;
spanScale.innerText = scale;

// переменные перемещения
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

// генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewContainer(parent) {
    let width, height, x, y, level, id, isActiv, parentId, parentIndex;

    id = nanoid();
    parent.child.push(id); // добавляем ид дочернего в родителя
    width = 46;
    height = 18;
    x = 75;
    y = 75 * parent.level;
    level = parent.level + 1;
    parentId = parent.id
    parentIndex = parent.localIndex;
    isActiv = false;

    return new Container(width, height, x, y, level, id, isActiv, parentId, parentIndex);
};

// поиск контейнера по заданным параметрам
function serchParam(param, arr, property) {
    let value;
    arr.find((container) => {
        if (container?.[property] === param) value = container;
    });
    return value;
};

// сортировка массива
function sortContainers(arr, activ) {
    // считаем сколько элементов на уровне
    let levelQuantity = 0;
    let parentLevelQuantity = 0;
    arr.forEach((container) => {
        if (container.level === activ.level + 1) {
            levelQuantity += 1;
        }
        if (container.level === activ.level) {
            parentLevelQuantity += 1;
        }
    });
    // возможна ошибка в выборе ширины как дефолта (надо обращатся к род контенеру)
    let numLvl = (rect.width / parentLevelQuantity); // значение выделенное под один элемент в зависимости от кол-ва родителей

    // сортировка контейнеров на своем уровне по родительскому индексу
    arr.sort((a, b) => {
        if (a.parentIndex > b.parentIndex) { return 1; }
        if (a.parentIndex < b.parentIndex) { return -1; }
        return 0;
    });

    // переназначение индекса контейнера
    let count = 0;
    arr.forEach((container, index) => {
        container.globalIndex = index; // для удаления элемента
        if (container.level === activ.level + 1) {
            container.localIndex = count;
            count += 1;
            // container.x = ((rect.width / (levelQuantity + 1)) * (container.localIndex)); // растягивание по ширене уровня

            console.log("тест параметров",
                numLvl / serchParam(container.parentId, arr, 'id').child.length
            );

            container.x = (numLvl / serchParam(container.parentId, arr, 'id').child.length *
                serchParam(container.parentId, arr, 'id').child.indexOf(container.id))
                + container.parentIndex * numLvl + 30; // растягивание по ширене уровня
        }
    });

    // отдельный цикл так как если добавлять элемент с индексом в середину то не обновится последний элемент
    arr.forEach((container) => {
        let serchParentId = serchParam(container.parentId, arr, 'id');
        container.parentIndex = serchParentId ? serchParentId.localIndex : 0; // проверка актуального родительского индекса
    });
};

// добавить ребенка
buttonChild.addEventListener("click", () => {
    // let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер ** получать индексы отдельно
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let obj = createNewContainer(activContainer);

    containers.push(obj);
    sortContainers(containers, activContainer);

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

    sortContainers(containers, containers[serchParent.globalIndex]);
    motion();
});

// очистка
buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    containers[0].isActiv = true;
    changeInput.value = containers[0].title;
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
    draw();
});

// масштабирование
// * не меняются координаты при масштабировании
function motion() {
    mask = containers.map((container) => ({ ...container }));
    mask.forEach((container) => {
        container.x = (container.x + offsetX) * scale;
        container.y = (container.y + offsetY) * scale;
        container.width *= scale;
        container.height *= scale;
    });
    draw();
};
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

// активная кнопка
canvas.addEventListener("click", (event) => {
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Проверяем объекты на пересечение с кликом
    activContainer = null;
    mask.forEach((object) => {
        if (
            clickX >= object.x &&
            clickX <= object.x + object.width &&
            clickY >= object.y &&
            clickY <= object.y + object.height
        ) {
            // Обработка клика на объекте
            object.isActiv ? // при повторном клике
                (object.isActiv = false, changeInput.value = "", activContainer = null)
                :
                (object.isActiv = true, changeInput.value = object.title, activContainer = object);

            serchParam(object.id, containers, 'id').isActiv = true;
            console.log(`activContainer`, object);
        } else {
            object.isActiv = false;
            serchParam(object.id, containers, 'id').isActiv = false;
        };
        // кlик по плашке инфо
        if (
            clickX >= object.x + 44 &&
            clickX <= object.x + 56 &&
            clickY >= object.y - 3 &&
            clickY <= object.y + 9
        ) {
            object.isOpen = true;
        };
        if (
            clickX >= object.x + 74 &&
            clickX <= object.x + 86 &&
            clickY >= object.y - 3 &&
            clickY <= object.y + 9
        ) {
            object.isOpen = false;
        };
    });
    draw();
});

// перемещение
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
        motion();
    }
});
canvas.addEventListener('mouseup', (event) => {
    if (event.button === 3) { // Проверяем отпускание правой кнопки мыши
        isDragging = false;
        // offsetX += event.clientX - startDragX;
        // offsetY += event.clientY - startDragY;
        motion();
    }
});

// функция рисования
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    mask.forEach(container => {
        // отрисовываем линии
        container.child.forEach((childId) => {
            // поиск дочерних у родителя на нижнем уровне
            const findContainer = mask.find((container) => container.id === childId);
            if (findContainer) {
                ctx.beginPath();
                ctx.moveTo(container.x + 23, container.y + 9);
                ctx.lineTo(findContainer.x + 23, findContainer.y + 9);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        });

        // отрисовываем контейнеры
        if (container.isOpen) {
            roundedRect(container, container.width + 30, container.height + 30, 7);
            infoRect(container.x + 80, container.y + 3, 6, true);
        } else {
            roundedRect(container, container.width, container.height, 5);
            infoRect(container.x + 50, container.y + 3, 6);
        }
    });
};

// контейнер
function roundedRect({ x, y, isActiv, title, isOpen, child }, width, height, borderRadius) {

    ctx.beginPath(); // Начните новый путь
    ctx.moveTo(x + borderRadius, y); // Начало пути в верхнем левом углу прямоугольника
    ctx.lineTo(x + width - borderRadius, y); // Рисуем линию от левого верхнего угла до правого верхнего угла
    ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius); // Создаем скругление в верхнем правом углу
    ctx.lineTo(x + width, y + height - borderRadius); // Рисуем линию в правый нижний угол
    ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius); // Создаем скругление в нижнем правом углу
    ctx.lineTo(x + borderRadius, y + height); // Рисуем линию в нижний левый угол
    ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius); // Создаем скругление в нижнем левом углу
    ctx.lineTo(x, y + borderRadius); // Рисуем линию в левый верхний угол
    ctx.arcTo(x, y, x + borderRadius, y, borderRadius); // Создаем скругление в верхнем левом углу
    ctx.closePath(); // Закончите путь

    // Заполните прямоугольник с заданным цветом
    if (isActiv) {
        ctx.fillStyle = "red"
    } else {
        ctx.fillStyle = 'white'
    };
    ctx.fill();
    // текст в контейнере перенести в функцию
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    ctx.fillText(title, x + 6, y + 12);
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
};

draw();
