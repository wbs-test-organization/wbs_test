import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type ProjectMemberResponse } from '../../api/projectMemberAPI';

export interface ProjectMemberState {
    projectMembers: ProjectMemberResponse[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProjectMemberState = {
    projectMembers: [],
    isLoading: false,
    error: null,
};

const projectMemberSlice = createSlice({
    name: 'projectMember',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProjectMembers: (state, action: PayloadAction<ProjectMemberResponse[]>) => {
            state.projectMembers = action.payload;
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
    },
});

export const { setLoading, setProjectMembers, setError, clearError } = projectMemberSlice.actions;
export default projectMemberSlice.reducer;