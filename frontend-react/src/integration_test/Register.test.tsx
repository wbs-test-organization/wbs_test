import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from '../store/Store';
import Register from '../pages/auth/Register';
import { message } from 'antd';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { API_BASE_URL } from '../utils/constant';

vi.spyOn(message, 'success');
vi.spyOn(message, 'error');

const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedUseNavigate,
    };
});

describe('Register Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <Provider store={Store}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </Provider>
        );
    };

    it('renders form correctly', () => {
        renderRegister();

        expect(screen.getByText(/Register WBBBSSS System/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeEnabled();
    })

    it('toggles password and confirm password visibility', async () => {
        const { container } = renderRegister();
        const passwordInput = screen.getByPlaceholderText(/Enter password/i);
        const confirmInput = screen.getByPlaceholderText(/Enter confirm password/i);

        expect(confirmInput).toHaveAttribute('type', 'password');

        const passwordToggle = container.querySelectorAll('button[type="button"]');

        expect(passwordInput).toHaveAttribute('type', 'password');
        await user.click(passwordToggle[0]);
        expect(passwordInput).toHaveAttribute('type', 'text');

        expect(confirmInput).toHaveAttribute('type', 'password');
        await user.click(passwordToggle[1]);
        expect(confirmInput).toHaveAttribute('type', 'text');
    });

    it('shows error when password does not match', async () => {
        renderRegister();

        await user.type(screen.getByPlaceholderText(/Enter email/i), 'aa@email.com');
        await user.type(screen.getByPlaceholderText(/Enter full name/i), 'aa');
        await user.type(screen.getByPlaceholderText(/Enter username/i), 'aa');
        await user.type(screen.getByPlaceholderText(/Enter password/i), 'password123');
        await user.type(screen.getByPlaceholderText(/Enter confirm password/i), 'ppppppp');

        await user.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith('Confirm password does not match!');
        }, { timeout: 3000 });
    });

    it('submit successfully with valid data', async () => {
        const successSpy = vi.spyOn(message, 'success');

        renderRegister();

        await user.type(screen.getByPlaceholderText(/Enter email/i), 'newuser@example.com');
        await user.type(screen.getByPlaceholderText(/Enter full name/i), 'New User Test');
        await user.type(screen.getByPlaceholderText(/Enter username/i), 'testuser');
        await user.type(screen.getByPlaceholderText(/Enter password/i), 'password123');
        await user.type(screen.getByPlaceholderText(/Enter confirm password/i), 'password123');

        await user.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(successSpy).toHaveBeenCalledTimes(1);
            expect(successSpy).toHaveBeenCalledWith('Registration successful!');
        }, { timeout: 10000 })

        await waitFor(() => {
            expect(mockedUseNavigate).toHaveBeenCalledWith('/login');
        }, { timeout: 35000 })
    })

    it('shows error when registration fails from server', async () => {
        server.use(
            http.post(`${API_BASE_URL}/auth/register`, () => {
                return HttpResponse.json(
                    { success: false, error: 'Username or email already exists' },
                    { status: 400 }
                );
            })
        );

        renderRegister();

        await user.type(screen.getByPlaceholderText(/Enter email/i), 'existing@email.com');
        await user.type(screen.getByPlaceholderText(/Enter full name/i), 'Existing User');
        await user.type(screen.getByPlaceholderText(/Enter username/i), 'existinguser');
        await user.type(screen.getByPlaceholderText(/Enter password/i), 'password123');
        await user.type(screen.getByPlaceholderText(/Enter confirm password/i), 'password123');

        await user.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith('Request failed with status code 400');
        });
    });
})