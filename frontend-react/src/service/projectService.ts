import Store from "../store/Store";
import { getAllProjectAPI } from "../api/projectAPI"; 
import { 
    setLoading, 
    setProjects, 
    setError, 
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

}