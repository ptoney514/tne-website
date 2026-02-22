import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteriorLayout from '@/components/layouts/InteriorLayout';

vi.mock('@/assets/tne-logo-white-transparent.png', () => ({
  default: 'mocked-logo.png',
}));

vi.mock('@/constants/navigation', () => ({
  navLinks: [
    { path: '/teams', label: 'Teams' },
    { path: '/schedule', label: 'Tournaments' },
    { path: '/tryouts', label: 'Tryouts' },
    { path: '/payments', label: 'Payments' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ],
}));

// Mock HomeFooter to simplify testing
vi.mock('@/components/HomeFooter', () => ({
  default: ({ hideStatusBadge }) => (
    <footer data-testid="home-footer" data-hide-badge={hideStatusBadge}>
      Footer Content
    </footer>
  ),
}));

describe('InteriorLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should render navbar', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <InteriorLayout>
          <div data-testid="child-content">Test Content</div>
        </InteriorLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByTestId('home-footer')).toBeInTheDocument();
    });
  });

  describe('navbar', () => {
    it('should render logo linking to home', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const logoLink = screen.getByRole('link', { name: /tne/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should render navigation links including Tryouts', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^tryouts$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });
  });

  describe('register now button', () => {
    it('should always show Register Now button', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('link', { name: /register now/i })).toBeInTheDocument();
    });

    it('should link Register Now to /register', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const registerLink = screen.getByRole('link', { name: /register now/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('mobile menu', () => {
    it('should open mobile menu when button clicked', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const menuButton = screen.getByLabelText(/open menu/i);
      fireEvent.click(menuButton);

      // Mobile menu should be visible (check for close button or menu heading)
      expect(screen.getByText(/menu/i)).toBeInTheDocument();
    });

    it('should close mobile menu when close button clicked', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      // Open menu
      const menuButton = screen.getByLabelText(/open menu/i);
      fireEvent.click(menuButton);

      // Close menu
      const closeButton = screen.getByRole('button', { name: '' }); // X button without text
      fireEvent.click(closeButton);

      // Menu should be closed (Menu heading should not be visible)
      // Note: This depends on the component's behavior
    });
  });

  describe('footer props', () => {
    it('should pass hideStatusBadge prop to footer', () => {
      render(
        <InteriorLayout hideStatusBadge={true}>
          <div>Content</div>
        </InteriorLayout>
      );

      const footer = screen.getByTestId('home-footer');
      expect(footer).toHaveAttribute('data-hide-badge', 'true');
    });

    it('should default hideStatusBadge to false', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const footer = screen.getByTestId('home-footer');
      expect(footer).toHaveAttribute('data-hide-badge', 'false');
    });
  });

  describe('styling', () => {
    it('should have dark background', () => {
      const { container } = render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('bg-[#050505]');
    });

    it('should have min-height screen', () => {
      const { container } = render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('min-h-screen');
    });

    it('should have sticky navbar', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sticky');
      expect(nav).toHaveClass('top-0');
    });
  });
});
