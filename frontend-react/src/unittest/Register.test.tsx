import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock('../service/authService', () => ({
  AuthService: { register: vi.fn() },
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => render(
    <MemoryRouter><Register /></MemoryRouter>
  );

  // Helper function: Điền đầy đủ tất cả các trường để pass qua Form Validation
  const fillAllFields = async (user: any, overrides = {}) => {
    const defaultData = {
      email: 'test@gmail.com',
      name: 'Test User',
      user: 'testusername',
      pass: '123456',
      confirm: '123456'
    };
    const data = { ...defaultData, ...overrides };

    await user.type(screen.getByPlaceholderText(/Enter email/i), data.email);
    await user.type(screen.getByPlaceholderText(/Enter full name/i), data.name);
    await user.type(screen.getByPlaceholderText(/Enter username/i), data.user);
    await user.type(screen.getByPlaceholderText('Enter password'), data.pass);
    await user.type(screen.getByPlaceholderText('Enter confirm password'), data.confirm);
  };

  // --- TEST CASES ---

  it('hiển thị đầy đủ các trường nhập liệu và nút đăng ký', () => {
    renderRegister();
    expect(screen.getByText(/Register WBBBSSS System/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('hiển thị lỗi nếu mật khẩu xác nhận không khớp', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    // Điền mật khẩu không khớp
    await fillAllFields(user, { pass: '123456', confirm: '654321' });

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Confirm password does not match!');
    });
  });

  it('gọi AuthService.register và chuyển hướng khi đăng ký thành công', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthService.register).mockResolvedValue({ success: true });

    renderRegister();
    await fillAllFields(user);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(AuthService.register).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Registration successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('hiển thị thông báo lỗi cụ thể từ API khi đăng ký thất bại', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthService.register).mockResolvedValue({ 
      success: false, 
      error: 'Username already taken' 
    });

    renderRegister();
    await fillAllFields(user); // Phải điền đủ để qua validation của Form

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Username already taken');
    });
  });

  it('hiển thị thông báo lỗi mặc định khi API thất bại mà không có message', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthService.register).mockResolvedValue({ 
      success: false, 
      error: "" // Test nhánh rỗng để phủ dòng 47
    });

    renderRegister();
    await fillAllFields(user);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Registration failed. Please try again!');
    });
  });

  it('thay đổi trạng thái ẩn hiện mật khẩu cho cả hai ô Password và Confirm Password', async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    const passwordInput = screen.getByPlaceholderText('Enter password');
    const confirmInput = screen.getByPlaceholderText('Enter confirm password');
    
    // Tìm button theo type="button" và class focus:outline-none của bạn
    const toggleButtons = container.querySelectorAll('button[type="button"]'); 

    // Test ô Password
    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Test ô Confirm Password
    expect(confirmInput).toHaveAttribute('type', 'password');
    await user.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('vô hiệu hóa nút và hiển thị trạng thái loading khi đang xử lý', async () => {
    const user = userEvent.setup();
    
    // Tạo một promise treo để giữ trạng thái loading
    let resolveApi: any;
    const pendingPromise = new Promise((resolve) => { resolveApi = resolve; });
    vi.mocked(AuthService.register).mockReturnValue(pendingPromise as any);

    renderRegister();
    await fillAllFields(user);

    const registerBtn = screen.getByRole('button', { name: /register/i });
    await user.click(registerBtn);

    // Ant Design Button khi disabled sẽ có thuộc tính disabled
    await waitFor(() => {
      expect(registerBtn).toBeDisabled();
      expect(screen.getByText(/Registering.../i)).toBeInTheDocument();
    });

    // Giải phóng để kết thúc test
    resolveApi({ success: true });
  });
});