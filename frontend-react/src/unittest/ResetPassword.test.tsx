import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as routerDom from 'react-router-dom';
import ResetPassword from '../pages/auth/ResetPassword';
import { AuthService } from '../service/authService';
import { message } from 'antd';

// 1. Mock dependencies
vi.mock('../service/authService', () => ({
  AuthService: { resetPassword: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: { success: vi.fn(), error: vi.fn() },
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('Reset Password Page', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Luôn bắt đầu bằng Real Timers
    vi.spyOn(routerDom, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const setupMockParams = (email: string | null, code: string | null) => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (code) params.set('code', code);
    vi.spyOn(routerDom, 'useSearchParams').mockReturnValue([params, vi.fn()]);
  };

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

  it('nên reset thành công và tự động chuyển hướng sau 2 giây', async () => {
    // A. Thiết lập mock data
    setupMockParams('test@example.com', 'abc123');
    const resetPromise = Promise.resolve({ success: true, error: '' });
    vi.mocked(AuthService.resetPassword).mockReturnValue(resetPromise);

    renderComponent();

    // B. Điền form bằng fireEvent (nhanh và không bị treo bởi timers)
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: 'Password123!' } });

    // C. Bật Fake Timers NGAY TRƯỚC KHI click nút dẫn đến setTimeout
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    // D. Giải quyết các microtasks (như Promise của API)
    await vi.runAllTimersAsync();

    // E. Kiểm tra message thành công
    expect(message.success).toHaveBeenCalledWith('Change password successfull. Navigate to login');

    // F. Tua thời gian để kích hoạt chuyển hướng
    vi.advanceTimersByTime(2000);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('nên báo lỗi nếu thiếu thông tin params', async () => {
    setupMockParams(null, null);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Link không hợp lệ hoặc thiếu thông tin.');
    });
  });
  it('nên chuyển đổi trạng thái ẩn/hiện mật khẩu (Coverage State)', async () => {
    setupMockParams('test@example.com', '123');
    renderComponent();

    const passInput = screen.getByPlaceholderText('Enter password');
    const toggleIcons = screen.getAllByRole('img', { hidden: true }).filter(img =>
      img.classList.contains('anticon-eye-invisible')
    );

    expect(passInput).toHaveAttribute('type', 'password');

    // Click icon hiển thị của Password field
    fireEvent.click(toggleIcons[0]);
    expect(passInput).toHaveAttribute('type', 'text');
  });
  it('nên hiển thị lỗi link không hợp lệ (Coverage Line 21-24)', async () => {
    setupMockParams(null, 'code_only');
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: 'Pass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Link không hợp lệ hoặc thiếu thông tin.');
    });
  });
  // --- CÁC TEST CASE BỔ SUNG ĐỂ ĐẠT 100% COVERAGE ---

  it('nên hiển thị lỗi validate nếu mật khẩu không khớp (Coverage Branch Validator)', async () => {
    setupMockParams('test@example.com', '123');
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: 'KhongKhop123!' } });

    // Trigger submit để antd chạy validator
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    // Kiểm tra text báo lỗi từ validator reject
    await waitFor(() => {
      expect(screen.getByText('The two passwords do not match!')).toBeInTheDocument();
    });
    expect(AuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('nên hiển thị lỗi mặc định khi API trả về success false mà không có error message (Coverage Line 37)', async () => {
    setupMockParams('test@example.com', '123');
    // Mock API trả về thành công giả nhưng success: false và error rỗng
    vi.mocked(AuthService.resetPassword).mockResolvedValue({ success: false, error: '' });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: 'Pass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Change password failed');
    });
  });
  it('nên chuyển đổi ẩn/hiện cho cả Confirm Password (Coverage State)', async () => {
    setupMockParams('test@example.com', '123');
    renderComponent();

    const confirmInput = screen.getByPlaceholderText('Enter confirm password');
    // Tìm icon invisible thứ 2 (của confirm password)
    const toggleIcons = screen.getAllByRole('img', { hidden: true }).filter(img =>
      img.classList.contains('anticon-eye-invisible')
    );

    expect(confirmInput).toHaveAttribute('type', 'password');

    // Click icon của ô confirm
    if (toggleIcons[1]) {
      fireEvent.click(toggleIcons[1]);
      expect(confirmInput).toHaveAttribute('type', 'text');
    }
  });
});