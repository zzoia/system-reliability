import { DEPENDENCY_TYPES } from "./constants";
import { ModuleCollection } from "./module-collection";

export class SequentialParallel {

    createComposite(startNode) {

        do {
            startNode = this.mergeSequential(startNode);
            this.mergeParallel(startNode);
        } while (startNode.children.length);

        startNode.collection.pop();
        startNode.collection.shift();

        return startNode;
    }

    mergeParallel = (subModule) => {

        subModule.isVisitedByMergeSequantial = false;
        if (subModule.isVisitedByMergeParallel)
            return;

        subModule.isVisitedByMergeParallel = true;

        const children = subModule.children;

        if (children.length <= 1) {
            return;
        }

        if (children.length === 1) {
            this.mergeParallel(subModule.children[0]);
            return;
        }

        let commonGrandChildren = [];
        children.forEach((child, childIndex) => {

            if (child.children.length === 1) {
                const onlyChild = child.children[0];
                const found = commonGrandChildren.find(common => common.grandChild.equalsTo(onlyChild));

                if (found) {
                    found.childIndices.push(childIndex);
                } else {
                    commonGrandChildren.push({
                        childIndices: [childIndex],
                        grandChild: onlyChild
                    });
                }
            }
        });

        commonGrandChildren = commonGrandChildren.filter(common => common.childIndices.length > 1);
        if (commonGrandChildren.length) {

            commonGrandChildren.forEach(common => {
                const childrenToMerge = common.childIndices.map(index => {
                    const currentChild = children[index];
                    currentChild.parents = [];
                    currentChild.children = [];
                    subModule.children = subModule.children.filter(child => !child.equalsTo(currentChild));
                    common.grandChild.parents = common.grandChild.parents.filter(parent => !parent.equalsTo(currentChild));
                    return currentChild;
                });

                const newModule = new ModuleCollection(DEPENDENCY_TYPES.Or, childrenToMerge);
                newModule.children = [common.grandChild];
                newModule.parents = [subModule];

                subModule.children.push(newModule);
                common.grandChild.parents.push(newModule);

                this.mergeParallel(common.grandChild);
            });

        } else {

            children.forEach(child => this.mergeParallel(child));
        }
    };

    hasOneChildWithOneParent(subModule) {
        return subModule.children.length === 1 && subModule.children[0].parents.length === 1;
    }

    mergeSequential = (subModule) => {
        
        subModule.isVisitedByMergeParallel = false;
        if (subModule.isVisitedByMergeSequantial)
            return subModule;

        subModule.isVisitedByMergeSequantial = true;

        if (!subModule.children.length) {
            return subModule;
        }

        while (this.hasOneChildWithOneParent(subModule)) {

            const child = subModule.children[0];
            if (subModule.dependency === DEPENDENCY_TYPES.And) {

                subModule.collection.push(child);
                subModule.children = [];

            } else {

                const andSubSystem = new ModuleCollection(DEPENDENCY_TYPES.And, [subModule, child]);
                subModule.parents.forEach(parent => {
                    parent.children = parent.children.filter(sibling => !sibling.equalsTo(subModule));
                    parent.children.push(andSubSystem);
                    andSubSystem.parents.push(parent);
                });

                subModule.parents = [];
                subModule.children = [];

                subModule = andSubSystem;
            }

            child.children.forEach(grandChild => {
                subModule.children.push(grandChild);
                grandChild.parents = grandChild.parents.filter(par => !par.equalsTo(child));
                grandChild.parents.push(subModule);
            });

            child.children = [];
            child.parents = [];
        }

        const newChildren = [];
        subModule.children.forEach(child => {
            newChildren.push(this.mergeSequential(child));
        });
        
        subModule.children = newChildren;
        return subModule;
    };
}
