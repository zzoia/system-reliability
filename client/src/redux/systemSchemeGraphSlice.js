import { createSlice } from "@reduxjs/toolkit";
import { DefaultSystemGraph } from "../utils/GraphData";

const systemSchemeGraphSlice = createSlice({
    name: "systemSchemeGraph",
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