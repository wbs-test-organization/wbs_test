import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Unauthorized from '../pages/general/Unauthorized';

describe('Unauthorized Component', () => {
  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

  it('renders unauthorized heading', () => {
    renderComponent();
    expect(screen.getByText(/Unauthorized Access/i)).toBeInTheDocument();
  });

  it('displays proper error message', () => {
    renderComponent();
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
  });

  it('renders link to go back to login', () => {
    renderComponent();
    const loginLink = screen.getByRole('link', { name: /Go Back to Login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/');
  });

  it('has correct styling classes', () => {
    renderComponent();
    const container = screen.getByText(/Unauthorized Access/i).closest('div');
    expect(container?.parentElement?.parentElement).toHaveClass('min-h-screen', 'flex');
  });
});