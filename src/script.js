import { draw } from "./draw.js";
import { Container, GlobalState } from "./сlass.js";
import {
    handleActivContainer,
    infoPanelFilling,
} from "./arrayFunction.js"
import { nanoid } from "./nanoid.js";
import { sub } from "./subscription.js";
import { addChild, canvasClick, clearCanvas, delContainer, getRepoDirectory, getRepoFiles, loadProject, saveProject, scaleCanvas, switchActivation } from "./listenersCallback.js";
// import { getRepoDirectory, getRepoFiles } from "./api.js";

sub.urlImputUser.value = 'agazipov'; // **
sub.urlImputProject.value = 'react-2023-05-25'; // **

const ctx = sub.ctx();
const rect = sub.rect();

const initialContainer = new Container(1, '', 'initial', 'initial');
const root = initialContainer.createRoot(rect.height, nanoid)
const state = new GlobalState(root, initialContainer);

const containers = [root];
sub.titleInput.value = root.title;
sub.accordionTextArea.value = root.description;

state.activContainer = handleActivContainer(root, containers, sub);
infoPanelFilling(containers, sub, root);

let activContainer = root; // ссылка на активный элемент в массиве
let gitBlob = [];
let gitTree = [];

// переменные масштабирования
let scale = 1;
let scaleModify = 1;
sub.spanScale.innerText = scale;

// переменные перемещения
let isSwitch = false;
let isDragging = false; // Флаг для отслеживания, идет ли перемещение полотна
let startDragX = 0;
let startDragY = 0;
let offsetX = 0;
let offsetY = 0;

// обработка клика кнопки add
sub.buttonChild.addEventListener("click", (event) => addChild(event, containers, sub, state));

// удаление контейнера
sub.buttonDelete.addEventListener("click", () => delContainer(containers, sub, state));

// очистка
sub.buttonClear.addEventListener("click", () => clearCanvas(containers, sub, state));

// редактирование
sub.titleButton.addEventListener("click", () => {
    state.activContainer.title = sub.titleInput.value;
    draw(null, state, sub, containers);
});
sub.accordionTextArea.addEventListener("change", (event) => {
    state.activContainer.description = event.target.value;
});

// масштабирование ** не работает с перемещением
sub.increaseScaleButton.addEventListener("click", () => scaleCanvas(true, containers, sub, state));
sub.decreaseScaleButton.addEventListener("click", () => scaleCanvas(false, containers, sub, state));

// смена родителя (принимает компонент на который перенесли)
// свич
sub.buttonSwithParent.addEventListener("click", () => switchActivation(containers, sub, state));

// клик по холсту
sub.canvas.addEventListener("click", (event) => canvasClick(event, containers, sub, state));

// перемещение
sub.canvas.addEventListener('mousedown', (event) => {
    if (event.button === 2) { // Проверяем нажатие правой кнопки мыши
        state.startDragX = event.clientX;
        state.startDragY = event.clientY;
        sub.canvas.addEventListener('mousemove', moveOnCanvas);
    }
});
sub.canvas.addEventListener('mouseup', (event) => {
    if (event.button === 2) { // Проверяем отпускание правой кнопки мыши
        sub.canvas.removeEventListener('mousemove', moveOnCanvas)
    }
});
function moveOnCanvas(event) {
    const dx = event.clientX - state.startDragX; // Смещение по оси X
    const dy = event.clientY - state.startDragY; // Смещение по оси Y
    state.startDragX = event.clientX;
    state.startDragY = event.clientY;
    state.offsetX += dx;
    state.offsetY += dy;
    draw({ translateX: dx, translateY: dy }, state, sub, containers);
}

//централизация
sub.center[0].addEventListener('click', () => {
    const valueX = -state.offsetX, valueY = -state.offsetY;
    state.offsetY = 0;
    state.offsetX = 0;
    draw({ translateX: valueX, translateY: valueY }, state, sub, containers);
});

//репозиторий
sub.gitReq.addEventListener('click', () => getRepoDirectory(sub));
sub.urlSelector.addEventListener('change', (event) => getRepoFiles(event , containers , sub, state, nanoid));


// сейвинг загрузинг
sub.saveButton.addEventListener('click', () => saveProject(containers));
sub.file.addEventListener('change', (event) => loadProject(event, containers, sub, state));


// обработка события элементов гита
sub.gitElements.addEventListener('click', (event) => addChild(event, containers, sub, state));

draw(null, state, sub, containers);
