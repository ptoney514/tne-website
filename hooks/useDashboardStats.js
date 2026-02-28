// Re-export from context — stats are now fetched once at the layout level
// and shared via DashboardStatsContext. This file exists as a safety net
// for any imports that haven't been updated yet.
export { useDashboardStats } from '@/contexts/DashboardStatsContext';
