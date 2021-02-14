export class GrandChildConnection {

    constructor(grandChild, connection) {
        this.grandChild = grandChild;
        this.connections = [connection];
    }

    addConnection(node) {
        this.connections.push(node);
    }

    is(grandChild) {
        return this.grandChild.equalsTo(grandChild);
    }

    hasMoreThenOneConnection() {
        return this.connections.length > 1;
    }
}