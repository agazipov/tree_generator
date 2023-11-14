// поиск детей 
export function serchChilds(container, func, arr, _context) {
    if (container.child.length === 0) {
        return;
    };
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, arr, 'serchChilds');
        func(container, foundChild, _context);
        serchChilds(foundChild, func, arr, _context);
    });
};

// поиск контейнера по заданным параметрам
export function serchParam(param, arr, property) {
    if (param === "parentID") {
        return;
    }
    if (!param) {
        console.log(`Не верный параметр поиска ${param} в ${property}`);
        return;
    };
    let value;
    arr.find((container) => {
        if (container?.id === param) value = container;
    });
    return value;
};

// сортировка массива
function countingLeavesArea(container, arr) {
    if (container.child.length === 0) {
        container.countLeavesArea = 30;
        return 30;
    };
    container.countLeavesArea = 0;
    // ищем листья
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, arr, 'childFound');
        container.countLeavesArea += countingLeavesArea(foundChild, arr);
    });
    return container.countLeavesArea;
}
function assignmentCoordinates(container, arr) {
    if (container.child.length === 0) {
        return;
    };
    // назначение координат
    let count = 0;
    container.child.forEach((childId, index) => {
        const foundChild = serchParam(childId, arr, ' assignment');
        foundChild.x = 75 * container.level; // изменение х от уровня
        //  помещаем контенер в середину его зоны (относительно его родителя)
        count += foundChild.countLeavesArea / 2;
        foundChild.y = (container.y - (container.countLeavesArea / 2)) + count; // распределяет относительно отцовского контенера
        count += foundChild.countLeavesArea / 2;
        assignmentCoordinates(foundChild, arr);
    });
}
export function sortRecursion(container, arr) {
    countingLeavesArea(container, arr);
    assignmentCoordinates(container, arr);
}

// удаляем контейнер
// зачистка родительского контейнера от удаленного ребенка (находим глобальный индекс родителя)
export function clearParentContainerForChild(activContainer, arr) {
    const serchParent = serchParam(activContainer.parentId, arr, 'activDel');
    serchParent.child = serchParent.child.filter((child) => activContainer.id !== child);
};
export function delBranch(container, arr) {
    if (container.child.length === 0) {
        const containerIndex = arr.indexOf(container);
        arr.splice(containerIndex, 1);
        return;
    };
    container.child.forEach((childId) => {
        const foundChild = serchParam(childId, arr, 'childDel');
        delBranch(foundChild, arr);
    });
    const containerIndex = arr.indexOf(container);
    arr.splice(containerIndex, 1);
};

// активная кнопка
// поиск родителя (окраска пути до компонента)
export function serchParentIsBranch(container, arr) {
    if (!container) {
        // клик не в контейнер сбрасывает отображение ветки
        arr.forEach((container) => container.isBranch = false);
        return;
    } else {
        let parentContainer = serchParam(container.parentId, arr, 'parentBranch');
        if (!parentContainer) {
            return;
        };
        parentContainer.isBranch = true;
        serchParentIsBranch(parentContainer, arr);
    };
};