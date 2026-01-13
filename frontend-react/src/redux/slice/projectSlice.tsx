import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Project {
    projectId: number;
    projectCode: string;
    projectName: string;
    expectedStartDate?: string;
    expectedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    workProgress: number;
    estimateTime?: string;
    spentTime?: string;
    projectDeleteStatus: boolean;
    memberAuthorId?: number;
    authorFullName?: string;
    projectStatusId?: number;
    projectStatusName?: string; 
    projectLeadId?: number;
    projectLeadName?: string;
}

export interface ProjectState {
    projects: Project[];
    selectedProject: Project | null;
    isLoading : boolean;
    error: string | null;
}

const initialState : ProjectState = {
    projects: [],
    selectedProject: null,
    isLoading: false,
    error: null,
}

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProjects: (state, action: PayloadAction<Project[]>) => {
            state.projects = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setSelectedProject: (state, action: PayloadAction<Project>) => {
            state.selectedProject = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        addProject: (state, action: PayloadAction<Project>) => {
            state.projects.push(action.payload);
            state.isLoading = false;
            state.error = null;
        },
        updateProject: (state, action: PayloadAction<Project>) => {
            const index = state.projects.findIndex(project => project.projectId === action.payload.projectId);
            if(index !== -1) {
                state.projects[index] = action.payload;
            }
            state.isLoading = false;
            state.error = null;
        },
        removeProject: (state, action: PayloadAction<number>) => {
            state.projects = state.projects.filter(project => project.projectId !== action.payload)
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
        clearSelectedProject: (state) => {
            state.selectedProject = null;
        },
        reset: (state) => {
            Object.assign(state, initialState);
        },
    }
});

export const {
    setLoading,
    setProjects,
    setSelectedProject,
    addProject,
    updateProject,
    removeProject,
    setError,
    clearError,
    clearSelectedProject,
    reset,
} = projectSlice.actions;

export default projectSlice.reducer;