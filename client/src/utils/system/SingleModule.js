import { SubSystem } from "./SubSystem";

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

    toRequest(nodes) {
        const me = nodes.find(node => node.id === this.id);
        return {
            dependency: null,
            members: [],

            type: "single",

            id: this.id,
            moduleName: me.title,
            failureRate: 0,
            recoveryRate: 0,
            left: 0
        };
    }
}
