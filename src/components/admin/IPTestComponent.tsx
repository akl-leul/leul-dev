import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react';

interface IPTestData {
  ip: string | null;
  country: string | null;
  city: string | null;
  deviceType: string;
  browser: string;
  os: string;
  userAgent: string;
  language: string;
}

const IPTestComponent: React.FC = () => {
  const [testData, setTestData] = useState<IPTestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Function to detect device type
  const getDeviceType = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('ipad') || 
        ua.includes('tablet') || 
        ua.includes('playbook') || 
        ua.includes('kindle') ||
        (ua.includes('android') && !ua.includes('mobile'))) {
      return 'tablet';
    }
    
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

  // Function to get IP address
  const getIPAddress = async (): Promise<string | null> => {
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api.ip.sb/geoip',
      'https://ipinfo.io/json'
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
          const ip = data.ip || data.query || data.ipAddress;
          if (ip && typeof ip === 'string') {
            return ip;
          }
        }
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
        continue;
      }
    }
    
    return null;
  };

  // Function to get location from IP
  const getLocationFromIP = async (ip: string): Promise<{country: string | null, city: string | null}> => {
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `https://ipinfo.io/${ip}/json`,
      `https://api.ip.sb/geoip/${ip}`,
      `https://ip-api.com/json/${ip}`
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
          
          let country = null;
          let city = null;
          
          if (data.country_name) {
            country = data.country_name;
            city = data.city;
          } else if (data.country) {
            country = data.country;
            city = data.city;
          } else if (data.countryCode) {
            country = data.country;
            city = data.city;
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
    
    return { country: null, city: null };
  };

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userAgent = navigator.userAgent;
      const deviceType = getDeviceType(userAgent);
      const browser = getBrowser(userAgent);
      const os = getOS(userAgent);
      
      const ip = await getIPAddress();
      let country = null;
      let city = null;
      
      if (ip) {
        const location = await getLocationFromIP(ip);
        country = location.country;
        city = location.city;
      }

      // Fallback to browser language if IP services fail
      if (!country && navigator.language) {
        const lang = navigator.language.split('-')[1];
        if (lang) {
          const countryNames: Record<string, string> = {
            'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
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
            'TN': 'Tunisia', 'DZ': 'Algeria', 'GH': 'Ghana', 'ET': 'Ethiopia', 'UG': 'Uganda',
            'TZ': 'Tanzania', 'ZW': 'Zimbabwe', 'BW': 'Botswana', 'NA': 'Namibia', 'ZM': 'Zambia',
            'MW': 'Malawi', 'MZ': 'Mozambique', 'MG': 'Madagascar', 'MU': 'Mauritius', 'SC': 'Seychelles',
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
          country = countryNames[lang] || null;
        }
      }

      setTestData({
        ip,
        country,
        city,
        deviceType,
        browser,
        os,
        userAgent,
        language: navigator.language
      });
    } catch (error) {
      setError('Failed to get IP and location data');
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          IP & Location Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading} className="w-full">
          {loading ? 'Testing...' : 'Test IP & Location Detection'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {testData && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">IP Address:</span>
                <Badge variant={testData.ip ? "default" : "secondary"}>
                  {testData.ip || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Country:</span>
                <Badge variant={testData.country ? "default" : "secondary"}>
                  {testData.country || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">City:</span>
                <Badge variant={testData.city ? "default" : "secondary"}>
                  {testData.city || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {getDeviceIcon(testData.deviceType)}
                <span className="text-sm font-medium">Device:</span>
                <Badge variant="outline">{testData.deviceType}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Browser:</span>
                <Badge variant="outline">{testData.browser}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">OS:</span>
                <Badge variant="outline">{testData.os}</Badge>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Language:</span>
                  <Badge variant="outline" className="ml-2">{testData.language}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">User Agent:</span>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    {testData.userAgent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IPTestComponent;
