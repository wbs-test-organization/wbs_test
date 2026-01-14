import Store from "../store/Store";
import { getAllProjectAPI, createProjectAPI, type CreateProjectRequest, type UpdateProjectRequest, updateProjectAPI, getProjectByIdAPI, deleteProjectAPI, getProjectsByMemberIdAPI } from "../api/projectAPI";
import {
    setLoading,
    setProjects,
    setSelectedProject,
    addProject,
    updateProject,
    setError,
    removeProject,
} from "../redux/slice/projectSlice";

const { dispatch } = Store;

export class ProjectService {
    static async getAllProjects() {
        try {
            console.log("ProjectService: Start fetch all projects");
            dispatch(setLoading(true));
            const projects = await getAllProjectAPI();

            if (projects) {
                console.log("ProjectService: Fetch projects successful");
                dispatch(setProjects(projects));
                return { success: true, data: projects };
            } else {
                console.log("ProjectService: No data received");
                dispatch(setError("No projects found"));
                return { success: false, error: "No projects found" };
            }
        } catch (err: unknown) {
            console.error("ProjectService: Fetch projects error:", err);

            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while fetching projects";

            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }

    static async getProjectById(projectId: number) {
        try {
            console.log("ProjectService: Start get project by ", projectId);
            dispatch(setLoading(true));
            const project = await getProjectByIdAPI(projectId);

            if (project) {
                console.log("ProjectService: Get project by id successful");
                dispatch(setSelectedProject(project));
                return { success: true, data: project };
            } else {
                console.log("ProjectService: No data received");
                dispatch(setError("No projects found"));
                return { success: false, error: "No project found" };
            }
        } catch (err: unknown) {
            console.error("ProjectService: Get project by id error:", err);

            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while get project by id";

            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }

    static async createProject(projectData: CreateProjectRequest) {
        try {
            console.log("ProjectService: Start creating project", projectData);
            dispatch(setLoading(true));

            const response = await createProjectAPI(projectData);

            if (response) {
                console.log("ProjectService: Project created successfully", response);
                dispatch(addProject(response));
                return { success: true, data: response };
            } else {
                throw new Error("Failed to create project - empty response");
            }
        } catch (err: unknown) {
            console.error("ProjectService: Create project failed", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while creating project";

            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }

    static async updateProject(projectId: number, projectData: UpdateProjectRequest) {
        try {
            console.log("ProjectService: Start updating project");
            dispatch(setLoading(true));

            const response = await updateProjectAPI(projectId, projectData);

            if (response) {
                console.log("ProjectService: Project updated successfully", response);
                dispatch(updateProject(response));
                return { success: true, data: response };
            } else {
                throw new Error("Failed to update project - empty response");
            }
        } catch (err: unknown) {
            console.error("ProjectService: Update project failed", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while updating project";

            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }

    static async deleteProject(projectId: number) {
        try {
            console.log("ProjectService: Start deleting project", projectId);
            dispatch(setLoading(true));

            const success = await deleteProjectAPI(projectId);
            if (success) {
                console.log("ProjectService: Project deleted successfully");
                dispatch(removeProject(projectId));
                return { success: true };
            } else {
                console.log("ProjectService: Project not found or already deleted");
                dispatch(setError("Project not found or already deleted"));
                return { success: false, error: "Project not found or already deleted" };
            }
        } catch (err: unknown) {
            console.error("ProjectService: Delete project error:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Delete project error";
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }

    static async getProjectsByMemberId(memberId: number) {
        try {
            console.log("ProjectService: Start fetch projects by member id");
            dispatch(setLoading(true));
            const projects = await getProjectsByMemberIdAPI(memberId);
            if (projects) {
                console.log("ProjectService: Fetch projects by member id successful");
                dispatch(setProjects(projects));
                return { success: true, data: projects };
            } else {
                console.log("ProjectService: No data received");
                dispatch(setError("No projects found"));
                return { success: false, error: "No projects found" };
            }
        } catch (err: unknown) {
            console.error("ProjectService: Fetch projects by member id error:", err);

            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while fetching projects by member id";
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }
}