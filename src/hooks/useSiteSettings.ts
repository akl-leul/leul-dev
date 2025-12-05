import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  meta_keywords: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'Leul Dev',
  site_description: 'Portfolio & Blog',
  site_url: '',
  meta_keywords: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_name', 'site_description', 'site_url', 'meta_keywords']);

      if (data && data.length > 0) {
        const settingsMap: Partial<SiteSettings> = {};
        data.forEach((item) => {
          settingsMap[item.setting_key as keyof SiteSettings] = item.setting_value;
        });
        setSettings({ ...defaultSettings, ...settingsMap });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, refetch: fetchSettings };
}
