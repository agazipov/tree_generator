let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonSibling = document.getElementById("addSibling");
const buttonClear = document.getElementById("clear");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Conteiner {
    constructor(x, y, level, id, parentId, parentIndex) {
        this.width = 20;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.id = id;
        this.isDrag = false;
        this.isActiv = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.index = 0;
        this.parentIndex = parentIndex;
    }
};

const root = new Conteiner(25, 20, 1, nanoid(), 0, 0);

const containers = [[root]];
let activContainersIndex = 0; // индекс актвного контейнера в общем массиве 
let activContainer = root; // храним активный контенер

// генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
function createNewConteiner(parent) {

    let x, y, level,  childId, parentId, parentIndex;
    childId = nanoid();
    parent.child.push(childId); // добавляем ид дочернего в родителя
    x = 75;
    y = 75 * parent.level;
    level = parent.level + 1;
    parentId = parent.id
    parentIndex = parent.index;

    return new Conteiner(x, y, level, childId, parentId, parentIndex);
};

// поиск родителя по его айди
function serchId(id, arr) {
    let value;
    arr.find((subArr) => {
        subArr.find((container) => {if (container.id === id) value = container});
    });
    return value ? value.index : 0;
};


// добавить ребенка
buttonChild.addEventListener("click", () => {
    let obj = createNewConteiner(activContainer);

    if (containers.length === activContainersIndex + 1) {
        containers.push(new Array(obj));
    } else {
        containers[activContainersIndex + 1].push(obj);

        containers.forEach((element, _index, arr) => {
            element.sort((a, b) => {
                if (a.parentIndex > b.parentIndex) { return 1; }
                if (a.parentIndex < b.parentIndex) { return -1; }
                return 0;
            })

            element.forEach((container, index) => {
                container.index = index;
                container.parentIndex = serchId(container.parentId, arr);
                container.x = ((rect.width / element.length) * (index)) + 25;
            });
        })
    };
    // console.log(containers);
    // console.log('activContainer', activContainer.index);
    draw();
});

// очистка
buttonClear.addEventListener("click", () => {
    level = 0;
    col = 0;
    containers.length = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(containers[0].x, containers[0].y, containers[0].width, containers[0].height);
});

// активная кнопка
canvas.addEventListener("click", (event) => {

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Проверяем объекты на пересечение с кликом
    containers.forEach((arr, index) => {
        arr.forEach((object, indexLocal) => {
            if (
                clickX >= object.x &&
                clickX <= object.x + object.width &&
                clickY >= object.y &&
                clickY <= object.y + object.height
            ) {
                // Обработка клика на объекте
                object.isActiv ?
                    (object.isActiv = false, activContainer = null)
                    :
                    (object.isActiv = true, activContainer = object);
                activContainersIndex = index; // добавить в свойство объекта*
            } else {
                object.isActiv = false;
            };
        })
    });
    // console.log('activContainer', activContainer);
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
                const findContainer = containers[index + 1].find((container) => container.id === childId);
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
