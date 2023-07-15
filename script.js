let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");

const buttonChild = document.getElementById("addChild");
const buttonSibling = document.getElementById("addSibling");
const buttonClear = document.getElementById("clear");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

class Conteiner {
    constructor(x, y, level, position, id) {
        this.width = 20;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.isDrag = false;
        this.isActiv = false;
        this.level = level;
        this.position = position;
        this.child = [];
        this.id = id;
    }
};
class Entiti {
    constructor(level, collumn) {
        this.level = level;
        this.collumn = collumn;
    }
};

const root = new Conteiner(250, 20, 1, { parPos: 1, myChildPos: 1, myGlobalPos: 1 }, nanoid());

const containers = [root];
let activContainer = root;
let idFistChild = null;
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
    let x, y, level, position, childId;
    childId = nanoid();
    parent.child.push(childId); // добавляем ид дочернего в родителя
    x = 75 * map[parent.level].collumn;
    y = 75 * parent.level;
    level = parent.level + 1;
    position = {
        parPos: parent.position.myGlobalPos, // позиция родителя на своем уровне
        myChildPos: parent.child.indexOf(childId) + 1, // моч позиция как ребенка
        quantityChild: parent.child.length + 1, // колво детей в родителе
        myGlobalPos: map[parent.level].collumn // моя глобальная позиция на уровне
    };
    // position = map[parent.level].collumn;
    return new Conteiner(x, y, level, position, childId);
}

// добавить ребенка
buttonChild.addEventListener("click", () => {
    let obj = createNewConteiner(activContainer);
    if (!idFistChild) {
        containers.push(obj);
    } else {
        let index = containers.findIndex(({ id }) => id === idFistChild);
        containers.splice(index, 0, obj);
    }
    
    console.log(containers);
    // растягиваю по ширине. меняет позиции элементов которые ниже активного
    containers.forEach((container) => {
        if (container.level === activContainer.level + 1) {
            // let partWidth = rect.width / (map[activContainer.level - 1].collumn);
            // let elementWidth = partWidth / (1 + map[activContainer.level].collumn);

            // container.x = ((elementWidth * container.position.myChildPos) * container.position.parPos);

            container.x = ((rect.width / (1 + map[activContainer.level].collumn)) * container.position.myGlobalPos) - 25;
        };
    })
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
    containers.forEach((object) => {
        if (
            clickX >= object.x &&
            clickX <= object.x + object.width &&
            clickY >= object.y &&
            clickY <= object.y + object.height
        ) {
            // Обработка клика на объекте
            object.isActiv ? (object.isActiv = false, activContainer = null) : (object.isActiv = true, activContainer = object);
            idFistChild = object.child[0]
        } else {
            object.isActiv = false;
        };
    });
    draw();
});

// canvas.addEventListener("mousedown", (event) => {
//     console.log(event);
//     containers[0].isDrag = true;
// });
// canvas.addEventListener("mousemove", (event) => {
//     if (containers[0].isDrag) {
//         containers[0].x = event.clientX - rect.left - containers[0].width / 2;
//         containers[0].y = event.clientY - rect.top - containers[0].height / 2;
//         draw();
//     }
// });
// canvas.addEventListener("mouseup", () => {
//     containers[0].isDrag = false;
// });

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    containers.forEach((container) => {
        container.isActiv ? ctx.fillStyle = "blue" : ctx.fillStyle = 'red';
        ctx.fillRect(container.x, container.y, container.width, container.height);
    });

    containers.forEach((container) => {
        const obj1 = container;

        container.child.forEach((childId) => {
            const findContainer = containers.find((container) => container.id === childId);
            if (findContainer) {

                // ctx.fillRect(findContainer.x, findContainer.y, findContainer.width, findContainer.height);

                ctx.beginPath();
                ctx.moveTo(obj1.x + 10, obj1.y + 10);
                ctx.lineTo(findContainer.x + 10, findContainer.y + 10);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        })

    })
};

draw();