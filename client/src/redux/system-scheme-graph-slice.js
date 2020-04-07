import { createSlice } from "@reduxjs/toolkit";
import { DefaultSystemGraph } from "../utils/graph-data";

const systemSchemeGraphSlice = createSlice({
    name: "system-scheme-graph",
    initialState: {
        systemScheme: DefaultSystemGraph
    },
    reducers: {
        setSystemScheme(_, action) {
            return { systemScheme: action.payload.graph };
        }
    }
});

const { actions, reducer } = systemSchemeGraphSlice;

export const { setSystemScheme } = actions;

export default reducer;