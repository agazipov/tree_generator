let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonDelete = document.getElementById("delContainer");
const buttonClear = document.getElementById("clear");
const changeInput = document.getElementById("changeInput");
const changeButton = document.getElementById("changeButton");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Container {
    constructor(x, y, level, id, isActiv, parentId, parentIndex) {
        this.width = 20;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.id = id;
        this.isDrag = false;
        this.isActiv = isActiv;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.localIndex = 0;
        this.globalIndex = 0;
        this.parentIndex = parentIndex;
        this.title = "text";
    }
};

const root = new Container(25, 20, 1, nanoid(), true, null, 0);

const containers = [root];
changeInput.value = containers[0].title;

    // генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewContainer(parent) {
    let x, y, level, id, isActiv, parentId, parentIndex;

    id = nanoid();
    parent.child.push(id); // добавляем ид дочернего в родителя
    x = 75;
    y = 75 * parent.level;
    level = parent.level + 1;
    parentId = parent.id
    parentIndex = parent.localIndex;
    isActiv = false;

    return new Container(x, y, level, id, isActiv, parentId, parentIndex);
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
    arr.forEach((container) => {
        if (container.level === activ.level + 1) {
            levelQuantity += 1;
        }
    });

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
            container.x = ((rect.width / levelQuantity) * (container.localIndex)) + 25; // растягивание по ширене уровня
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
    let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер ** получать индексы отдельно
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    };
    let obj = createNewContainer(activContainer);

    containers.push(obj);
    sortContainers(containers, activContainer);

    draw();
});

// удаляем контейнер
buttonDelete.addEventListener("click", () => {
    let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер
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
    draw();
});

// очистка
buttonClear.addEventListener("click", () => {
    containers.length = 1;
    containers[0].child.length = 0;
    containers[0].isActiv = true;
    changeInput.value = containers[0].title;
    draw();
});

// редактирование
let inputValue;
changeInput.addEventListener("change", (event) => {
    inputValue = event.target.value;
});
changeButton.addEventListener("click", () => {
    let activContainer = serchParam(true, containers, 'isActiv');
    containers[activContainer.globalIndex].title = inputValue;
    draw();
});

// активная кнопка
canvas.addEventListener("click", (event) => {
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Проверяем объекты на пересечение с кликом
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
                (object.isActiv = true, changeInput.value = object.title);
            console.log(`activContainer`, object);
        } else {
            object.isActiv = false;
        };
    })
    draw();
});

// функция рисования
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    containers.forEach(container => {
        // отрисовываем линии
        container.child.forEach((childId) => {
            // поиск дочерних у родителя на нижнем уровне
            const findContainer = containers.find((container) => container.id === childId);
            if (findContainer) {

                ctx.beginPath();
                ctx.moveTo(container.x + 10, container.y + 10);
                ctx.lineTo(findContainer.x + 10, findContainer.y + 10);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        });

        // отрисовываем контейнеры
        container.isActiv ? ctx.fillStyle = "red" : ctx.fillStyle = 'white';
        ctx.fillRect(container.x, container.y, container.width, container.height);
        ctx.fillText("localIndex " + container.localIndex.toString(), container.x, container.y - 5);
        ctx.fillText("parIndex " + container.parentIndex.toString(), container.x, container.y + 30);
        ctx.fillText(container.globalIndex.toString(), container.x + 25, container.y + 10);
        ctx.fillStyle = "black";
        ctx.fillText(container.id.substr(0, 3), container.x, container.y + 8);
        ctx.fillText(container.title, container.x, container.y + 16);
    })
};

draw();
