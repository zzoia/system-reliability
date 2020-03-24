import { Node } from "./node";

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
                    throw Error("В графі є більше, ніж один вузол без предків");
                }
                root = node;
            }
        });
        if (!root) {
            throw Error("Не знайдено вузла без предків (кореня)");
        }
        return root;
    }
}
