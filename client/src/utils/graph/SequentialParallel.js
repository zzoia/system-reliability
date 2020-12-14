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
            lastItem.collection = lastItem.collection.filter(item => item.id !== endNodeId);
        } else {
            startNode.collection.pop();
        }

        return startNode;
    }

    mergeParallel = subModule => {

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

    mergeSequential = subModule => {

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

                // Replace "subModule" with new "andSubSystem" in the graph scheme
                // by replacing the reference from parents to new "andSubSystem"
                subModule.parents.forEach(parent => {

                    // Delete old reference to "subModule" from parents...
                    parent.children = parent.children.filter(sibling => !sibling.equalsTo(subModule));

                    // ...add (replace it with) "andSubSystem"...
                    parent.children.push(andSubSystem);

                    // ...create backward link from the new "andSubSystem"
                    andSubSystem.parents.push(parent);
                });

                // Erase references from current "subModule" to the graps elements
                subModule.parents = [];
                subModule.children = [];

                subModule = andSubSystem;
            }

            child.children.forEach(grandChild => {

                // Children of the "eaten" element are now "subModule's" children
                subModule.children.push(grandChild);

                // Remove "eaten" child from the grandchildren...
                grandChild.parents = grandChild.parents.filter(par => !par.equalsTo(child));

                // ...and replace if by new "subModule"
                grandChild.parents.push(subModule);
            });

            // Remove links from "eaten" child
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
