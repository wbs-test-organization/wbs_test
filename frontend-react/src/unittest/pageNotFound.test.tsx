import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageNotFound from '../pages/general/PageNotFound'; // Điều chỉnh path cho đúng

describe('PageNotFound Component', () => {
  const renderComponent = () => render(<PageNotFound />);

  it('nên hiển thị hình ảnh minh họa với alt text đúng', () => {
    renderComponent();
    
    const image = screen.getByRole('img', { name: /logo/i });
    
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/page_not_found.jpg');
  });

  it('nên hiển thị thông báo lỗi bằng tiếng Việt', () => {
    renderComponent();
    
    expect(screen.getByText(/Trang bạn tìm không tồn tại/i)).toBeInTheDocument();
  });

  it('nên có các class CSS để hiển thị toàn màn hình và căn giữa', () => {
    renderComponent();
    
    const mainContainer = screen.getByText(/Trang bạn tìm không tồn tại/i).closest('div')?.parentElement;
    
    expect(mainContainer).toHaveClass('w-screen', 'h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('hình ảnh phải có class animate-bounce để tạo hiệu ứng', () => {
    renderComponent();
    
    const image = screen.getByRole('img', { name: /logo/i });
    expect(image).toHaveClass('animate-bounce');
  });
});