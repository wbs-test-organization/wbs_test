import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoleProjectMemberResponse } from "../../api/projectRoleAPI";

export interface RoleState {
    roles: RoleProjectMemberResponse[];
    isLoading : boolean;
    error: string | null;
}

const initialState : RoleState = {
    roles: [],
    isLoading: false,
    error: null,
}

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setRoles: (state, action: PayloadAction<RoleProjectMemberResponse[]>) => {
            state.roles = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;   
            state.isLoading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    }
});

export const { setLoading, setRoles, setError, clearError } = roleSlice.actions;

export default roleSlice.reducer;