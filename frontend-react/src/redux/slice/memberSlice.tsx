import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface MemberListResponse {
    memberId: number;
    memberFullName: string;
}

interface MemberListState {
    members: MemberListResponse[];
    isLoading : boolean;
    error: string | null;
}

const initialState : MemberListState = {
    members: [],
    isLoading: false,
    error: null,
}

const memberSlice = createSlice({
    name: 'member',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setMembers: (state, action: PayloadAction<MemberListResponse[]>) => {
            state.members = action.payload;
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
    }
});

export const { setLoading, setMembers, setError, clearError } = memberSlice.actions;

export default memberSlice.reducer;