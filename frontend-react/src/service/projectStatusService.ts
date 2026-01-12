import Store from "../store/Store";
import { getAllProjectStatusAPI, getProjectStatusByIdAPI } from "../api/projectStatusAPI";
import {
    setLoading,
    setProjectStatuses,
    setSelectedProjectStatus,
    setError,
} from "../redux/slice/projectStatusSlice";

const { dispatch } = Store;

export class ProjectStatusService {
    static async getAllProjectStatuses() {
        try {
            console.log("ProjectStatusService: Start fetch all project statuses");
            dispatch(setLoading(true));
            const projectStatuses = await getAllProjectStatusAPI();
            if (projectStatuses) {
                console.log("ProjectStatusService: Fetch project statuses successful");
                dispatch(setProjectStatuses(projectStatuses));
                return { success: true, data: projectStatuses };
            } else {
                console.log("ProjectStatusService: No data received");
                dispatch(setError("No project statuses found"));
                return { success: false, error: "No project statuses found" };
            } 
        } catch (err: unknown) {
            console.error("ProjectStatusService: Fetch project statuses error:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while fetching project statuses";

            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }

    static async getProjectStatusById(statusId: number) {
        try {
            console.log("ProjectStatusService: Start get project status by ID ", statusId);
            dispatch(setLoading(true));
            const projectStatus = await getProjectStatusByIdAPI(statusId);
            if (projectStatus) {
                console.log("ProjectStatusService: Get project status by ID successful");
                dispatch(setSelectedProjectStatus(projectStatus));
                return { success: true, data: projectStatus };
            } else {
                console.log("ProjectStatusService: No data received");
                dispatch(setError("No project status found"));
                return { success: false, error: "No project status found" };
            }
        } catch (err: unknown) {
            console.error("ProjectStatusService: Get project status by ID error:", err);

            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while get project status by ID";
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }
}
