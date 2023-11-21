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
// изменение уровня и сброс  прозрачности
export function changeLevel(parent, child) {
    child.level = parent.level + 1;
    child.isDisable = false;
};
// дизайбл контенера
export function disableContainer(_parent, child) {
    child.isDisable = true;
}

// назначение активного контейнера
export function handleActivContainer(object, arr, sub, activContainer) {
    if (object?.id === arr[0].id || object === null) {
        sub.buttonSwithParent.disabled = true;
    } else {
        sub.buttonSwithParent.disabled = false;
    };
    if (object) {
        object.isActiv = true;
        infoPanelFilling(arr, sub, activContainer);
        return object;
    };
    infoPanelFilling(arr, sub, activContainer);
    return object;
};

// вывод инфы об активном контенере 
export function infoPanelFilling(arr, sub, activContainer) {
    if (!activContainer) {
        sub.titleInput.value = '';
        sub.elementInfo[0].innerHTML = '';
        return;
    };
    sub.elementInfo[0].innerHTML = '';
    const nameArray = ['id', 'child', 'branch', `countLeavesArea`] // ** фиксировать изменения из change
    for (let index = 0; index < nameArray.length; index++) {
        switch (nameArray[index]) {
            case 'branch':
                const branchNameParent = arr.filter((el) => el.isBranch === true).map(el => el.id).join(', \n');
                const listParents = document.createElement('li');
                listParents.textContent = `Parents: \n ${branchNameParent}`;
                sub.elementInfo[0].insertAdjacentElement('beforeend', listParents);
                break;
            case 'child':
                const branchName = activContainer.child.join(', \n');
                const lisstChilds = document.createElement('li');
                lisstChilds.textContent = `Childs: \n ${branchName}`;
                sub.elementInfo[0].insertAdjacentElement('beforeend', lisstChilds);
                break;
            default:
                const property = document.createElement('li');
                property.textContent = `${nameArray[index]}: ` + activContainer[nameArray[index]];
                sub.elementInfo[0].insertAdjacentElement('beforeend', property);
                break;
        };
    };
};

export function switchParent(object, arr, sub, root, activContainer, isSwitch) {
    clearParentContainerForChild(activContainer, arr); // удаляем инфу о ребенке в родительском контейнере
    activContainer.parentId = object.id; // назначаем выделенному контенеру контенер-родитель
    object.child.push(activContainer.id); // добавляем контейнеру в дети активный контенер
    sub.buttonSwithParent.textContent = 'Switch Parent';
    isSwitch = !isSwitch;   // дизейбл функции кнопки для клика
    serchChilds(object, changeLevel, arr); // меняем уровень у контенера и детей ** засунуть в сортировку
    sortRecursion(root, arr);  // сортировка
    serchParentIsBranch(activContainer, arr); // обнуляем путь у массива
    infoPanelFilling(arr, sub,  activContainer, object);
};