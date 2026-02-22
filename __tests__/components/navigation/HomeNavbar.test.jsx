import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeNavbar from '@/components/HomeNavbar';

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

// Import the mock to control it in tests
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

describe('HomeNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegistrationStatus.mockReturnValue({
      isTryoutsOpen: false,
      isRegistrationOpen: false,
    });
  });

  describe('rendering', () => {
    it('should render the navbar', () => {
      render(<HomeNavbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render the logo', () => {
      render(<HomeNavbar />);
      expect(screen.getByAltText('TNE United Express')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<HomeNavbar />);
      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      render(<HomeNavbar />);
      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('should have correct href for Teams link', () => {
      render(<HomeNavbar />);
      const teamsLink = screen.getByRole('link', { name: /teams/i });
      expect(teamsLink).toHaveAttribute('href', '/teams');
    });

    it('should have correct href for Tournaments link', () => {
      render(<HomeNavbar />);
      const tournamentsLink = screen.getByRole('link', { name: /tournaments/i });
      expect(tournamentsLink).toHaveAttribute('href', '/schedule');
    });

    it('should have correct href for Payments link', () => {
      render(<HomeNavbar />);
      const paymentsLink = screen.getByRole('link', { name: /payments/i });
      expect(paymentsLink).toHaveAttribute('href', '/payments');
    });

    it('should have correct href for About link', () => {
      render(<HomeNavbar />);
      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });
  });

  describe('registration buttons', () => {
    it('should show Register Today button when tryouts are open', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: false,
      });

      render(<HomeNavbar />);
      expect(screen.getByRole('link', { name: /register today/i })).toBeInTheDocument();
    });

    it('should show Register button when registration is open (not tryouts)', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: true,
      });

      render(<HomeNavbar />);
      expect(screen.getByRole('link', { name: /^register$/i })).toBeInTheDocument();
    });

    it('should not show registration button when both are closed', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: false,
        isRegistrationOpen: false,
      });

      render(<HomeNavbar />);
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });

    it('should prioritize tryouts over registration', () => {
      useRegistrationStatus.mockReturnValue({
        isTryoutsOpen: true,
        isRegistrationOpen: true,
      });

      render(<HomeNavbar />);
      expect(screen.getByRole('link', { name: /register today/i })).toBeInTheDocument();
      // Should not show regular register when tryouts is open
      expect(screen.queryByRole('link', { name: /^register$/i })).not.toBeInTheDocument();
    });
  });

  describe('mobile menu', () => {
    it('should open mobile menu when button is clicked', () => {
      render(<HomeNavbar />);

      const menuButton = screen.getByLabelText(/open menu/i);
      fireEvent.click(menuButton);

      // MobileDrawer should be rendered (check for close button)
      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    });
  });

  describe('logo link', () => {
    it('should link to home page', () => {
      render(<HomeNavbar />);
      const logoLink = screen.getByRole('link', { name: /tne united express/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });
});
