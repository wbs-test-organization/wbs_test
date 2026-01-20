import { describe, it, expect } from 'vitest';
import memberReducer, { 
  setMembers, 
  setLoading, 
  setError, 
  clearError,
  MemberListResponse,
} from '../redux/slice/memberSlice';

describe('memberSlice', () => {
  const initialState = {
    members: [] as MemberListResponse[],
    isLoading: false,
    error: null as string | null,
  };

  it('nên trả về state mặc định khi action không xác định (Default Case)', () => {
    const state = memberReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('nên xử lý setLoading (Cập nhật đơn lẻ)', () => {
    const state = memberReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);
    
    const nextState = memberReducer(state, setLoading(false));
    expect(nextState.isLoading).toBe(false);
  });

  it('nên xử lý setMembers và reset các trạng thái khác (Logic phối hợp)', () => {
    const previousState = {
      members: [],
      isLoading: true,
      error: 'Old error',
    };

    const mockMembers: MemberListResponse[] = [
      { memberId: 1, memberFullName: 'Nguyen Van A' },
    ];

    const state = memberReducer(previousState, setMembers(mockMembers));

    expect(state.members).toEqual(mockMembers);
    // Kiểm tra logic phối hợp bên trong reducer setMembers
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('nên xử lý setError và tắt loading', () => {
    const previousState = { ...initialState, isLoading: true };
    const errorMessage = 'Lỗi kết nối server';
    
    const state = memberReducer(previousState, setError(errorMessage));

    expect(state.error).toBe(errorMessage);
    expect(state.isLoading).toBe(false);
  });

  it('nên xử lý clearError', () => {
    const stateWithError = { ...initialState, error: 'Lỗi cần xóa' };
    const state = memberReducer(stateWithError, clearError());
    
    expect(state.error).toBe(null);
  });

  it('nên thực hiện chuỗi hành động liên tục (Sequence Test)', () => {
    let state = { ...initialState };

    // 1. Bắt đầu load
    state = memberReducer(state, setLoading(true));
    expect(state.isLoading).toBe(true);

    // 2. Load thất bại
    state = memberReducer(state, setError('Lỗi mạng'));
    expect(state.error).toBe('Lỗi mạng');
    expect(state.isLoading).toBe(false);

    // 3. Thử lại và thành công
    const mockMembers: MemberListResponse[] = [{ memberId: 101, memberFullName: 'John Doe' }];
    state = memberReducer(state, setMembers(mockMembers));
    
    expect(state.members).toEqual(mockMembers);
    expect(state.error).toBe(null); // Tự động clear error do logic trong setMembers
    expect(state.isLoading).toBe(false);
  });

  it('nên xử lý mảng members rỗng', () => {
    const state = memberReducer(initialState, setMembers([]));
    expect(state.members).toHaveLength(0);
    expect(state.members).toEqual([]);
  });
});