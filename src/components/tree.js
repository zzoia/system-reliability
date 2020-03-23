class Node {
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

export class TreeBuilder {
    constructor() {
        this.nodes = [];
    }

    fromEdge({ source, target }) {
        const fromNode = this.getOrAddNode(source);
        const toNode = this.getOrAddNode(target);

        fromNode.addChild(toNode);
        toNode.addParent(fromNode);
    }

    getOrAddNode(id) {
        let node = this.nodes.find(node => node.id === id);
        if (!node) {
            node = new Node(id);
            this.nodes.push(node);
        }

        return node;
    }

    getRoot() {
        let root = null;
        this.nodes.forEach(node => {

            if (!node.hasParents()) {
                if (root) {
                    throw Error("Tree has more then one node with no parents.");
                }
                root = node;
            }
        });

        if (!root) {
            throw Error("Node without parents not found.");
        }

        return root;
    }
}

export class DepthFirstSearchTreeValidator {

    constructor(treeBuilder) {
        this.treeBuilder = treeBuilder;
    }

    validateTreeNodes() {
        const root = this.treeBuilder.getRoot();
        const treeNodes = [];

        const stack = [root];
        while (stack.length) {
            const node = stack.pop();
            if (stack.some(prev => prev.id === node.id)) {
                throw Error("Cycle detected while BFS traversing the graph.");
            }

            if (!treeNodes.some(existingNode => existingNode.node.id === node.id)) {
                treeNodes.push({
                    currentModule: new ModuleCollection("and", [new SingleModule(node.id)]),
                    node: node
                });
            }

            node.children.forEach(child => {
                stack.push(child);
            })
        }
        // const collection = [root];

        // const treeNodes = [];

        // while (collection.length) {
        //     const node = collection.shift();
        //     if (node.isVisited) {
        //         throw Error("The graph is not tree because BFS found same node twice.");
        //     }

        //     node.isVisited = true;
        //     treeNodes.push({
        //         currentModule: new ModuleCollection("and", [new SingleModule(node.id)]),
        //         node: node
        //     });

        //     collection.unshift(...node.children);
        // }

        const modules = treeNodes.map(treeNode => treeNode.currentModule);
        treeNodes.forEach(({ currentModule, node }) => {

            node.children.forEach(nodeChild => {
                const childModule = modules.find(cModule => cModule.collection[0].id === nodeChild.id);
                currentModule.children.push(childModule);
            });

            node.parents.forEach(nodeParent => {
                const parentModule = modules.find(pModule => pModule.collection[0].id === nodeParent.id);
                currentModule.parents.push(parentModule);
            });
        });

        return modules;
    }
}

export class SubSystem {
    constructor() {
        this.parents = [];
        this.children = [];
    }

    equalsTo(anotherSubSystem) {
        throw Error("Abstract method invoked.");
    }

}

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

}