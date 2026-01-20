import { describe, it, expect } from 'vitest';
import projectStatusReducer, {
    setLoading,
    setProjectStatuses,
    setSelectedProjectStatus,
    setError,
    clearError,
    ProjectStatusState
} from '../redux/slice/projectStatusSlice';

describe('projectStatusSlice', () => {
    const initialState: ProjectStatusState = {
        projectStatuses: [],
        selectedStatus: null,
        isLoading: false,
        error: null,
    };

    const mockStatus = {
        projectStatusId: 1,
        statusName: 'Active',
        statusDescription: 'Project is ongoing',
        statusColor: '#52c41a',
        sortOrder: 1,
        isActive: true,
    };

    it('nên trả về state khởi tạo khi action không xác định', () => {
        // Kiểm tra logic khởi tạo ban đầu của reducer
        const state = projectStatusReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    it('nên xử lý setLoading', () => {
        const state = projectStatusReducer(initialState, setLoading(true));
        expect(state.isLoading).toBe(true);
        
        const nextState = projectStatusReducer(state, setLoading(false));
        expect(nextState.isLoading).toBe(false);
    });

    it('nên xử lý setProjectStatuses và xóa lỗi/loading', () => {
        const previousState: ProjectStatusState = {
            ...initialState,
            isLoading: true,
            error: 'Cũ',
        };
        const mockList = [mockStatus];
        
        const state = projectStatusReducer(previousState, setProjectStatuses(mockList));

        expect(state.projectStatuses).toEqual(mockList);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('nên xử lý setSelectedProjectStatus', () => {
        const previousState: ProjectStatusState = {
            ...initialState,
            isLoading: true,
        };

        const state = projectStatusReducer(previousState, setSelectedProjectStatus(mockStatus));

        expect(state.selectedStatus).toEqual(mockStatus);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('nên xử lý setError và dừng loading', () => {
        const previousState = { ...initialState, isLoading: true };
        const errorMessage = 'Không thể tải danh sách trạng thái';
        
        const state = projectStatusReducer(previousState, setError(errorMessage));

        expect(state.error).toBe(errorMessage);
        expect(state.isLoading).toBe(false);
    });

    it('nên xử lý clearError', () => {
        const stateWithError = { ...initialState, error: 'Lỗi tạm thời' };
        const state = projectStatusReducer(stateWithError, clearError());
        
        expect(state.error).toBeNull();
    });

    it('nên thực hiện chuỗi hành động đúng thứ tự (Sequence)', () => {
        let state = projectStatusReducer(undefined, { type: '@@INIT' });

        // Bước 1: Bắt đầu tải
        state = projectStatusReducer(state, setLoading(true));
        expect(state.isLoading).toBe(true);

        // Bước 2: Tải lỗi
        state = projectStatusReducer(state, setError('API Error'));
        expect(state.error).toBe('API Error');

        // Bước 3: Tải lại thành công
        state = projectStatusReducer(state, setProjectStatuses([mockStatus]));
        expect(state.projectStatuses).toHaveLength(1);
        expect(state.error).toBeNull(); // Đảm bảo error được reset về null
        expect(state.isLoading).toBe(false); // Đảm bảo loading được reset về false
    });
});