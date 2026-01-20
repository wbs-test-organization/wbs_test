import { describe, it, expect } from 'vitest';
import roleReducer, { 
    setLoading, 
    setRoles, 
    setError, 
    clearError,
    RoleState 
} from '../redux/slice/roleSlice';
import { RoleProjectMemberResponse } from '../api/projectRoleAPI';

describe('roleSlice', () => {
    const initialState: RoleState = {
        roles: [],
        isLoading: false,
        error: null,
    };

    const mockRoles: RoleProjectMemberResponse[] = [
        { roleId: 1, roleName: 'Admin' },
        { roleId: 2, roleName: 'Developer' }
    ];

    it('nên trả về trạng thái mặc định khi action không xác định', () => {
        // Kiểm tra khởi tạo slice
        const state = roleReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    it('nên xử lý setLoading', () => {
        const state = roleReducer(initialState, setLoading(true));
        expect(state.isLoading).toBe(true);
        
        const nextState = roleReducer(state, setLoading(false));
        expect(nextState.isLoading).toBe(false);
    });

    it('nên xử lý setRoles và reset loading/error', () => {
        const previousState: RoleState = {
            roles: [],
            isLoading: true,
            error: 'Lỗi cũ'
        };

        const state = roleReducer(previousState, setRoles(mockRoles));

        expect(state.roles).toEqual(mockRoles);
        // Kiểm tra logic phối hợp: setRoles phải tắt loading và xóa error
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('nên xử lý setError và tắt loading', () => {
        const previousState: RoleState = {
            ...initialState,
            isLoading: true
        };
        const errorMessage = 'Không thể lấy dữ liệu Role';

        const state = roleReducer(previousState, setError(errorMessage));

        expect(state.error).toBe(errorMessage);
        expect(state.isLoading).toBe(false);
    });

    it('nên xử lý clearError', () => {
        const stateWithError: RoleState = {
            ...initialState,
            error: 'Đang có lỗi'
        };

        const state = roleReducer(stateWithError, clearError());
        expect(state.error).toBeNull();
    });

    it('nên đảm bảo tính bất biến (immutability) khi chạy chuỗi hành động', () => {
        let state = roleReducer(undefined, { type: '@@INIT' });

        // 1. Loading
        state = roleReducer(state, setLoading(true));
        // 2. Thành công
        state = roleReducer(state, setRoles(mockRoles));
        
        expect(state.roles).toHaveLength(2);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });
});