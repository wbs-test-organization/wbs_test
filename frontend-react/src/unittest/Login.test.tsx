import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import { AuthService } from '../service/authService'; // Hãy kiểm tra lại đường dẫn .ts hoặc bỏ .ts nếu cần
import { message } from 'antd';

// 1. Fix môi trường JSDOM giả lập window.matchMedia cho antd
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
    }))
});

// 2. Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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

// Chỉnh lại đường dẫn mock cho đúng với thực tế file của bạn
vi.mock('../service/authService', () => ({
    AuthService: {
        login: vi.fn(),
    },
}));

describe('Login Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    it('Display form login and contact information', () => {
        renderLogin();
        expect(screen.getByText(/Login WBBBSS System/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText(/TEL: \+84 \(0\)234 658332/i)).toBeInTheDocument();
    });

    it('Change hide and unhide password', async () => {
        const user = userEvent.setup();
        const { container } = renderLogin();

        const passwordInput = screen.getByPlaceholderText(/Enter password/i);
        const toggleButton = container.querySelector('button.absolute');
       
        expect(passwordInput).toHaveAttribute('type', 'password');

        if (toggleButton) {
            await user.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'text');
            await user.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'password');
        } else {
            throw new Error('Không tìm thấy nút toggle password');
        }
    });

    it('Call AuthService.login and navigate after login successful', async () => {
        const user = userEvent.setup();
        const successResponse = {
            success: true,
            data: { token: 'fake-jwt-token' } as any,
        };
        vi.mocked(AuthService.login).mockResolvedValue(successResponse);

        renderLogin();

        await user.type(screen.getByPlaceholderText(/Enter username/i), 'admin');
        await user.type(screen.getByPlaceholderText(/Enter password/i), '123456');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(AuthService.login).toHaveBeenCalled();
            expect(message.success).toHaveBeenCalledWith('Login successfully!');
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        }, { timeout: 1000 });
    });

    it('Display error when login failed (success: false)', async () => {
        const user = userEvent.setup();
        vi.mocked(AuthService.login).mockResolvedValue({
            success: false,
        });

        renderLogin();

        await user.type(screen.getByPlaceholderText(/Enter username/i), 'wrong');
        await user.type(screen.getByPlaceholderText(/Enter password/i), 'wrong');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith('Username or password not match');
        });
    });

    it('Check navigation link after Sign Up and Forgot Password', () => {
        renderLogin();
        expect(screen.getByRole('link', { name: /Sign Up/i })).toHaveAttribute('href', '/register');
        expect(screen.getByRole('link', { name: /Forgot Password\?/i })).toHaveAttribute('href', '/forgot-password');
    });

    // --- TESCCASE 6: Netwwork error ---
    it('Should log error to console when AuthService.login throws an exception', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        // Giả lập lỗi ném ra từ Promise (Network Error / Exception)
        const networkError = new Error('Network Error');
        vi.mocked(AuthService.login).mockRejectedValue(networkError);

        renderLogin();

        await user.type(screen.getByPlaceholderText(/Enter username/i), 'admin');
        await user.type(screen.getByPlaceholderText(/Enter password/i), '123456');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Error when login", networkError);
        });

        consoleSpy.mockRestore();
    });
});