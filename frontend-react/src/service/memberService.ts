import Store from "../store/Store";
import { getAllMembersAPI } from "../api/memberAPI";
import {setLoading, setMembers, setError, } from "../redux/slice/memberSlice";

const { dispatch } = Store;

export class MemberService {
    static async getAllMembers() {
        try {
            console.log("MemberService: Start fetch all members");
            dispatch(setLoading(true));
            const members = await getAllMembersAPI();
            if (members) {
                console.log("MemberService: Fetch members successful");
                dispatch(setMembers(members));
                return { success: true, data: members };
            } else {
                console.log("MemberService: No data received");
                dispatch(setError("No members found"));
                return { success: false, error: "No members found" };
            }
        } catch (err: unknown) {
            console.error("MemberService: Fetch members error:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred while fetching members";
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    }
}