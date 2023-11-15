import { serchChilds } from "./arrayFunction.js"

// функция рисования
export function draw(x, y, offsetX, offsetY, scaleModify, root, arr, isSwitch, rect, ctx, activContainer) {
    ctx.clearRect(0 - offsetX, 0 - offsetY, rect.width * scaleModify, rect.height * scaleModify); // Очищаем холст
    (x || y) && ctx.translate(x, y);
    // drawGrid(); // сетка

    // отрисовываем линии
    serchChilds(root, drawLine, arr, ctx);

    arr.forEach(container => {
        // отрисовываем контейнеры
        roundedRect(container, isSwitch, ctx, activContainer);
    });
};

// рисовальня линий
function drawLine(container, foundChild, ctx) {
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
function roundedRect({ ...param }, isSwitch, ctx, activContainer) {

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