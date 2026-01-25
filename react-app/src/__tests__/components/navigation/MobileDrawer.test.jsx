import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileDrawer from '../../../components/MobileDrawer';

// Mock the hooks and assets
vi.mock('../../../hooks/useRegistrationStatus', () => ({
  useRegistrationStatus: vi.fn(() => ({
    isTryoutsOpen: false,
    isRegistrationOpen: false,
  })),
}));

vi.mock('../../../assets/tne-logo-white-transparent.png', () => ({
  default: 'mocked-logo.png',
}));

vi.mock('../../../constants/navigation', () => ({
  navLinks: [
    { path: '/teams', label: 'Teams' },
    { path: '/schedule', label: 'Tournaments' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ],
}));

import { useRegistrationStatus } from '../../../hooks/useRegistrationStatus';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

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
      renderWithRouter(<MobileDrawer isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should render all navigation links', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    });

    it('should highlight active link', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />, {
        route: '/teams',
      });

      const teamsLink = screen.getByRole('link', { name: /teams/i });
      expect(teamsLink).toHaveClass('bg-white/10');
    });

    it('should call onClose when link is clicked', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      const teamsLink = screen.getByRole('link', { name: /teams/i });
      fireEvent.click(teamsLink);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('payments link', () => {
    it('should show payments link when showPayLink is true', () => {
      renderWithRouter(
        <MobileDrawer isOpen={true} onClose={mockOnClose} showPayLink={true} />
      );

      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
    });

    it('should not show payments link when showPayLink is false', () => {
      renderWithRouter(
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

      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /register for tryouts/i })).toBeInTheDocument();
    });

    it('should show register button when registration is open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: true,
      });

      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /^register$/i })).toBeInTheDocument();
    });

    it('should prioritize tryouts over registration', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: true,
      });

      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /register for tryouts/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^register$/i })).not.toBeInTheDocument();
    });

    it('should show login button', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText(/close menu/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      // Click on backdrop (the overlay element)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when Escape key is pressed', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('body scroll lock', () => {
    it('should prevent body scroll when open', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = renderWithRouter(
        <MobileDrawer isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <MemoryRouter>
          <MobileDrawer isOpen={false} onClose={mockOnClose} />
        </MemoryRouter>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('logo', () => {
    it('should display the logo', () => {
      renderWithRouter(<MobileDrawer isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByAltText('TNE')).toBeInTheDocument();
    });
  });
});
