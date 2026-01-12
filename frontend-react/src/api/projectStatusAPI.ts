import axios from "axios";
import { API_BASE_URL } from "../utils/constant";

export interface ProjectStatusResponse {
    projectStatusId: number;
    statusName: string;
    statusDescription?: string;
    statusColor?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export const getAllProjectStatusAPI = async () => {
    try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/projectstatus`;
        const response = await axios.get<ProjectStatusResponse[]>(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting all project status", error);
        throw error;
    }
};

export const getProjectStatusByIdAPI = async (statusId: number) => {
    try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/projectstatus/${statusId}`;
        const response = await axios.get<ProjectStatusResponse>(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting project status by name", error);
        throw error;
    }
};