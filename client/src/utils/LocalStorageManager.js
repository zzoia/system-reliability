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