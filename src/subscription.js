export const sub = {
    // управление
    buttonChild: document.getElementById("addChild"),
    buttonSwithParent: document.getElementById("swithParent"),
    buttonDelete: document.getElementById("delContainer"),
    buttonClear: document.getElementById("clear"),
    // редактирование заголовка
    titleInput: document.getElementById("titleInput"),
    titleButton: document.getElementById("titleButton"),
    // редактирование описания
    accordionTextArea: document.getElementById("accordionTextArea"),
    // масштаб
    increaseScale: document.getElementById("increaseScale"),
    decreaseScale: document.getElementById("decreaseScale"),
    spanScale: document.getElementById("spanScale"),
    // файлы
    saveButton: document.getElementById("saveButton"),
    file: document.getElementById("file"),
    // обработка запросов
    // гит
    urlImputUser: document.getElementById("gitUrlImputUser"),
    urlImputProject: document.getElementById("gitUrlImputProject"),

    gitReq: document.getElementById("gitReq"),
    urlSelector: document.getElementById("urlSelector"),
    gitElements: document.getElementById("gitElements"),
    // канвас
    canvas: document.getElementById("myCanvas"),
    rect: function() {
        return this.canvas.getBoundingClientRect();
    },
    ctx: function () {
        return this.canvas.getContext("2d");
    },
    elementInfo: document.getElementsByClassName("elementInfo_text"),
    center: document.getElementsByClassName("centralization"),
}
