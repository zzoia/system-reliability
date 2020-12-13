import { createSlice } from "@reduxjs/toolkit";

const investigationRequestSlice = createSlice({
    name: "investigationRequest",
    initialState: {},
    reducers: {
        setInvestigationRequest(_, action) {
            return action.payload.investigationRequest;
        }
    }
});

const { actions, reducer } = investigationRequestSlice;

export const { setInvestigationRequest } = actions;

export default reducer;