import { supabase } from '@/integrations/supabase/client';

export const trackThemeChange = async (newTheme: string, previousTheme: string | null) => {
  try {
    const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
    
    await supabase.from('page_views').insert({
      page_path: '/theme-change',
      page_title: `Theme Changed: ${previousTheme || 'initial'} → ${newTheme}`,
      session_id: sessionId,
      referrer: window.location.pathname,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(navigator.userAgent),
      browser: getBrowser(navigator.userAgent),
      os: getOS(navigator.userAgent),
    });
  } catch (error) {
    console.error('Error tracking theme change:', error);
  }
};

// Helper functions
const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('ipad') || ua.includes('tablet') || (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet';
  }
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  return 'Other';
};

const getOS = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows nt')) return 'Windows';
  if (ua.includes('mac os x')) return 'macOS';
  if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Other';
};
