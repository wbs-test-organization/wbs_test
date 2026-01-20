import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import HeaderProject from '../component/project/HeaderProject'; 

// 1. Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('../redux/slice/authSlice', () => ({
  logout: vi.fn(),
}));

// 2. Mock Router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

describe('HeaderProject Component Full Coverage', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <HeaderProject />
      </MemoryRouter>
    );

  it('nên cover toàn bộ logic setSelectedItem cho tất cả các menu ', () => {
    renderComponent();

    const menus = [
      { text: /DASHBOARD/i, key: 'dashboard' },
      { text: /CHECKLIST/i, key: 'checklist' },
      { text: /TASKLIST/i, key: 'tasklist' },
      { text: /LOGTIME/i, key: 'logtime' },
      { text: /PROJECT/i, key: 'project' }
    ];

    menus.forEach(menu => {
      const btn = screen.getByText(menu.text).closest('button');
      fireEvent.click(btn!);
      // Kiểm tra xem class active đã được add chưa
      expect(btn).toHaveClass('bg-green-500');
    });
  });

  it('nên toggle Dark Mode chính xác', () => {
    renderComponent();
    const darkBtn = screen.getByLabelText(/Toggle Dark Mode/i);

    // Chuyển sang Dark
    fireEvent.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Chuyển lại sang Light
    fireEvent.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('nên mở và đóng User Menu (Logic isUserMenuOpen)', () => {
    renderComponent();
    // Tìm button toggle menu (thường là button chứa icon user cuối cùng)
    const allButtons = screen.getAllByRole('button');
    const userMenuIconBtn = allButtons[allButtons.length - 1]; 

    // Click mở
    fireEvent.click(userMenuIconBtn);
    expect(screen.getByText(/Log out/i)).toBeInTheDocument();

    // Click đóng
    fireEvent.click(userMenuIconBtn);
    expect(screen.queryByText(/Log out/i)).not.toBeInTheDocument();
  });

  it('nên thực hiện logout và navigate ', () => {
    renderComponent();
    const allButtons = screen.getAllByRole('button');
    const userMenuIconBtn = allButtons[allButtons.length - 1]; 

    fireEvent.click(userMenuIconBtn);
    const logoutBtn = screen.getByText(/Log out/i);
    fireEvent.click(logoutBtn);

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('nên render đúng ảnh logo và flag', () => {
    renderComponent();
    expect(screen.getByAltText(/WBS Logo/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Flag/i)).toBeInTheDocument();
  });
});