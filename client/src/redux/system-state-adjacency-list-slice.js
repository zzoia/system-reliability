import LocalStorageManager from "../utils/local-storage-manager";
import { createSlice } from "@reduxjs/toolkit";

const systemStateAdjacencyListSlice = createSlice({
    name: "system-state-adjacency-list",
    initialState: [],
    reducers: {
        setAdjacencyList(_, action) {
            return action.payload.adjacencyList;
        }
    }
});

const { actions, reducer } = systemStateAdjacencyListSlice;

export const { setAdjacencyList } = actions;

export default reducer;