import { DEPENDENCY_TYPES } from "../constants";
import { ModuleCollection } from "../system/ModuleCollection";
import { endNodeId } from "../GraphData";

export class SequentialParallel {

    createComposite(startNode) {

        do {
            startNode = this.mergeSequential(startNode);
            this.mergeParallel(startNode);
        } while (startNode.children.length);

        startNode.collection.shift();

        const lastItem = startNode.collection[startNode.collection.length - 1];
        if (lastItem.collection) {

            // If item added is a collection, than it is of type "and" and contains end node.
            lastItem.collection = lastItem.collection.filter(item => item.id !== endNodeId);
        } else {

            // If last item is not collection than it is end node.
            startNode.collection.pop();
        }

        return startNode;
    }

    mergeParallel = currentModule => {

        currentModule.isVisitedByMergeSequantial = false;
        if (currentModule.isVisitedByMergeParallel) return;

        currentModule.isVisitedByMergeParallel = true;

        if (currentModule.children.length <= 1) return;

        // Move to the next node and try parallel merging
        if (currentModule.children.length === 1) {
            this.mergeParallel(currentModule.children[0]);
            return;
        }

        const commonGrandChildren = currentModule.groupGrandChildren();

        if (!commonGrandChildren.length) {
            currentModule.children.forEach(this.mergeParallel);
            return;
        }

        commonGrandChildren
            .forEach(common => {
                const newChild = this.processGrandChildConnections(currentModule, common);
                this.mergeParallel(newChild);
            });
    };

    processGrandChildConnections = (currentModule, common) => {

        common.connections
            .forEach(child => {
                child.clearParentChildRelations();
                currentModule.removeChild(child);
                common.grandChild.removeParent(child);
            });

        const newModule = new ModuleCollection(DEPENDENCY_TYPES.Or, common.connections);
        newModule.children = [common.grandChild];
        newModule.parents = [currentModule];

        currentModule.children.push(newModule);
        common.grandChild.parents.push(newModule);
        return common.grandChild;
    };

    mergeSequential = currentModule => {

        currentModule.isVisitedByMergeParallel = false;
        if (currentModule.isVisitedByMergeSequantial) return currentModule;

        currentModule.isVisitedByMergeSequantial = true;

        if (!currentModule.children.length) return currentModule;

        while (currentModule.hasOneChildWithOneParent()) {

            const [newModule, child] = this.consumeSingleChild(currentModule);
            currentModule = newModule;

            child.moveChildrenTo(currentModule);
            child.clearParentChildRelations();
        }

        currentModule.children = currentModule.children.map(this.mergeSequential);
        return currentModule;
    };

    consumeSingleChild = module => {

        const child = module.children[0];

        if (module.dependency === DEPENDENCY_TYPES.And) {

            module.collection.push(child);
            module.children = [];

        } else {

            const andSubSystem = new ModuleCollection(DEPENDENCY_TYPES.And, [module, child]);

            module.replaceSelfFromParents(andSubSystem);
            module.clearParentChildRelations();

            module = andSubSystem;
        }

        return [module, child];
    }
}
