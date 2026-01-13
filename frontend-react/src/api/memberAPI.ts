import axios from "axios";
import { API_BASE_URL } from "../utils/constant";


export interface MemberListResponse {
    memberId: number;
    memberFullName: string;
}


export const getAllMembersAPI = async () => {
    try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/member`;
        const response = await axios.get<MemberListResponse[]>(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting all members", error);
        throw error;
    }
};