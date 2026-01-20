import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/auth/ForgotPasssword'; // điều chỉnh đường dẫn nếu cần
import { AuthService } from '../service/authService';
import { message } from 'antd';

// 1. Fix môi trường JSDOM cho Ant Design
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

// 2. Mock dependencies
vi.mock('../service/authService', () => ({
  AuthService: {
    forgotPassword: vi.fn(),
  },
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('Forgot Password Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForgotPassword = () => {
    return render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
  };

  it('hiển thị form forgot password và hướng dẫn', () => {
    renderForgotPassword();

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(
      screen.getByText(/Please enter your email. The system will send you an email to change your password./i)
    ).toBeInTheDocument();

    expect(screen.getByText('Recovery email')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Enter your recovery email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go back to Login/i })).toHaveAttribute('href', '/login');
  });

  it('hiển thị lỗi required khi submit mà không nhập email', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.click(screen.getByRole('button', { name: /Confirm forgot password/i }));

    expect(AuthService.forgotPassword).not.toHaveBeenCalled();
  });

  it('hiển thị lỗi định dạng email không hợp lệ', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    const emailInput = screen.getByPlaceholderText('Enter your recovery email');
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /Confirm forgot password/i }));

    expect(AuthService.forgotPassword).not.toHaveBeenCalled();
  });

  it('hiển thị thông báo lỗi khi API trả về success: false', async () => {
    const user = userEvent.setup();

    vi.mocked(AuthService.forgotPassword).mockResolvedValue({
      success: false,
      error: 'Email not found in system',
    });

    renderForgotPassword();

    await user.type(screen.getByPlaceholderText('Enter your recovery email'), 'wrong@example.com');
    await user.click(screen.getByRole('button', { name: /Confirm forgot password/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Email not found in system');
    });
  });

  it('hiển thị thông báo lỗi chung khi API không trả về error cụ thể', async () => {
    const user = userEvent.setup();

    vi.mocked(AuthService.forgotPassword).mockResolvedValue({
      success: false,
      error: '',
    });

    renderForgotPassword();

    await user.type(screen.getByPlaceholderText('Enter your recovery email'), 'test@ok.com');
    await user.click(screen.getByRole('button', { name: /Confirm forgot password/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error when send request.');
    });
  });

  it('vô hiệu hóa button và hiển thị trạng thái loading trong lúc gửi request', async () => {
    const user = userEvent.setup();

    // Giữ promise pending để kiểm tra loading
    vi.mocked(AuthService.forgotPassword).mockImplementation(() => new Promise(() => {}));

    renderForgotPassword();

    const submitBtn = screen.getByRole('button', { name: /Confirm forgot password/i });
    const emailInput = screen.getByPlaceholderText('Enter your recovery email');

    await user.type(emailInput, 'pending@example.com');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toHaveClass('ant-btn-loading');
      expect(submitBtn.querySelector('.anticon-loading')).toBeInTheDocument();
    });
  });

  it('thông báo thành công khi nhập đúng email', async () => {
    const user = userEvent.setup();

    vi.mocked(AuthService.forgotPassword).mockResolvedValueOnce({
      success: true,
      error:''
    });

    renderForgotPassword();

    const emailInput = screen.getByPlaceholderText('Enter your recovery email');
    await user.type(emailInput, 'valid@example.com');
    await user.click(screen.getByRole('button', { name: /Confirm forgot password/i }));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith(
        'Mail has already been sent. Please check your email!.'
      );
    });
  })
});