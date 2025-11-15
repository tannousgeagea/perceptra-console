import { useState, useEffect, useCallback } from 'react';

export const useAutoRefresh = (onRefresh: () => void, intervalSeconds: number = 30) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await onRefresh();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [onRefresh]);

  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      refresh();
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [isEnabled, intervalSeconds, refresh]);

  const toggleAutoRefresh = () => setIsEnabled(!isEnabled);

  return {
    isEnabled,
    lastUpdated,
    isRefreshing,
    toggleAutoRefresh,
    manualRefresh: refresh
  };
};