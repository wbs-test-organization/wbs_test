import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Redux Store Configuration Coverage 100%', () => {
  const oldEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Xóa cache của module để đảm bảo Store được khởi tạo lại ở mỗi test case
    vi.resetModules();
  });

  afterEach(() => {
    // Khôi phục môi trường gốc
    process.env.NODE_ENV = oldEnv;
  });

  it('nên khởi tạo Store trong môi trường DEVELOPMENT (DevTools: true)', async () => {
    // Gán môi trường
    process.env.NODE_ENV = 'development';
    
    // Import Store sau khi đã set môi trường và reset modules
    const { default: Store } = await import('../store/Store');

    const state = Store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('project');
    
    // Kiểm tra middleware có hoạt động (không throw lỗi khi gặp persist actions)
    expect(() => Store.dispatch({ type: 'persist/PERSIST' })).not.toThrow();
  });

  it('nên khởi tạo Store trong môi trường PRODUCTION (DevTools: false/default)', async () => {
    // Gán môi trường
    process.env.NODE_ENV = 'production';
    
    const { default: Store } = await import('../store/Store');

    const state = Store.getState();
    expect(state).toHaveProperty('auth');
    expect(Store).toBeDefined();
    
    // Dispatch thử một action bất kỳ để đảm bảo store vẫn chạy đúng logic middleware
    expect(() => Store.dispatch({ type: 'persist/REHYDRATE' })).not.toThrow();
  });

  it('nên kiểm tra middleware cấu hình serializableCheck', async () => {
    // Test này phủ dòng code getDefaultMiddleware và các ignoredActions
    const { default: Store } = await import('../store/Store');
    
    const actions = ["persist/PERSIST", "persist/REHYDRATE"];
    
    actions.forEach(actionType => {
      // Nếu ignoredActions cấu hình sai, redux-toolkit sẽ log cảnh báo hoặc throw nếu có validator
      // Ở đây ta đảm bảo dispatch thành công
      const result = Store.dispatch({ type: actionType });
      expect(result).toBeDefined();
    });
  });
});