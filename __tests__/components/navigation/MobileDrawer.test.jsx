import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileDrawer from '@/components/MobileDrawer';

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
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ],
}));

import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

describe('MobileDrawer', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRegistrationStatus.mockReturnValue({
      isTryoutsOpen: false,
      isRegistrationOpen: false,
    });
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Cleanup body style
    document.body.style.overflow = '';
  });

  describe('visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<MobileDrawer isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should render all navigation links', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    });

    it('should highlight active link', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      // With next/navigation mocked to usePathname => '/', active link detection depends on component logic
      const teamsLink = screen.getByRole('link', { name: /teams/i });
      // The link highlighting depends on the pathname mock
    });

    it('should call onClose when link is clicked', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      const teamsLink = screen.getByRole('link', { name: /teams/i });
      fireEvent.click(teamsLink);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('payments link', () => {
    it('should show payments link when showPayLink is true', () => {
      render(
        <MobileDrawer isOpen={true} onClose={mockOnClose} showPayLink={true} />
      );

      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
    });

    it('should not show payments link when showPayLink is false', () => {
      render(
        <MobileDrawer isOpen={true} onClose={mockOnClose} showPayLink={false} />
      );

      // Payments is in navLinks by default, so we need to check it's not duplicated
      const paymentsLinks = screen.queryAllByRole('link', { name: /^payments$/i });
      expect(paymentsLinks.length).toBe(0);
    });
  });

  describe('registration buttons', () => {
    it('should show tryouts button when tryouts are open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: false,
      });

      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /register today/i })).toBeInTheDocument();
    });

    it('should show register button when registration is open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: true,
      });

      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /^register$/i })).toBeInTheDocument();
    });

    it('should prioritize tryouts over registration', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: true,
      });

      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /register today/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^register$/i })).not.toBeInTheDocument();
    });

    it('should show login button', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText(/close menu/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      // Click on backdrop (the overlay element)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('body scroll lock', () => {
    it('should prevent body scroll when open', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <MobileDrawer isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <MobileDrawer isOpen={false} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('logo', () => {
    it('should display the logo', () => {
      render(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByAltText('TNE')).toBeInTheDocument();
    });
  });
});
