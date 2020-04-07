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

    getSystemRequest = () => this.getItem("systemRequest");

    setSystemRequest = (data) => this.setItem("systemRequest", data);
}

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem("state");
        if (!serializedState) return undefined;
        return JSON.parse(serializedState);
    } catch {
        return undefined;
    }
};

export const saveState = (state) => {
    localStorage.setItem("state", JSON.stringify(state));
};