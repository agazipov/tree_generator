export class Container {
    constructor(level, id, parentId, title) {
        this.width = 46;
        this.height = 18;
        this.x = 75;
        this.y = 75;
        this.id = id;
        this.isBranch = false;
        this.isActiv = false;
        this.isDisable = false;
        this.level = level;
        this.child = [];
        this.parentId = parentId;
        this.title = title;
        this.description = 'description';
        this.countLeavesArea = 0; // **
    }
    // генерация полей нового контейнера (принимает родителя, здесь активный контейнер)
    createRoot(height, id) {
        const root = new Container(1, id(), 'parentID', 'root');
        root.y = height / 2 - 9;
        root.x = 20;
        root.isActiv = true;
        return root;
    }
    createNewContainer(parent, title, id) {
        let level, childId, parentId;

        childId = id();
        parent.child.push(childId); // добавляем ид дочернего в родителя
        level = parent.level + 1;
        parentId = parent.id

        return new Container(level, childId, parentId, title);
    };
};

