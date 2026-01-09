import { describe, it, expect } from 'vitest';
import projectReducer, {
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
    type ProjectState
} from '../redux/slice/projectSlice';

const mockProject = {
    projectId: 1,
    projectCode: "PRJ001",
    projectName: "Test Project",
    expectedStartDate: "2026-01-01T00:00:00",
    expectedEndDate: "2026-12-31T00:00:00",
    workProgress: 0,
    projectDeleteStatus: false,
    memberAuthorId: 1,
    authorFullName: "John Doe",
    projectStatusId: 1,
    projectStatusName: "Open"
};

const mockProject2 = {
    projectId: 2,
    projectCode: "PRJ002",
    projectName: "Second Project",
    expectedStartDate: "2026-02-01T00:00:00",
    expectedEndDate: "2026-06-30T00:00:00",
    workProgress: 50,
    projectDeleteStatus: false,
    memberAuthorId: 2,
    authorFullName: "Jane Smith",
    projectStatusId: 2,
    projectStatusName: "In Progress"
};

const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    isLoading: false,
    error: null,
};

describe('projectSlice', () => {
    describe('initial state', () => {
        it('should return the initial state', () => {
            expect(projectReducer(undefined, { type: 'unknown' })).toEqual(initialState);
        });
    });

    describe('setLoading', () => {
        it('should set isLoading to true', () => {
            const state = projectReducer(initialState, setLoading(true));
            expect(state.isLoading).toBe(true);
        });

        it('should set isLoading to false', () => {
            const state = projectReducer({ ...initialState, isLoading: true }, setLoading(false));
            expect(state.isLoading).toBe(false);
        });
    });

    describe('setProjects', () => {
        it('should set projects array and reset loading/error', () => {
            const projects = [mockProject, mockProject2];
            const state = projectReducer(
                { ...initialState, isLoading: true, error: 'Some error' },
                setProjects(projects)
            );

            expect(state.projects).toEqual(projects);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        it('should replace existing projects', () => {
            const existingState = { ...initialState, projects: [mockProject] };
            const newProjects = [mockProject2];
            const state = projectReducer(existingState, setProjects(newProjects));

            expect(state.projects).toEqual(newProjects);
            expect(state.projects).toHaveLength(1);
        });

        it('should handle empty array', () => {
            const state = projectReducer(
                { ...initialState, projects: [mockProject] },
                setProjects([])
            );

            expect(state.projects).toEqual([]);
            expect(state.projects).toHaveLength(0);
        });
    });

    describe('setSelectedProject', () => {
        it('should set selected project and reset loading/error', () => {
            const state = projectReducer(
                { ...initialState, isLoading: true, error: 'Some error' },
                setSelectedProject(mockProject)
            );

            expect(state.selectedProject).toEqual(mockProject);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        it('should replace existing selected project', () => {
            const existingState = { ...initialState, selectedProject: mockProject };
            const state = projectReducer(existingState, setSelectedProject(mockProject2));

            expect(state.selectedProject).toEqual(mockProject2);
        });
    });

    describe('addProject', () => {
        it('should add new project to empty array', () => {
            const state = projectReducer(initialState, addProject(mockProject));

            expect(state.projects).toHaveLength(1);
            expect(state.projects[0]).toEqual(mockProject);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        it('should add new project to existing array', () => {
            const existingState = { ...initialState, projects: [mockProject] };
            const state = projectReducer(existingState, addProject(mockProject2));

            expect(state.projects).toHaveLength(2);
            expect(state.projects[1]).toEqual(mockProject2);
        });

        it('should reset loading and error when adding project', () => {
            const existingState = { ...initialState, isLoading: true, error: 'Error' };
            const state = projectReducer(existingState, addProject(mockProject));

            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });
    });

    describe('updateProject', () => {
        it('should update existing project', () => {
            const existingState = { ...initialState, projects: [mockProject, mockProject2] };
            const updatedProject = { ...mockProject, projectName: "Updated Project" };
            const state = projectReducer(existingState, updateProject(updatedProject));

            expect(state.projects[0].projectName).toBe("Updated Project");
            expect(state.projects[0].projectId).toBe(1);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        it('should not modify array if project not found', () => {
            const existingState = { ...initialState, projects: [mockProject] };
            const nonExistentProject = { ...mockProject, projectId: 999 };
            const state = projectReducer(existingState, updateProject(nonExistentProject));

            expect(state.projects).toEqual([mockProject]);
            expect(state.projects).toHaveLength(1);
        });

        it('should update only the matching project', () => {
            const existingState = { ...initialState, projects: [mockProject, mockProject2] };
            const updatedProject = { ...mockProject2, workProgress: 75 };
            const state = projectReducer(existingState, updateProject(updatedProject));

            expect(state.projects[0]).toEqual(mockProject); // Unchanged
            expect(state.projects[1].workProgress).toBe(75); // Changed
        });
    });

    describe('removeProject', () => {
        it('should remove project by id', () => {
            const existingState = { ...initialState, projects: [mockProject, mockProject2] };
            const state = projectReducer(existingState, removeProject(1));

            expect(state.projects).toHaveLength(1);
            expect(state.projects[0]).toEqual(mockProject2);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });

        it('should not modify array if project not found', () => {
            const existingState = { ...initialState, projects: [mockProject] };
            const state = projectReducer(existingState, removeProject(999));

            expect(state.projects).toEqual([mockProject]);
            expect(state.projects).toHaveLength(1);
        });

        it('should handle removing from empty array', () => {
            const state = projectReducer(initialState, removeProject(1));

            expect(state.projects).toEqual([]);
        });

        it('should remove only the matching project', () => {
            const existingState = { ...initialState, projects: [mockProject, mockProject2] };
            const state = projectReducer(existingState, removeProject(2));

            expect(state.projects).toHaveLength(1);
            expect(state.projects[0]).toEqual(mockProject);
        });
    });

    describe('setError', () => {
        it('should set error message and stop loading', () => {
            const errorMessage = "Network error occurred";
            const state = projectReducer(
                { ...initialState, isLoading: true },
                setError(errorMessage)
            );

            expect(state.error).toBe(errorMessage);
            expect(state.isLoading).toBe(false);
        });

        it('should replace existing error', () => {
            const existingState = { ...initialState, error: "Old error" };
            const state = projectReducer(existingState, setError("New error"));

            expect(state.error).toBe("New error");
        });
    });

    describe('clearError', () => {
        it('should clear error message', () => {
            const existingState = { ...initialState, error: "Some error" };
            const state = projectReducer(existingState, clearError());

            expect(state.error).toBe(null);
        });

        it('should not affect other state properties', () => {
            const existingState = {
                ...initialState,
                projects: [mockProject],
                selectedProject: mockProject,
                isLoading: true,
                error: "Error"
            };
            const state = projectReducer(existingState, clearError());

            expect(state.error).toBe(null);
            expect(state.projects).toEqual([mockProject]);
            expect(state.selectedProject).toEqual(mockProject);
            expect(state.isLoading).toBe(true);
        });
    });

    describe('clearSelectedProject', () => {
        it('should clear selected project', () => {
            const existingState = { ...initialState, selectedProject: mockProject };
            const state = projectReducer(existingState, clearSelectedProject());

            expect(state.selectedProject).toBe(null);
        });

        it('should not affect other state properties', () => {
            const existingState = {
                ...initialState,
                projects: [mockProject],
                selectedProject: mockProject,
                isLoading: true,
                error: "Error"
            };
            const state = projectReducer(existingState, clearSelectedProject());

            expect(state.selectedProject).toBe(null);
            expect(state.projects).toEqual([mockProject]);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBe("Error");
        });
    });

    describe('reset', () => {
        it('should reset to initial state', () => {
            const existingState = {
                projects: [mockProject, mockProject2],
                selectedProject: mockProject,
                isLoading: true,
                error: "Some error"
            };
            const state = projectReducer(existingState, reset());

            expect(state).toEqual(initialState);
        });

        it('should reset all properties to default values', () => {
            const existingState = {
                projects: [mockProject],
                selectedProject: mockProject,
                isLoading: true,
                error: "Error"
            };
            const state = projectReducer(existingState, reset());

            expect(state.projects).toEqual([]);
            expect(state.selectedProject).toBe(null);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(null);
        });
    });

    describe('complex scenarios', () => {
        it('should handle multiple actions in sequence', () => {
            let state = initialState;

            // Add projects
            state = projectReducer(state, addProject(mockProject));
            state = projectReducer(state, addProject(mockProject2));
            expect(state.projects).toHaveLength(2);

            // Select a project
            state = projectReducer(state, setSelectedProject(mockProject));
            expect(state.selectedProject).toEqual(mockProject);

            // Update a project
            const updated = { ...mockProject, projectName: "Updated" };
            state = projectReducer(state, updateProject(updated));
            expect(state.projects[0].projectName).toBe("Updated");

            // Set error
            state = projectReducer(state, setError("Error"));
            expect(state.error).toBe("Error");

            // Clear error
            state = projectReducer(state, clearError());
            expect(state.error).toBe(null);

            // Remove project
            state = projectReducer(state, removeProject(1));
            expect(state.projects).toHaveLength(1);

            // Reset
            state = projectReducer(state, reset());
            expect(state).toEqual(initialState);
        });

        it('should maintain immutability - original state unchanged', () => {
            const originalState = { ...initialState, projects: [mockProject] };
            const stateCopy = JSON.parse(JSON.stringify(originalState));

            projectReducer(originalState, addProject(mockProject2));

            // Original state should remain unchanged
            expect(originalState.projects).toHaveLength(1);
            expect(JSON.stringify(originalState)).toBe(JSON.stringify(stateCopy));
        });

        it('should handle edge case: update then remove same project', () => {
            let state = { ...initialState, projects: [mockProject, mockProject2] };

            const updated = { ...mockProject, projectName: "Updated" };
            state = projectReducer(state, updateProject(updated));
            expect(state.projects[0].projectName).toBe("Updated");

            state = projectReducer(state, removeProject(1));
            expect(state.projects).toHaveLength(1);
            expect(state.projects[0]).toEqual(mockProject2);
        });
    });
});