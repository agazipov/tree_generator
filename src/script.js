import { draw } from "./draw.js";
import { Container, GlobalState } from "./сlass.js";
import {
    handleActivContainer,
    infoPanelFilling,
} from "./arrayFunction.js"
import { nanoid } from "./nanoid.js";
import { elements } from "./subscription.js";
import { addChild, canvasClick, clearCanvas, delContainer, getRepoDirectory, getRepoFiles, loadProject, saveProject, scaleCanvas, switchActivation } from "./listenersCallback.js";

elements.controlPanel.onclick = (event) => {
    switch (event.target.dataset.action) {
        case "add":
            addChild(event, containers, elements, state);
            break;
    
        case "delete":
            delContainer(containers, elements, state);
            break;
    
        // case "switch":
        //     switchActivation(containers, elements, state);
        //     break;
    
        case "clear":
            clearCanvas(containers, elements, state);
            break;
    
        default:
            break;
    }
}

elements.urlImputUser.value = 'agazipov'; // **
elements.urlImputProject.value = 'react-2023-05-25'; // **

const rect = elements.rect();

const initialContainer = new Container(1, '', 'initial', 'initial');
const root = initialContainer.createRoot(rect.height, nanoid)
const state = new GlobalState(root, initialContainer);

const containers = [root];
elements.titleInput.value = root.title;
elements.accordionTextArea.value = root.description;

state.activContainer = handleActivContainer(root, containers, elements);
infoPanelFilling(containers, elements, root);

elements.spanScale.innerText = state.scale;

// --------------------------------------------------------------- //

// обработка клика кнопки add
// elements.buttonChild.addEventListener("click", (event) => addChild(event, containers, elements, state));


// удаление контейнера
// elements.buttonDelete.addEventListener("click", () => delContainer(containers, elements, state));

// смена родителя (принимает компонент на который перенесли)
// свич
elements.buttonSwithParent.addEventListener("click", () => switchActivation(containers, elements, state));

// очистка
// elements.buttonClear.addEventListener("click", () => clearCanvas(containers, elements, state));

// --------------------------------------------------------------- //

// редактирование
elements.titleButton.addEventListener("click", () => {
    state.activContainer.title = elements.titleInput.value;
    draw(null, state, elements, containers);
});
elements.accordionTextArea.addEventListener("change", (event) => {
    state.activContainer.description = event.target.value;
});

// масштабирование ** не работает с перемещением
elements.increaseScaleButton.addEventListener("click", () => scaleCanvas(true, containers, elements, state));
elements.decreaseScaleButton.addEventListener("click", () => scaleCanvas(false, containers, elements, state));


// клик по холсту
elements.canvas.addEventListener("click", (event) => canvasClick(event, containers, elements, state));

// перемещение
elements.canvas.addEventListener('mousedown', (event) => {
    if (event.button === 2) { // Проверяем нажатие правой кнопки мыши
        state.startDragX = event.clientX;
        state.startDragY = event.clientY;
        elements.canvas.addEventListener('mousemove', moveOnCanvas);
    }
});
elements.canvas.addEventListener('mouseup', (event) => {
    if (event.button === 2) { // Проверяем отпускание правой кнопки мыши
        elements.canvas.removeEventListener('mousemove', moveOnCanvas)
    }
});
function moveOnCanvas(event) {
    const dx = event.clientX - state.startDragX; // Смещение по оси X
    const dy = event.clientY - state.startDragY; // Смещение по оси Y
    state.startDragX = event.clientX;
    state.startDragY = event.clientY;
    state.offsetX += dx;
    state.offsetY += dy;
    draw({ translateX: dx, translateY: dy }, state, elements, containers);
}

//централизация
elements.center[0].addEventListener('click', () => {
    const valueX = -state.offsetX, valueY = -state.offsetY;
    state.offsetY = 0;
    state.offsetX = 0;
    draw({ translateX: valueX, translateY: valueY }, state, elements, containers);
});

//репозиторий
elements.gitReq.addEventListener('click', () => getRepoDirectory(elements));
elements.urlSelector.addEventListener('change', (event) => getRepoFiles(event, containers, elements, state, nanoid));


// сейвинг загрузинг
elements.saveButton.addEventListener('click', () => saveProject(containers));
elements.file.addEventListener('change', (event) => loadProject(event, containers, elements, state));


// обработка события элементов гита
elements.gitElements.addEventListener('click', (event) => addChild(event, containers, elements, state));

draw(null, state, elements, containers);
