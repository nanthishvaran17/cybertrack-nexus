import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

describe('CyberTrack Nexus Core Enhancements', () => {
  it('renders custom 404 page with semantic H1 and diagnostic terminal', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Node Not Located/i);
    expect(screen.getByText(/Return to Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Directory/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs navigation bar', () => {
    render(
      <BrowserRouter>
        <Breadcrumbs />
      </BrowserRouter>
    );

    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument();
  });
});
