import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Function to detect device type
const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  // Check for tablets first (before mobile)
  if (ua.includes('ipad') || 
      ua.includes('tablet') || 
      ua.includes('playbook') || 
      ua.includes('kindle') ||
      (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet';
  }
  
  // Check for mobile devices
  if (ua.includes('mobile') || 
      ua.includes('iphone') || 
      ua.includes('ipod') || 
      ua.includes('android') ||
      ua.includes('blackberry') || 
      ua.includes('opera mini') || 
      ua.includes('windows phone') ||
      ua.includes('palm') || 
      ua.includes('smartphone') || 
      ua.includes('iemobile')) {
    return 'mobile';
  }
  
  return 'desktop';
};

// Function to detect browser
const getBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('edg/') || ua.includes('edge/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('msie') || ua.includes('trident/')) return 'Internet Explorer';
  
  return 'Other';
};

// Function to detect OS
const getOS = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows nt')) return 'Windows';
  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macOS';
  if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
  if (ua.includes('ubuntu')) return 'Ubuntu';
  if (ua.includes('fedora')) return 'Fedora';
  if (ua.includes('debian')) return 'Debian';
  
  return 'Other';
};

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Function to get IP address (using multiple fallback services)
const getIPAddress = async (): Promise<string | null> => {
  const services = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://api.ip.sb/geoip',
    'https://ipinfo.io/json',
    'https://api.db-ip.com/v2/free/self',
    'https://ipapi.co/json/',
    'https://freeipapi.com/api/json'
  ];

  for (const service of services) {
    try {
      const response = await fetchWithTimeout(service, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Different services return IP in different fields
        const ip = data.ip || data.query || data.ipAddress || data.ipAddress;
        if (ip && typeof ip === 'string' && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
          return ip;
        }
      }
    } catch (error) {
      console.warn(`IP service ${service} failed:`, error);
      continue;
    }
  }
  
  console.warn('All IP services failed, using fallback');
  return null;
};

