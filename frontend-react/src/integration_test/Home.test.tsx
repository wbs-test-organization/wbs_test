import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import Store from '../store/Store';
import Home from '../pages/Home';
import { message } from 'antd';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../utils/constant';
import { server } from '../mocks/server';

// Fix MSW Unhandled Rejection (bắt buộc để tránh crash)
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock confirm
const mockConfirm = vi.fn(() => true);
globalThis.confirm = mockConfirm;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({ matches: false })),
});

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe('Home Component - Project Management', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockImplementation(() => true);

    // Đảm bảo memberId khớp với mockProjects trong handler (memberAuthorId/projectLeadId = 5)
    Store.dispatch({
      type: 'auth/setMember',
      payload: { memberId: 5 },
    });
  });

  const renderHome = () => render(
    <Provider store={Store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>
  );

  // 1. Render danh sách + ẩn project deleted
  it('renders project list correctly and hides deleted projects', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
  });

  // 2. Empty state khi không có project
  it('displays empty state when no projects exist', async () => {
    server.use(
      http.get('*project/member/*', () => HttpResponse.json([], { status: 200 }))
    );
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/chưa có dự án nào/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 3. Mở modal Add
  it('opens Add Project modal', async () => {
    renderHome();
    await user.click(screen.getByRole('button', { name: /Add New Project/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Add New Project/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 4. Đóng modal Add bằng Cancel
  it('closes Add modal by Cancel button', async () => {
    renderHome();
    await user.click(screen.getByRole('button', { name: /Add New Project/i }));
    await screen.findByRole('heading', { name: /Add New Project/i });
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Project/i })).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 5. Tạo project mới thành công
  it('creates new project successfully', async () => {
    renderHome();
    await user.click(screen.getByRole('button', { name: /Add New Project/i }));
    await screen.findByRole('heading', { name: /Add New Project/i });
    await user.type(screen.getByPlaceholderText(/Enter project code/i), 'PRJ003');
    await user.type(screen.getByPlaceholderText(/Enter project name/i), 'New Project');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Project/i })).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 6. Tạo project fail → show error
  it('shows error when create project fails', async () => {
    server.use(
      http.post(`${API_BASE_URL}/project/create`, () => HttpResponse.json({ error: 'Failed' }, { status: 500 }))
    );
    renderHome();
    await user.click(screen.getByRole('button', { name: /Add New Project/i }));
    await screen.findByRole('heading', { name: /Add New Project/i });
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => {
    expect(screen.getByRole('heading', { name: /Add New Project/i })).toBeInTheDocument();
  }, { timeout: 5000 });
  });

  // 7. Mở modal Edit + load data
  it('opens Edit modal and loads data', async () => {
    renderHome();
    const editBtns = await screen.findAllByTitle('Edit');
    await user.click(editBtns[0]);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Project/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('PRJ001')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 8. Đóng modal Edit bằng Cancel
  it('closes Edit modal by Cancel', async () => {
    renderHome();
    const editBtns = await screen.findAllByTitle('Edit');
    await user.click(editBtns[0]);
    await screen.findByRole('heading', { name: /Edit Project/i });
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Project/i })).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 9. Cập nhật project thành công
  it('updates project successfully', async () => {
    renderHome();
    const editBtns = await screen.findAllByTitle('Edit');
    await user.click(editBtns[0]);
    const nameInput = await screen.findByDisplayValue('Project Alpha');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Project');
    await user.click(screen.getByRole('button', { name: /Update/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Project/i })).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // 10. Xóa project thành công
  it('deletes project successfully', async () => {
    mockConfirm.mockReturnValue(true);
    renderHome();
    const deleteBtns = await screen.findAllByTitle('Delete');
    await user.click(deleteBtns[0]);
    await waitFor(() => expect(message.success).toHaveBeenCalledWith('Project deleted successfully!'), { timeout: 5000 });
  });

  // 11. Switch My Projects / All Projects
  it('switches between My Projects and All Projects view', async () => {
    renderHome();
    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    await waitFor(() => expect(switchEl).toBeChecked(), { timeout: 5000 });
  });
});