export class Node {
    
    constructor(id) {
        this.id = id;
        this.children = [];
        this.parents = [];
        this.comparableBag = this.id;
    }

    addChild(node) {
        this.children.push(node);
    }

    addParent(node) {
        this.parents.push(node);
    }

    hasParents() {
        return !!this.parents.length;
    }

    hasChildren() {
        return !!this.children.length;
    }
}
