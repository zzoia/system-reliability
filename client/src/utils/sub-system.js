export class SubSystem {
    
    constructor() {
        this.parents = [];
        this.children = [];
    }

    equalsTo(anotherSubSystem) {
        throw Error("Abstract method invoked.");
    }

    getRepresentation() {
        throw Error("Abstract method invoked.");
    }
    
}
