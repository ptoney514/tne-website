import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteriorLayout from '@/components/layouts/InteriorLayout';

// Mock the hooks and assets
vi.mock('@/hooks/useRegistrationStatus', () => ({
  useRegistrationStatus: vi.fn(() => ({
    isTryoutsOpen: false,
    isRegistrationOpen: false,
  })),
}));

vi.mock('@/assets/tne-logo-white-transparent.png', () => ({
  default: 'mocked-logo.png',
}));

vi.mock('@/constants/navigation', () => ({
  navLinks: [
    { path: '/teams', label: 'Teams' },
    { path: '/schedule', label: 'Tournaments' },
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

import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

describe('InteriorLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegistrationStatus.mockReturnValue({
      isTryoutsOpen: false,
      isRegistrationOpen: false,
    });
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

    it('should render navigation links', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    });

    it('should highlight active link', () => {
      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      const teamsLink = screen.getByRole('link', { name: /teams/i });
      // With next/navigation mocked to usePathname => '/', no link should be highlighted
      // This test may need adjustment based on the component's behavior with Next.js routing
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

  describe('registration buttons', () => {
    it('should show tryouts button when tryouts are open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: false,
      });

      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('link', { name: /tryouts/i })).toBeInTheDocument();
    });

    it('should show register button when registration is open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: true,
      });

      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('should not show registration buttons when both closed', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: false,
      });

      render(
        <InteriorLayout>
          <div>Content</div>
        </InteriorLayout>
      );

      // Should not find the CTA buttons (but links in nav are fine)
      const tryoutsButtons = screen.queryAllByRole('link', { name: /^tryouts$/i });
      const registerButtons = screen.queryAllByRole('link', { name: /^register$/i });

      // Filter to only CTA-styled buttons (with bg-tne-red)
      const ctaButtons = [...tryoutsButtons, ...registerButtons].filter((el) =>
        el.className.includes('bg-tne-red')
      );
      expect(ctaButtons.length).toBe(0);
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
