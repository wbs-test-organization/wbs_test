import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/auth/Register';
import { AuthService } from '../service/authService';
import { message } from 'antd';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock antd message một cách tối giản
vi.mock('antd', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    message: { success: vi.fn(), error: vi.fn() },
  };
});

// Mock API Service
vi.mock('../service/authService', () => ({
  AuthService: { register: vi.fn() },
}));

describe('Register Component Integration Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Đảm bảo cleanup DOM sạch sẽ trước mỗi lần chạy
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  const renderRegister = () => render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  /**
   * Helper: Điền Form siêu tốc bằng fireEvent
   * Lý do: userEvent.type giả lập gõ phím thật (chậm), fireEvent điền giá trị tức thì (nhanh).
   * Khi chạy chung nhiều file, việc dùng fireEvent giúp giảm tải CPU và tránh Timeout.
   */
  const fillFormFast = (overrides = {}) => {
    const data = {
      email: 'test@example.com',
      name: 'John Doe',
      username: 'johndoe',
      pass: '123456',
      confirm: '123456',
      ...overrides
    };

    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), { target: { value: data.email } });
    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: data.name } });
    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), { target: { value: data.username } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: data.pass } });
    fireEvent.change(screen.getByPlaceholderText('Enter confirm password'), { target: { value: data.confirm } });
  };

  // --- FULL TEST CASES ---

  it('1. Hiển thị đầy đủ giao diện ban đầu', () => {
    renderRegister();
    expect(screen.getByText(/Register WBBBSSS System/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('2. Ẩn/Hiện mật khẩu khi tương tác với biểu tượng mắt', () => {
    const { container } = renderRegister();
    const passInput = screen.getByPlaceholderText('Enter password');
    
    // Ant Design render icon toggle password là các button type="button"
    const toggles = container.querySelectorAll('button[type="button"]');

    expect(passInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggles[0]); // Click toggle pass
    expect(passInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggles[0]); // Click lại để ẩn
    expect(passInput).toHaveAttribute('type', 'password');
  });

  it('3. Thông báo lỗi khi mật khẩu xác nhận không khớp', async () => {
    renderRegister();
    fillFormFast({ pass: '123456', confirm: 'different_pass' });
    
    const submitBtn = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitBtn);

    // Sử dụng timeout 4500ms để đợi UI render kịp khi hệ thống bị nghẽn CPU
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Confirm password does not match!');
    }, { timeout: 4500 });
  });

  it('4. Đăng ký thành công và chuyển hướng về trang Login', async () => {
    const registerSpy = vi.mocked(AuthService.register).mockResolvedValue({ success: true });
    renderRegister();
    
    fillFormFast();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Registration successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 4500 });
  });

  it('5. Hiển thị thông báo lỗi từ server khi đăng ký thất bại', async () => {
    const apiError = 'Email already exists';
    vi.mocked(AuthService.register).mockResolvedValue({ 
      success: false, 
      error: apiError 
    });

    renderRegister();
    fillFormFast();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(apiError);
    }, { timeout: 4500 });
  });

  it('6. Hiển thị lỗi mặc định khi server lỗi mà không có thông điệp', async () => {
    vi.mocked(AuthService.register).mockResolvedValue({ success: false, error: '' });

    renderRegister();
    fillFormFast();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Registration failed. Please try again!');
    }, { timeout: 4500 });
  });

  it('7. Nút đăng ký bị vô hiệu hóa (disabled) khi đang xử lý API', async () => {
    // Tạo một promise "treo" không bao giờ trả về ngay lập tức
    const pendingPromise = new Promise(() => {}); 
    vi.mocked(AuthService.register).mockReturnValue(pendingPromise as any);

    renderRegister();
    fillFormFast();
    
    const btn = screen.getByRole('button', { name: /register/i });
    fireEvent.click(btn);

    // Kiểm tra trạng thái disabled của Ant Design Button
    await waitFor(() => {
      expect(btn).toBeDisabled();
    }, { timeout: 4500 });
  });
});