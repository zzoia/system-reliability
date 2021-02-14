import { Node } from "./Node";
import { NODE_KEY } from '../GraphConfig';
import { startNodeId, endNodeId } from '../GraphData';

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

    validateDanglingNodes() {

        this.nodes.forEach(treeNode => {
            const hasNoChildren = !treeNode.hasChildren() && treeNode[NODE_KEY] !== endNodeId;
            const hasNoParents = !treeNode.hasParents() && treeNode[NODE_KEY] !== startNodeId;

            if (hasNoChildren || hasNoParents) {
                throw { id: treeNode[NODE_KEY] };
            }
        });

    }

    validateMissingNodes(nodes) {
        
        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            const currentNode = nodes[nodeIndex];
            if (!this.hasNodeWithId(currentNode[NODE_KEY])) {
                throw Error(`Модуль ${currentNode.title} не з'єднаний: з'єднайте його або видаліть`);
            }
        }
    }

    hasNodeWithId(id) {
        return this.nodes.some(treeNode => treeNode[NODE_KEY] === id);
    }

}
