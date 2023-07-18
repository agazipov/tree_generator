let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonSibling = document.getElementById("addSibling");
const buttonClear = document.getElementById("clear");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Conteiner {
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
        this.index = 0;
        this.parentIndex = parentIndex;
    }
};

const root = new Conteiner(25, 20, 1, nanoid(), true, null, 0);

const containers = [[root]];
let activContainersIndex = 0; // индекс актвного контейнера в общем массиве 

// генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewConteiner(parent) {
    let x, y, level, id, isActiv, parentId, parentIndex;
    id = nanoid();
    parent.child.push(id); // добавляем ид дочернего в родителя
    x = 75;
    y = 75 * parent.level;
    level = parent.level + 1;
    parentId = parent.id
    parentIndex = parent.index;
    isActiv = false;

    return new Conteiner(x, y, level, id, isActiv, parentId, parentIndex);
};

// поиск контейнера по заданным параметрам
function serchParam(param, arr, property) {
    let value;
    arr.find((subArr) => {
        subArr.find((container) => { if (container?.[property] === param) value = container });
    });
    return value;
};


// добавить ребенка
buttonChild.addEventListener("click", () => {
    let activContainer = serchParam(true, containers, 'isActiv'); // ищем активный контейнер
    if (!activContainer) {
        console.log(`Нет активного контейнера`);
        return;
    }
    let obj = createNewConteiner(activContainer);

    if (containers.length === activContainersIndex + 1) { // если первый контейнер на уровне
        containers.push(new Array(obj));
    } else {
        containers[activContainersIndex + 1].push(obj);

        containers.forEach((element, _index, arr) => {
            // сортировка контейнеров на своем уровне по родительскому индексу
            element.sort((a, b) => {
                if (a.parentIndex > b.parentIndex) { return 1; }
                if (a.parentIndex < b.parentIndex) { return -1; }
                return 0;
            })

            // переназначение параметров контейнера после добавления нового элемента
            element.forEach((container, index) => {
                container.index = index; // текущий индекс на уровне
                container.parentIndex = serchParam(container.parentId, arr, 'id') ? serchParam(container.parentId, arr, 'id').index : 0; // проверка актуального родительского индекса
                container.x = ((rect.width / element.length) * (index)) + 25; // растягивание по ширене уровня
            });
        })
    };
    // console.log(containers);
    draw();
});

// очистка
buttonClear.addEventListener("click", () => {
    containers.length = 0;
    containers.push([new Conteiner(25, 20, 1, nanoid(), true, null, 0)]);
    activContainersIndex = 0;
    draw();
});

// активная кнопка
canvas.addEventListener("click", (event) => {

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Проверяем объекты на пересечение с кликом
    containers.forEach((arr, index) => {
        arr.forEach((object) => {
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                // Обработка клика на объекте
                object.isActiv ? object.isActiv = false : object.isActiv = true; // при повторном клике
                activContainersIndex = index; // добавить в свойство объекта*
            } else {
                object.isActiv = false;
            };
        })
    });
    draw();
});

// функция рисования
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    containers.forEach((arr, index) => {
        arr.forEach(container => {
            // отрисовываем контейнеры
            container.isActiv ? ctx.fillStyle = "red" : ctx.fillStyle = 'blue';
            ctx.fillRect(container.x, container.y, container.width, container.height);
            ctx.fillText("index " + container.index.toString(), container.x, container.y - 5);
            ctx.fillText("parIndex " + container.parentIndex.toString(), container.x, container.y + 30);

            // отрисовываем линии
            container.child.forEach((childId) => {
                // поиск дочерних у родителя на нижнем уровне
                const findContainer = containers[index + 1] ? containers[index + 1].find((container) => container.id === childId) : null;
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

        })
    });
};

draw();
