import axios from "axios";

export interface ProjectResponse {
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
}

export const getAllProjectAPI = async () => {
    try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:5075/api/project`;
        const response = await axios.get<ProjectResponse[]>(url, {
            headers: {
                Authorization : `Bearer ${token}`, 
            },
        });
        return response.data;
    } catch (error){
        console.error("Error getting all project", error);
        throw error;
    }
};