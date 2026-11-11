import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '@/api/admin';

function getOrCreateSessionId(): string {
  try {
    const key = 'murflix_visitor_session_id';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      sessionStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return 'sess_' + Date.now().toString(36);
  }
}

export function useVisitorTracking() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Avoid duplicate tracks for identical paths in immediate succession
    if (lastTrackedPath.current === currentPath) {
      return;
    }
    lastTrackedPath.current = currentPath;

    // Don't track admin pages to keep visitor analytics focused on public/user activity
    // But track all streaming, browse, movie, series, and landing pages
    const isExcluded = currentPath.startsWith('/admin');
    if (isExcluded) {
      return;
    }

    const sessionId = getOrCreateSessionId();
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    adminApi.trackVisit({
      path: currentPath,
      referrer,
      screen_resolution: screenRes,
      session_id: sessionId,
    });
  }, [location.pathname, location.search]);
}
