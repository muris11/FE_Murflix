import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures every page navigation or route change
 * immediately scrolls the window back to the top (0, 0).
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Instantly reset window and body scroll position on route/search changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Guard against delayed layout shifts or image render delays
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 20);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
};

