import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PrivateRoute from '../routes/PrivateRoute'; // Điều chỉnh đường dẫn cho đúng

// Component giả lập để kiểm tra nội dung bên trong PrivateRoute
const ProtectedPage = () => <div>Protected Content</div>;
const LoginPage = () => {
  const location = useLocation();
  return (
    <div>
      <span>Login Page</span>
      <span data-testid="from-path">{location.state?.from?.pathname}</span>
    </div>
  );
};

describe('PrivateRoute Component', () => {
  // Hàm helper để tạo store giả lập với trạng thái auth tùy biến
  const createMockStore = (authState: { isAuthenticated: boolean; token: string | null }) => {
    return configureStore({
      reducer: {
        auth: (state = authState) => state, // Mock reducer đơn giản trả về state truyền vào
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên hiển thị children nếu người dùng đã authenticate và có token', () => {
    const store = createMockStore({ isAuthenticated: true, token: 'fake-token-123' });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <PrivateRoute>
            <ProtectedPage />
          </PrivateRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('nên chuyển hướng về /login nếu isAuthenticated là false', () => {
    const store = createMockStore({ isAuthenticated: false, token: 'fake-token' });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ProtectedPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Kiểm tra đã chuyển hướng sang trang Login chưa
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    // Kiểm tra nội dung bảo mật không được hiển thị
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Kiểm tra console log (phủ dòng console.log trong code)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PrivateRoute: You are not authenticated'), expect.any(Object));
  });

  it('nên chuyển hướng về /login nếu thiếu token (isAuthenticated là true nhưng token null)', () => {
    const store = createMockStore({ isAuthenticated: true, token: null });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProtectedPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('nên lưu lại vị trí cũ (location state) khi chuyển hướng sang trang login', () => {
    const store = createMockStore({ isAuthenticated: false, token: null });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/settings']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <ProtectedPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Kiểm tra xem trang Login có nhận được state "from" là "/settings" không
    expect(screen.getByTestId('from-path')).toHaveTextContent('/settings');
  });
});