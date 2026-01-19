import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from '../store/Store';
import Login from '../pages/auth/Login';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { API_BASE_URL } from '../utils/constant';
import { message } from 'antd';

const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

describe('Login Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <Provider store={Store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders form correctly', () => {
    renderLogin();
    expect(screen.getByText(/Login WBBBSS System/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeEnabled();
  });

  it('toggles password visibility', async () => {
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

  it('submits successfully with correct credentials', async () => {
  const successSpy = vi.spyOn(message, 'success');

  renderLogin();

  await user.type(screen.getByPlaceholderText(/Enter username/i), 'testuser');
  await user.type(screen.getByPlaceholderText(/Enter password/i), 'password123');

  await user.click(screen.getByRole('button', { name: /Login/i }));

  await waitFor(() => {
    expect(successSpy).toHaveBeenCalledTimes(1);
    expect(successSpy).toHaveBeenCalledWith(expect.stringContaining('successfully'));
  }, { timeout: 10000 });

  await waitFor(() => {
    expect(mockedUseNavigate).toHaveBeenCalledWith('/project');
  }, { timeout: 5000 });
});

  it('shows error on wrong credentials', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () => {
        return HttpResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    renderLogin();

    await user.type(screen.getByPlaceholderText(/Enter username/i), 'wrong');
    await user.type(screen.getByPlaceholderText(/Enter password/i), 'wrong');

    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username or password not match/i)).toBeInTheDocument();
    });
  });
});