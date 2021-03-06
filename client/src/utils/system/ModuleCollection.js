import { SubSystem } from "./SubSystem";

export class ModuleCollection extends SubSystem {

    constructor(dependency, collection) {
        super();
        this.dependency = dependency;
        this.collection = collection;
    }

    equalsTo(anotherSubSystem) {
        if (!anotherSubSystem.collection) {
            return false;
        }

        if (this.collection.length !== anotherSubSystem.collection.length) {
            return false;
        }

        this.collection.sort();
        anotherSubSystem.collection.sort();

        for (let index = 0; index < this.collection.length; index++) {
            const item = this.collection[index];
            if (!anotherSubSystem.collection.some(other => other.equalsTo(item))) {
                return false;
            }
        }

        return true;
    }

    getRepresentation() {

        if (this.collection.length === 1) {
            return this.collection[0].getRepresentation();
        }

        const representation = [];
        this.collection.forEach(item => {
            representation.push(item.getRepresentation());
        });

        return {
            [this.dependency]: representation
        };
    }

    toRequest(nodes) {

        if (this.collection.length === 1) {
            return this.collection[0].toRequest(nodes);
        }

        const members = [];
        this.collection.forEach(item => {
            members.push(item.toRequest(nodes));
        });

        return {
            dependency: this.dependency,
            members,

            type: "multiple",

            id: null,
            moduleName: null,
            failureRate: 0,
            recoveryRate: 0,
            left: 0
        };
    }

}
