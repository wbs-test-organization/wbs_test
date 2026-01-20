import { describe, it, expect } from 'vitest';
import projectMemberReducer, {
  setLoading,
  setProjectMembers,
  addMember,
  setError,
  clearError,
  ProjectMemberState
} from '../redux/slice/projectMemberSlice';
import { ProjectMemberResponse } from '../api/projectMemberAPI';

describe('projectMemberSlice', () => {
  const initialState: ProjectMemberState = {
    projectMembers: [],
    isLoading: false,
    error: null,
  };

  const mockMember: ProjectMemberResponse = {
    mediateProjectMemberId: 1,
    memberId: 101,
    memberFullName: 'Nguyen Van A',
    roleId: 1,
    roleName: 'Developer',
    isCurrent: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  };

  it('nên trả về state khởi tạo khi action không xác định', () => {
    const state = projectMemberReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('nên xử lý setLoading', () => {
    const state = projectMemberReducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);
  });

  it('nên xử lý setProjectMembers và reset loading/error', () => {
    const previousState: ProjectMemberState = {
      projectMembers: [],
      isLoading: true,
      error: 'Cũ',
    };
    const state = projectMemberReducer(previousState, setProjectMembers([mockMember]));

    expect(state.projectMembers).toEqual([mockMember]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('nên xử lý addMember (push vào mảng hiện có)', () => {
    const state = projectMemberReducer(initialState, addMember(mockMember));

    expect(state.projectMembers).toHaveLength(1);
    expect(state.projectMembers[0]).toEqual(mockMember);
    expect(state.isLoading).toBe(false);
  });

  it('nên xử lý setError và dừng loading', () => {
    const previousState = { ...initialState, isLoading: true };
    const state = projectMemberReducer(previousState, setError('Lỗi hệ thống'));

    expect(state.error).toBe('Lỗi hệ thống');
    expect(state.isLoading).toBe(false);
  });

  it('nên xử lý clearError', () => {
    const stateWithError = { ...initialState, error: 'Lỗi' };
    const state = projectMemberReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });

  it('nên xử lý chuỗi hành động phức tạp (Integration-like flow)', () => {
    let state = projectMemberReducer(undefined, { type: '@@INIT' });

    // Bắt đầu load
    state = projectMemberReducer(state, setLoading(true));

    // Nhận danh sách ban đầu
    state = projectMemberReducer(state, setProjectMembers([mockMember]));

    // Thêm một thành viên mới
    const newMember = { ...mockMember, mediateProjectMemberId: 2, memberId: 102 };
    state = projectMemberReducer(state, addMember(newMember));

    expect(state.projectMembers).toHaveLength(2);
    expect(state.projectMembers[1].memberId).toBe(102);
  });
});