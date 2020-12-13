import { createSlice } from "@reduxjs/toolkit";

const systemStateAdjacencyListSlice = createSlice({
    name: "systemStateAdjacencyList",
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