import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock hooks and assets before imports
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    profile: null,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/assets/tne-logo-white-transparent.png', () => ({
  default: { src: 'mocked-logo.png' },
}));

import TeamsNavbar from '@/components/TeamsNavbar';
import { useAuth } from '@/hooks/useAuth';

describe('TeamsNavbar', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      profile: null,
      signOut: mockSignOut,
    });
  });

  describe('rendering', () => {
    it('should render the navbar', () => {
      render(<TeamsNavbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render the logo with alt text', () => {
      render(<TeamsNavbar />);
      expect(screen.getByAltText('TNE United Express')).toBeInTheDocument();
    });

    it('should render desktop navigation links', () => {
      render(<TeamsNavbar />);
      expect(screen.getByRole('link', { name: /teams/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tournaments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /payments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    });
  });

  describe('all links have valid href attributes', () => {
    it('should ensure every anchor tag has a non-empty href (unauthenticated)', () => {
      const { container } = render(<TeamsNavbar />);
      const allLinks = container.querySelectorAll('a');

      expect(allLinks.length).toBeGreaterThan(0);

      allLinks.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).not.toBe('');
        expect(link.getAttribute('href')).not.toBe('undefined');
      });
    });

    it('should ensure every anchor tag has a non-empty href (authenticated)', () => {
      useAuth.mockReturnValue({
        user: { id: '1' },
        profile: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          role: 'admin',
        },
        signOut: mockSignOut,
      });

      const { container } = render(<TeamsNavbar />);

      // Open the UserDropdown to render its links
      const dropdownButton = screen.getByText('Test');
      fireEvent.click(dropdownButton);

      const allLinks = container.querySelectorAll('a');

      expect(allLinks.length).toBeGreaterThan(0);

      allLinks.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).not.toBe('');
        expect(link.getAttribute('href')).not.toBe('undefined');
      });
    });
  });

  describe('unauthenticated state', () => {
    it('should show Login link with correct href', () => {
      render(<TeamsNavbar />);
      const loginLinks = screen.getAllByRole('link', { name: /login/i });
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      loginLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/login');
      });
    });

    it('should show Register link with correct href', () => {
      render(<TeamsNavbar />);
      const registerLinks = screen.getAllByRole('link', { name: /register/i });
      expect(registerLinks.length).toBeGreaterThanOrEqual(1);
      registerLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/tryouts');
      });
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { id: '1' },
        profile: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          role: 'admin',
        },
        signOut: mockSignOut,
      });
    });

    it('should show UserDropdown instead of Login/Register', () => {
      render(<TeamsNavbar />);
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
    });

    it('should show user initials in dropdown button', () => {
      render(<TeamsNavbar />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should open dropdown and show Profile link on click', () => {
      render(<TeamsNavbar />);

      const dropdownButton = screen.getByText('Test');
      fireEvent.click(dropdownButton);

      const profileLink = screen.getByRole('link', { name: /my profile/i });
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('should show Admin Dashboard link for admin users', () => {
      render(<TeamsNavbar />);

      const dropdownButton = screen.getByText('Test');
      fireEvent.click(dropdownButton);

      const adminLink = screen.getByRole('link', { name: /admin dashboard/i });
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveAttribute('href', '/admin');
    });

    it('should not show Admin Dashboard link for non-admin users', () => {
      useAuth.mockReturnValue({
        user: { id: '1' },
        profile: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          role: 'parent',
        },
        signOut: mockSignOut,
      });

      render(<TeamsNavbar />);

      const dropdownButton = screen.getByText('Test');
      fireEvent.click(dropdownButton);

      expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
    });

    it('should show Sign Out button in dropdown', () => {
      render(<TeamsNavbar />);

      const dropdownButton = screen.getByText('Test');
      fireEvent.click(dropdownButton);

      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe('navigation link hrefs', () => {
    it('should have correct href for logo link', () => {
      render(<TeamsNavbar />);
      const logoLink = screen.getByAltText('TNE United Express').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should have correct href for Teams link', () => {
      render(<TeamsNavbar />);
      const teamsLink = screen.getByRole('link', { name: /teams/i });
      expect(teamsLink).toHaveAttribute('href', '/teams');
    });

    it('should have correct href for Tournaments link', () => {
      render(<TeamsNavbar />);
      const tournamentsLink = screen.getByRole('link', { name: /tournaments/i });
      expect(tournamentsLink).toHaveAttribute('href', '/schedule');
    });

    it('should have correct href for Payments link', () => {
      render(<TeamsNavbar />);
      const paymentsLink = screen.getByRole('link', { name: /payments/i });
      expect(paymentsLink).toHaveAttribute('href', '/payments');
    });

    it('should have correct href for About link', () => {
      render(<TeamsNavbar />);
      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should have correct href for Contact link', () => {
      render(<TeamsNavbar />);
      const contactLink = screen.getByRole('link', { name: /contact/i });
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('mobile menu', () => {
    it('should open mobile menu when hamburger button is clicked', () => {
      render(<TeamsNavbar />);

      // The mobile menu button contains the Menu icon
      const menuButtons = screen.getAllByRole('button');
      const mobileMenuButton = menuButtons.find(
        (btn) => btn.className.includes('md:hidden')
      );

      fireEvent.click(mobileMenuButton);

      // Mobile menu should now have the nav links visible
      // Check for the close button (X icon) that appears in the drawer
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('should show Login and Register links in mobile menu', () => {
      render(<TeamsNavbar />);

      // Open mobile menu
      const menuButtons = screen.getAllByRole('button');
      const mobileMenuButton = menuButtons.find(
        (btn) => btn.className.includes('md:hidden')
      );
      fireEvent.click(mobileMenuButton);

      // Mobile menu has its own Login and Register links
      const loginLinks = screen.getAllByRole('link', { name: /login/i });
      const registerLinks = screen.getAllByRole('link', { name: /register/i });

      expect(loginLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
      expect(registerLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
    });
  });
});
