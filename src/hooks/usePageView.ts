import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Function to detect device type
const getDeviceType = (userAgent: string): string => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Function to detect browser
const getBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Other';
};

// Function to detect OS
const getOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
};

// Function to get IP address (using a free service)
const getIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
};

// Function to get location from IP (using a free service)
const getLocationFromIP = async (ip: string): Promise<{country: string | null, city: string | null}> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      country: data.country_name || null,
      city: data.city || null
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return { country: null, city: null };
  }
};

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
        // Get IP address
        const ipAddress = await getIPAddress();
        
        // Get device information
        const userAgent = navigator.userAgent;
        const deviceType = getDeviceType(userAgent);
        const browser = getBrowser(userAgent);
        const os = getOS(userAgent);
        
        // Get location information
        let country = null;
        let city = null;
        if (ipAddress) {
          const location = await getLocationFromIP(ipAddress);
          country = location.country;
          city = location.city;
        }

        await supabase.from('page_views').insert({
          page_path: location.pathname,
          page_title: pageTitle || document.title,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: userAgent,
          ip_address: ipAddress,
          device_type: deviceType,
          browser: browser,
          os: os,
          country: country,
          city: city,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, pageTitle]);
};
