import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageView = (pageTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      // Generate or get session ID
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('session_id', sessionId);
      }

      try {
        await supabase.from('page_views').insert({
          page_path: location.pathname,
          page_title: pageTitle || document.title,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, pageTitle]);
};
