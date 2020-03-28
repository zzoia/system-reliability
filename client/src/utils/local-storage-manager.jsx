export default class LocalStorageManager {

    getItem(name) {
        const item = localStorage.getItem(name);
        if (!item) return null;
        return JSON.parse(item);
    }

    setItem(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    getAdjacencyList = () => this.getItem("adjacencyList");

    setAdjacencyList = (data) => this.setItem("adjacencyList", data);

    getGraph = () => this.getItem("graph");

    setGraph = (data) => this.setItem("graph", data);

    getSystemRequest = () => this.getItem("systemRequest");

    setSystemRequest = (data) => this.setItem("systemRequest", data);
}