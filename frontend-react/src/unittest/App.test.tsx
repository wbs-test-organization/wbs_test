import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App'; // Đảm bảo đúng path

// 1. Mock các component con ĐÚNG CÁCH (quan trọng nhất)
// Chúng ta mock để tránh việc HeaderProject hay Login gọi các hook phức tạp gây lỗi
vi.mock('../pages/auth/Login', () => ({ 
  default: () => <div data-testid="login-mock">Login WBBBSS System</div> 
}));
vi.mock('../pages/auth/Register', () => ({ 
  default: () => <div>Register WBBBSSS System</div> 
}));
vi.mock('../pages/Home', () => ({ 
  default: () => <div>Home Page Content</div> 
}));
vi.mock('../pages/general/PageNotFound', () => ({ 
  default: () => <div>Trang bạn tìm không tồn tại</div> 
}));
vi.mock('../component/project/HeaderProject', () => ({ 
  default: () => <div data-testid="header-mock">Header Project</div> 
}));

describe('App Routing Integration Test', () => {
  const createMockStore = (isAuthenticated: boolean) => configureStore({
    reducer: {
      auth: (state = { isAuthenticated, token: isAuthenticated ? 'fake-token' : null }) => state,
      // Thêm các reducer khác nếu App của bạn cần để không bị log warning
      project: (state = {}) => state,
      member: (state = {}) => state,
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('nên hiển thị trang Login làm trang mặc định (/)', () => {
    render(
      <Provider store={createMockStore(false)}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // Kiểm tra text thực tế từ mock
    expect(screen.getByText(/Login WBBBSS System/i)).toBeInTheDocument();
  });

  it('nên hiển thị trang Register khi vào path /register', () => {
    render(
      <Provider store={createMockStore(false)}>
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Register WBBBSSS System/i)).toBeInTheDocument();
  });

  it('nên hiển thị DashboardLayout khi đã Login và vào /project', () => {
    render(
      <Provider store={createMockStore(true)}>
        <MemoryRouter initialEntries={['/project']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    
    // Kiểm tra HeaderProject đã xuất hiện (đặc trưng của DashboardLayout)
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    // Kiểm tra Home page content (Index route của /project)
    expect(screen.getByText(/Home Page Content/i)).toBeInTheDocument();
  });

  it('nên hiển thị trang 404 khi vào đường dẫn lạ', () => {
    render(
      <Provider store={createMockStore(false)}>
        <MemoryRouter initialEntries={['/duong-dan-khong-ton-tai']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Trang bạn tìm không tồn tại/i)).toBeInTheDocument();
  });

  it('nên render DashboardLayout và Outlet đúng cấu trúc (Coverage cho Layout)', () => {
    const { container } = render(
      <Provider store={createMockStore(true)}>
        <MemoryRouter initialEntries={['/project']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // Kiểm tra sự tồn tại của các thẻ main hoặc cấu trúc DOM
    expect(container.querySelector('main')).toBeNull(); // DashboardLayout không có main theo code của bạn
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
  });

  it('nên render AuthLayout cho các route login/register', () => {
    const { container } = render(
      <Provider store={createMockStore(false)}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // AuthLayout có <main className="min-h-screen">
    expect(container.querySelector('main')).toHaveClass('min-h-screen');
  });

});