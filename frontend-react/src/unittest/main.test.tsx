import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ─── 1. MOCK REACT DOM CLIENT ───
// Tạo mock độc lập để tránh bị dính cache giữa các file test
const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({
  render: renderMock,
}));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock,
  },
}));

// ─── 2. MOCK APP & ROUTER ───
vi.mock('../App', () => ({
  default: () => null,
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => children,
}));

describe('Index.tsx (Entry Point)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Tạo lại root element cho mỗi test
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('nên render ứng dụng vào phần tử #root không lỗi', async () => {
    // ─── CHIẾN THUẬT CACHE BUSTING ───
    // Thêm timestamp (?t=...) để ép Vitest load lại file main.tsx từ đầu
    // ngay cả khi nó đã được load ở file test khác
    await import(`../main?t=${Date.now()}`);

    const ReactDOMClient = (await import('react-dom/client')).default;

    // Kiểm tra createRoot có được gọi với đúng phần tử id="root"
    expect(ReactDOMClient.createRoot).toHaveBeenCalledWith(
      document.getElementById('root')
    );

    // Kiểm tra hàm render được thực thi
    expect(renderMock).toHaveBeenCalled();
  });
});