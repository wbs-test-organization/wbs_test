import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProjectStatusResponse {
    projectStatusId: number;
    statusName: string;
    statusDescription?: string;
    statusColor?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface ProjectStatusState {
    projectStatuses: ProjectStatusResponse[];
    selectedStatus: ProjectStatusResponse | null;
    isLoading : boolean;
    error: string | null;
}

const initialState : ProjectStatusState = {
    projectStatuses: [],
    selectedStatus: null,
    isLoading: false,
    error: null,
}

const projectStatusSlice = createSlice({
    name: 'projectStatus',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProjectStatuses: (state, action: PayloadAction<ProjectStatusResponse[]>) => {
            state.projectStatuses = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setSelectedProjectStatus: (state, action: PayloadAction<ProjectStatusResponse>) => {
            state.selectedStatus = action.payload;
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
export const { setLoading, setProjectStatuses, setSelectedProjectStatus, setError, clearError } = projectStatusSlice.actions;
export default projectStatusSlice.reducer;