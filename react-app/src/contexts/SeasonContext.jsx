import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api-client';

const SeasonContext = createContext(null);

export function SeasonProvider({ children }) {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/public/seasons');

      setSeasons(data || []);

      // Set default to active season or most recent (only on initial load)
      if (!initializedRef.current && data?.length > 0) {
        const activeSeason = data.find((s) => s.is_active);
        setSelectedSeasonId(activeSeason?.id || data[0].id);
        initializedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSeasons = async () => {
      try {
        const data = await api.get('/public/seasons');

        if (!mounted) return;

        setSeasons(data || []);

        // Set default to active season or most recent (only on initial load)
        if (!initializedRef.current && data?.length > 0) {
          const activeSeason = data.find((s) => s.is_active);
          setSelectedSeasonId(activeSeason?.id || data[0].id);
          initializedRef.current = true;
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Error fetching seasons:', error);
        setSeasons([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSeasons();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        selectedSeasonId,
        selectedSeason,
        setSelectedSeasonId,
        loading,
        refetch: fetchSeasons,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
}
