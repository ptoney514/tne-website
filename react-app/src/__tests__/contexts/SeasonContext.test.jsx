import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeasonProvider, useSeason } from '../../contexts/SeasonContext';
import { api } from '../../lib/api-client';

// Mock api-client
vi.mock('../../lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Sample test data
const mockSeasons = [
  { id: 'season-1', name: '2025-26 Winter', is_active: true, start_date: '2025-11-01' },
  { id: 'season-2', name: '2025 Spring', is_active: false, start_date: '2025-03-01' },
  { id: 'season-3', name: '2024 Fall', is_active: false, start_date: '2024-09-01' },
];

// Test component to consume season context
function TestConsumer() {
  const season = useSeason();
  return (
    <div>
      <div data-testid="loading">{season.loading ? 'loading' : 'ready'}</div>
      <div data-testid="seasons-count">{season.seasons.length}</div>
      <div data-testid="selected-season">{season.selectedSeason?.name || 'none'}</div>
      <div data-testid="selected-id">{season.selectedSeasonId || 'none'}</div>
      <button onClick={() => season.setSelectedSeasonId('season-2')}>Select Spring</button>
      <button onClick={season.refetch}>Refetch</button>
    </div>
  );
}

describe('SeasonContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockSeasons);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useSeason hook', () => {
    it('should throw error when used outside SeasonProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSeason must be used within a SeasonProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('initial loading state', () => {
    it('should start with loading true', () => {
      // Make query hang
      api.get.mockImplementation(() => new Promise(() => {}));

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      expect(screen.getByTestId('loading').textContent).toBe('loading');
    });

    it('should finish loading after fetching seasons', async () => {
      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });
    });
  });

  describe('season fetching', () => {
    it('should fetch seasons on mount', async () => {
      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('seasons-count').textContent).toBe('3');
      });

      expect(api.get).toHaveBeenCalledWith('/public/seasons');
    });

    it('should handle fetch error gracefully', async () => {
      api.get.mockRejectedValue(new Error('Database error'));

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Should have empty seasons on error
      expect(screen.getByTestId('seasons-count').textContent).toBe('0');
    });
  });

  describe('default season selection', () => {
    it('should select active season by default', async () => {
      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-season').textContent).toBe('2025-26 Winter');
      });
    });

    it('should select first season if no active season', async () => {
      const seasonsWithoutActive = mockSeasons.map((s) => ({ ...s, is_active: false }));
      api.get.mockResolvedValue(seasonsWithoutActive);

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        // First season in the list (ordered by start_date desc)
        expect(screen.getByTestId('selected-season').textContent).toBe('2025-26 Winter');
      });
    });

    it('should handle empty seasons list', async () => {
      api.get.mockResolvedValue([]);

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      expect(screen.getByTestId('selected-season').textContent).toBe('none');
    });
  });

  describe('season switching', () => {
    it('should allow changing selected season', async () => {
      const user = userEvent.setup();

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-season').textContent).toBe('2025-26 Winter');
      });

      await user.click(screen.getByText('Select Spring'));

      await waitFor(() => {
        expect(screen.getByTestId('selected-id').textContent).toBe('season-2');
      });
    });

    it('should update selectedSeason when selectedSeasonId changes', async () => {
      const user = userEvent.setup();

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-season').textContent).toBe('2025-26 Winter');
      });

      await user.click(screen.getByText('Select Spring'));

      await waitFor(() => {
        expect(screen.getByTestId('selected-season').textContent).toBe('2025 Spring');
      });
    });
  });

  describe('refetch functionality', () => {
    it('should provide refetch function', async () => {
      const user = userEvent.setup();

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Update mock to return different data
      api.get.mockResolvedValue([
        ...mockSeasons,
        { id: 'season-4', name: '2026 Summer', is_active: false, start_date: '2026-06-01' },
      ]);

      await user.click(screen.getByText('Refetch'));

      await waitFor(() => {
        expect(screen.getByTestId('seasons-count').textContent).toBe('4');
      });
    });

    it('should preserve selected season after refetch', async () => {
      const user = userEvent.setup();

      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Change selection
      await user.click(screen.getByText('Select Spring'));

      await waitFor(() => {
        expect(screen.getByTestId('selected-id').textContent).toBe('season-2');
      });

      // Refetch
      await user.click(screen.getByText('Refetch'));

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Selection should be preserved
      expect(screen.getByTestId('selected-id').textContent).toBe('season-2');
    });
  });

  describe('context value', () => {
    it('should provide all expected values', async () => {
      render(
        <SeasonProvider>
          <TestConsumer />
        </SeasonProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
      });

      // Verify all context values are accessible through TestConsumer
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('seasons-count')).toBeInTheDocument();
      expect(screen.getByTestId('selected-season')).toBeInTheDocument();
      expect(screen.getByTestId('selected-id')).toBeInTheDocument();
      // Buttons use setSelectedSeasonId and refetch functions
      expect(screen.getByText('Select Spring')).toBeInTheDocument();
      expect(screen.getByText('Refetch')).toBeInTheDocument();
    });
  });
});
