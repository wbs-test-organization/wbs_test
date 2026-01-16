import Store from "../store/Store";
import { getAllMembersByProjectIdAPI } from "../api/projectMemberAPI";
import { setProjectMembers, setError, setLoading } from "../redux/slice/projectMemberSlice";

const { dispatch } = Store;

export class ProjectMemberService {
    static async getAllMembersByProjectId(projectId: number) {
        try {
            console.log("ProjectMemberService: Start fetch all members by project ID ", projectId);
            dispatch(setLoading(true));
            const projectMembers = await getAllMembersByProjectIdAPI(projectId);
            if (projectMembers) {
                console.log("ProjectMemberService: Fetch project members successful");
                dispatch(setProjectMembers(projectMembers));
                return { success: true, data: projectMembers };
            } else {
                console.log("ProjectMemberService: No data received");
                dispatch(setError("No project members found"));
                return { success: false, error: "No project members found" };
            }
        } catch (err: unknown) {
            console.error("ProjectMemberService: Fetch project members error:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while fetching project members";
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }
}