// Function to get location from IP (using multiple fallback services)
const getLocationFromIP = async (ip: string): Promise<{country: string | null, city: string | null}> => {
  const services = [
    `https://ipapi.co/${ip}/json/`,
    `https://ipinfo.io/${ip}/json`,
    `https://api.ip.sb/geoip/${ip}`,
    `https://ip-api.com/json/${ip}`,
    `https://api.db-ip.com/v2/free/${ip}`,
    `https://freeipapi.com/api/json/${ip}`,
    `https://ipapi.co/${ip}/json/`
  ];

  for (const service of services) {
    try {
      const response = await fetchWithTimeout(service, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Different services return location data in different formats
        let country = null;
        let city = null;
        
        // Handle different API response formats
        if (data.country_name) {
          country = data.country_name;
          city = data.city;
        } else if (data.country) {
          country = data.country;
          city = data.city;
        } else if (data.countryCode) {
          // For ip-api.com format
          country = data.country;
          city = data.city;
        } else if (data.country_name && data.city_name) {
          // For db-ip.com format
          country = data.country_name;
          city = data.city_name;
        }
        
        // Additional fallback for country code to name conversion
        if (data.country_code && !country) {
          const countryCodeMap: Record<string, string> = {
            'ET': 'Ethiopia', 'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
            'DE': 'Germany', 'FR': 'France', 'ES': 'Spain', 'IT': 'Italy', 'JP': 'Japan',
            'CN': 'China', 'IN': 'India', 'BR': 'Brazil', 'RU': 'Russia', 'MX': 'Mexico',
            'NL': 'Netherlands', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
            'PL': 'Poland', 'CZ': 'Czech Republic', 'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria',
            'GR': 'Greece', 'PT': 'Portugal', 'IE': 'Ireland', 'AT': 'Austria', 'CH': 'Switzerland',
            'BE': 'Belgium', 'LU': 'Luxembourg', 'SK': 'Slovakia', 'SI': 'Slovenia', 'HR': 'Croatia',
            'EE': 'Estonia', 'LV': 'Latvia', 'LT': 'Lithuania', 'MT': 'Malta', 'CY': 'Cyprus',
            'KR': 'South Korea', 'TH': 'Thailand', 'SG': 'Singapore', 'MY': 'Malaysia', 'ID': 'Indonesia',
            'PH': 'Philippines', 'VN': 'Vietnam', 'TW': 'Taiwan', 'HK': 'Hong Kong', 'NZ': 'New Zealand',
            'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco',
            'TN': 'Tunisia', 'DZ': 'Algeria', 'GH': 'Ghana', 'UG': 'Uganda', 'TZ': 'Tanzania',
            'ZW': 'Zimbabwe', 'BW': 'Botswana', 'NA': 'Namibia', 'ZM': 'Zambia', 'MW': 'Malawi',
            'MZ': 'Mozambique', 'MG': 'Madagascar', 'MU': 'Mauritius', 'SC': 'Seychelles',
            'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'VE': 'Venezuela',
            'UY': 'Uruguay', 'PY': 'Paraguay', 'BO': 'Bolivia', 'EC': 'Ecuador', 'GY': 'Guyana',
            'SR': 'Suriname', 'FK': 'Falkland Islands', 'TR': 'Turkey', 'SA': 'Saudi Arabia',
            'AE': 'United Arab Emirates', 'IL': 'Israel', 'JO': 'Jordan', 'LB': 'Lebanon', 'SY': 'Syria',
            'IQ': 'Iraq', 'IR': 'Iran', 'AF': 'Afghanistan', 'PK': 'Pakistan', 'BD': 'Bangladesh',
            'LK': 'Sri Lanka', 'NP': 'Nepal', 'BT': 'Bhutan', 'MV': 'Maldives', 'MM': 'Myanmar',
            'LA': 'Laos', 'KH': 'Cambodia', 'BN': 'Brunei', 'TL': 'East Timor', 'MN': 'Mongolia',
            'KZ': 'Kazakhstan', 'UZ': 'Uzbekistan', 'KG': 'Kyrgyzstan', 'TJ': 'Tajikistan', 'TM': 'Turkmenistan',
            'AZ': 'Azerbaijan', 'AM': 'Armenia', 'GE': 'Georgia', 'BY': 'Belarus', 'MD': 'Moldova',
            'UA': 'Ukraine', 'MK': 'North Macedonia', 'AL': 'Albania', 'BA': 'Bosnia and Herzegovina',
            'ME': 'Montenegro', 'RS': 'Serbia', 'XK': 'Kosovo'
          };
          country = countryCodeMap[data.country_code] || data.country_code;
        }
        
        if (country) {
          return { country, city };
        }
      }
    } catch (error) {
      console.warn(`Location service ${service} failed:`, error);
      continue;
    }
  }
  
  console.warn('All location services failed');
  return { country: null, city: null };
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

        // If IP services fail, try to get basic location from browser
        if (!country && navigator.language) {
          // Use browser language as a fallback for country detection
          const lang = navigator.language.split('-')[1];
          if (lang) {
            const countryNames: Record<string, string> = {
              'US': 'United States',
              'GB': 'United Kingdom',
              'CA': 'Canada',
              'AU': 'Australia',
              'DE': 'Germany',
              'FR': 'France',
              'ES': 'Spain',
              'IT': 'Italy',
              'JP': 'Japan',
              'CN': 'China',
              'IN': 'India',
              'BR': 'Brazil',
              'RU': 'Russia',
              'MX': 'Mexico',
              'NL': 'Netherlands',
              'SE': 'Sweden',
              'NO': 'Norway',
              'DK': 'Denmark',
              'FI': 'Finland',
              'PL': 'Poland',
              'CZ': 'Czech Republic',
              'HU': 'Hungary',
              'RO': 'Romania',
              'BG': 'Bulgaria',
              'GR': 'Greece',
              'PT': 'Portugal',
              'IE': 'Ireland',
              'AT': 'Austria',
              'CH': 'Switzerland',
              'BE': 'Belgium',
              'LU': 'Luxembourg',
              'SK': 'Slovakia',
              'SI': 'Slovenia',
              'HR': 'Croatia',
              'EE': 'Estonia',
              'LV': 'Latvia',
              'LT': 'Lithuania',
              'MT': 'Malta',
              'CY': 'Cyprus',
              'KR': 'South Korea',
              'TH': 'Thailand',
              'SG': 'Singapore',
              'MY': 'Malaysia',
              'ID': 'Indonesia',
              'PH': 'Philippines',
              'VN': 'Vietnam',
              'TW': 'Taiwan',
              'HK': 'Hong Kong',
              'NZ': 'New Zealand',
              'ZA': 'South Africa',
              'EG': 'Egypt',
              'NG': 'Nigeria',
              'KE': 'Kenya',
              'MA': 'Morocco',
              'TN': 'Tunisia',
              'DZ': 'Algeria',
              'GH': 'Ghana',
              'ET': 'Ethiopia',
              'UG': 'Uganda',
              'TZ': 'Tanzania',
              'ZW': 'Zimbabwe',
              'BW': 'Botswana',
              'NA': 'Namibia',
              'ZM': 'Zambia',
              'MW': 'Malawi',
              'MZ': 'Mozambique',
              'MG': 'Madagascar',
              'MU': 'Mauritius',
              'SC': 'Seychelles',
              'AR': 'Argentina',
              'CL': 'Chile',
              'CO': 'Colombia',
              'PE': 'Peru',
              'VE': 'Venezuela',
              'UY': 'Uruguay',
              'PY': 'Paraguay',
              'BO': 'Bolivia',
              'EC': 'Ecuador',
              'GY': 'Guyana',
              'SR': 'Suriname',
              'FK': 'Falkland Islands',
              'TR': 'Turkey',
              'SA': 'Saudi Arabia',
              'AE': 'United Arab Emirates',
              'IL': 'Israel',
              'JO': 'Jordan',
              'LB': 'Lebanon',
              'SY': 'Syria',
              'IQ': 'Iraq',
              'IR': 'Iran',
              'AF': 'Afghanistan',
              'PK': 'Pakistan',
              'BD': 'Bangladesh',
              'LK': 'Sri Lanka',
              'NP': 'Nepal',
              'BT': 'Bhutan',
              'MV': 'Maldives',
              'MM': 'Myanmar',
              'LA': 'Laos',
              'KH': 'Cambodia',
              'BN': 'Brunei',
              'TL': 'East Timor',
              'MN': 'Mongolia',
              'KZ': 'Kazakhstan',
              'UZ': 'Uzbekistan',
              'KG': 'Kyrgyzstan',
              'TJ': 'Tajikistan',
              'TM': 'Turkmenistan',
              'AZ': 'Azerbaijan',
              'AM': 'Armenia',
              'GE': 'Georgia',
              'BY': 'Belarus',
              'MD': 'Moldova',
              'UA': 'Ukraine',
              'MK': 'North Macedonia',
              'AL': 'Albania',
              'BA': 'Bosnia and Herzegovina',
              'ME': 'Montenegro',
              'RS': 'Serbia',
              'XK': 'Kosovo'
            };
            country = countryNames[lang] || null;
          }
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
