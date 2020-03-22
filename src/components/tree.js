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

export class BreadthFirstSearchTreeValidator {

    constructor(treeBuilder) {
        this.treeBuilder = treeBuilder;
    }

    validateTreeNodes() {
        const root = this.treeBuilder.getRoot();
        const collection = [root];

        const treeNodes = [];

        while (collection.length) {
            const node = collection.shift();
            if (node.isVisited) {
                throw Error("The graph is not tree because BFS found same node twice.");
            }

            node.isVisited = true;
            treeNodes.push({
                currentModule: new ModuleCollection("and", [node.id]),
                node: node
            });

            collection.unshift(...node.children);
        }

        const modules = treeNodes.map(treeNode => treeNode.currentModule);
        treeNodes.forEach(({ currentModule, node }) => {

            node.children.forEach(nodeChild => {
                const childModule = modules.find(cModule => cModule.collection[0] === nodeChild.id);
                currentModule.children.push(childModule);
            });

            node.parents.forEach(nodeParent => {
                const parentModule = modules.find(pModule => pModule.collection[0] === nodeParent.id);
                currentModule.parents.push(parentModule);
            });
        });

        return modules;
    }
}

export class SingleModule {
    constructor(id) {

    }
}

export class ModuleCollection {
    constructor(dependency, collection) {
        this.dependency = dependency;
        this.collection = collection;
        this.parents = [];
        this.children = [];
    }

    equalsTo(anotherModule) {

        if (this.collection.length !== anotherModule.collection.length) {
            return false;
        }

        this.collection.sort();
        anotherModule.collection.sort();
        
        for (let index = 0; index < this.collection.length; index++) {
            if (this.collection[index] !== anotherModule.collection[index]) {
                return false;
            }
        }

        return true;
    }
}