let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonSibling = document.getElementById("addSibling");
const buttonClear = document.getElementById("clear");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Conteiner {
    constructor(x, y, level, id, parentId) {
        this.width = 20;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.isDrag = false;
        this.isActiv = false;
        this.level = level;
        this.child = [];
        this.id = id;
        this.parentId = parentId;
    }
};
class Entiti {
    constructor(level, collumn) {
        this.level = level;
        this.collumn = collumn;
    }
};

const root = new Conteiner(250, 20, 1, nanoid(), null);

const containers = [[root]];
let activContainersIndex = 0;
let activLocalIndex = 0;
let activContainer = root;
let map = [new Entiti(1, 1)];

function createNewConteiner(parent) {
    // от количества детей отца менять позицию чилдрена
    // запись в мап
    if (!map.some((element) => element.level === parent.level + 1)) {
        map.push(new Entiti(parent.level + 1, 1));
    } else {
        map[parent.level].collumn += 1;
    };

    // генерация полей нового контейнера
    let x, y, level, parentId, childId;
    childId = nanoid();
    parent.child.push(childId); // добавляем ид дочернего в родителя
    x = 75;
    y = 75 * parent.level;
    level = parent.level + 1;

    parentId = parent.id

    return new Conteiner(x, y, level, childId, parentId);
}

// добавить ребенка
buttonChild.addEventListener("click", () => {
    // let activLevelCol = map[activContainer.level - 1].collumn;
    let obj = createNewConteiner(activContainer);
    if (containers.length === activContainersIndex + 1) {
        containers.push(new Array({ ...obj, localIndex: containers[activContainersIndex][activLocalIndex].localIndex }));
        // containers[activContainersIndex][0].parentIndex = activLocalIndex;

        containers[activContainersIndex + 1].forEach((container, index) => {
            container.x = ((rect.width / containers[activContainersIndex + 1].length) * (index)) + 25;
        });
    } else {
        containers[activContainersIndex + 1].push(obj);

        // let index = containers.findIndex(({ id }) => id === idFistChild);
        // containers.splice(index, 0, obj);

        containers[activContainersIndex + 1].forEach((container, index) => {
            container.x = ((rect.width / containers[activContainersIndex + 1].length) * (index)) + 25;
        });
    };
    console.log(containers);
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
                activContainersIndex = index; // добавить в свойство объекта
                activLocalIndex = indexLocal;
                console.log('activContainersIndex', activContainersIndex);
            } else {
                object.isActiv = false;
            };
        })
    });
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    containers.forEach((arr) => {
        arr.forEach((container) => {
            container.isActiv ? ctx.fillStyle = "blue" : ctx.fillStyle = 'red';
            ctx.fillRect(container.x, container.y, container.width, container.height);
        })
    });


    containers.forEach((arr, index) => {
        arr.forEach(container => {
            const obj1 = container;
                container.child.forEach((childId) => {
                const findContainer = containers[index + 1].find((container) => container.id === childId);
                if (findContainer) {
    
                    ctx.beginPath();
                    ctx.moveTo(obj1.x + 10, obj1.y + 10);
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
