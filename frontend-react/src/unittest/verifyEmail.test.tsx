import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as routerDom from 'react-router-dom'; 
import VerifyEmailPage from '../pages/auth/verifyEmail';
import { AuthService } from '../service/authService';

// 1. Mock các dependencies
vi.mock('../service/authService', () => ({
  AuthService: {
    verifyEmail: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

describe('VerifyEmailPage Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Mặc định dùng fake timers cho toàn bộ suite
    vi.spyOn(routerDom, 'useNavigate').mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Hàm helper để giả lập URL params (?email=...&code=...)
  const setupMockParams = (email: string | null, code: string | null) => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (code) params.set('code', code);
    vi.spyOn(routerDom, 'useSearchParams').mockReturnValue([params, vi.fn()]);
  };

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    );

  // --- TEST CASES ---

  it('nên dừng lại (early return) nếu thiếu email hoặc code (Line 16)', () => {
    setupMockParams('test@gmail.com', null); // Thiếu code
    renderComponent();

    expect(screen.getByText(/Đang xác thực.../i)).toBeInTheDocument();
    // Đảm bảo API không bao giờ được gọi
    expect(AuthService.verifyEmail).not.toHaveBeenCalled();
  });

  it('nên hiển thị thông báo thành công và tự động chuyển hướng sau 3 giây', async () => {
    setupMockParams('test@gmail.com', '123456');
    vi.mocked(AuthService.verifyEmail).mockResolvedValue({ success: true, error: '' });

    renderComponent();
    await vi.runAllTimersAsync();

    expect(screen.getByText(/Xác thực thành công!/i)).toBeInTheDocument();

    vi.advanceTimersByTime(3000);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('nên chuyển hướng ngay lập tức khi nhấn nút "Đăng nhập ngay"', async () => {
    // Với tương tác người dùng (click), dùng Real Timers sẽ ổn định hơn
    vi.useRealTimers();
    setupMockParams('test@gmail.com', '123456');
    vi.mocked(AuthService.verifyEmail).mockResolvedValue({ success: true, error: '' });

    renderComponent();

    const btn = await screen.findByRole('button', { name: /Đăng nhập ngay/i });
    await userEvent.click(btn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('nên hiển thị lỗi mặc định nếu API trả về success: false mà không có message (Line 30)', async () => {
    vi.useRealTimers();
    setupMockParams('test@gmail.com', '123456');
    vi.mocked(AuthService.verifyEmail).mockResolvedValue({
      success: false,
      error: '', // Không có lỗi cụ thể từ server
    });

    renderComponent();

    const errorMsg = await screen.findByText(/Xác thực thất bại. Vui lòng thử lại./i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('nên hiển thị lỗi từ API và quay lại trang đăng ký khi nhấn nút', async () => {
    vi.useRealTimers();
    setupMockParams('test@gmail.com', '123456');
    const customError = 'Mã code đã hết hạn';
    vi.mocked(AuthService.verifyEmail).mockResolvedValue({
      success: false,
      error: customError,
    });

    renderComponent();

    expect(await screen.findByText(customError)).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /Quay lại đăng ký/i });
    await userEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('nên xử lý lỗi ngoại lệ (catch block) và log ra console (Lines 37-39)', async () => {
    vi.useRealTimers();
    setupMockParams('test@gmail.com', '123456');
    
    // Mock console.log để không làm bẩn terminal test
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Giả lập lỗi kết nối (API crash)
    vi.mocked(AuthService.verifyEmail).mockRejectedValue(new Error('Network Crash'));

    renderComponent();

    expect(await screen.findByText(/Có lỗi xảy ra trong quá trình xác thực./i)).toBeInTheDocument();
    
    // Kiểm tra xem console.log có được gọi đúng nội dung không
    expect(consoleSpy).toHaveBeenCalledWith("Error when verigy email", expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});