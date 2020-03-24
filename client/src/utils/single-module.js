import { SubSystem } from "./sub-system";

export class SingleModule extends SubSystem {
    
    constructor(id) {
        super();
        this.id = id;
    }

    equalsTo(anotherSubSystem) {
        return this.id === anotherSubSystem.id;
    }

    getRepresentation() {
        return this.id;
    }

}
