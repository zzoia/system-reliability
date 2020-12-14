import { SingleModule } from "../system/SingleModule";

export class DepthFirstSearchTreeValidator {

    constructor(treeBuilder) {
        this.treeBuilder = treeBuilder;
    }

    validate() {
        const root = this.treeBuilder.getRoot();
        const accumulator = [];
        const stack = [root];

        while (stack.length) {
            
            const node = stack.pop();

            if (stack.some(prev => prev.id === node.id)) {
                throw Error(`Знайдено цикл під час BFS обходу графу. Вузол '${node.id}' вже є на стеку`);
            }

            if (node.children.length > 1) {
                node.children.forEach(child => {
                    if (child.parents.length > 1) {
                        throw Error(`Знайдено сітку в графі. '${node.id}' має багатьох нащадків, з них '${child.id}' має багато предків.`);
                    }
                });
            }

            if (!accumulator.some(existingNode => existingNode.node.id === node.id)) {
                accumulator.push({
                    currentModule: new SingleModule(node.id),
                    node: node
                });
            }

            node.children.forEach(child => {
                stack.push(child);
            });
        }

        const modules = accumulator.map(treeNode => treeNode.currentModule);

        accumulator.forEach(({ currentModule, node }) => {

            node.children.forEach(nodeChild => {
                const childModule = modules.find(cModule => cModule.id === nodeChild.id);
                currentModule.children.push(childModule);
            });

            node.parents.forEach(nodeParent => {
                const parentModule = modules.find(pModule => pModule.id === nodeParent.id);
                currentModule.parents.push(parentModule);
            });

        });
        
        return modules;
    }

}
