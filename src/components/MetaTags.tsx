import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  favicon?: string;
  url?: string;
}

export const MetaTags = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  favicon, 
  url 
}: MetaTagsProps) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Use provided props or fall back to settings
    const finalTitle = title || settings.site_name;
    const finalDescription = description || settings.site_description;
    const finalKeywords = keywords || settings.meta_keywords;
    const finalOgImage = ogImage || settings.og_image_url;
    const finalFavicon = favicon || settings.favicon_url;
    const finalUrl = url || settings.site_url || window.location.origin;

    // Update document title
    if (finalTitle) {
      document.title = finalTitle;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag: HTMLMetaElement | null = null;
      
      if (property) {
        tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      } else {
        tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      }

      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', property);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }

      if (content) {
        tag.setAttribute('content', content);
      } else {
        tag.removeAttribute('content');
      }
    };

    // Update basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', 'Leul-ayfokru');

    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle, 'og:title');
    updateMetaTag('og:description', finalDescription, 'og:description');
    updateMetaTag('og:image', finalOgImage, 'og:image');
    updateMetaTag('og:url', finalUrl, 'og:url');
    updateMetaTag('og:type', 'website', 'og:type');

    // Update Twitter Card tags
    updateMetaTag('twitter:title', finalTitle, 'twitter:title');
    updateMetaTag('twitter:description', finalDescription, 'twitter:description');
    updateMetaTag('twitter:image', finalOgImage, 'twitter:image');
    updateMetaTag('twitter:card', 'summary_large_image', 'twitter:card');
    updateMetaTag('twitter:site', '@Leul_et', 'twitter:site');

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalUrl);

    // Update favicon
    if (finalFavicon) {
      // Update existing favicon or create new one
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', finalFavicon);
      faviconLink.setAttribute('type', 'image/x-icon');

      // Update apple-touch-icon
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.setAttribute('href', finalFavicon);
    }

    // Update Google site verification
    updateMetaTag('google-site-verification', 'gds3Lmz-g0V9fAnNLVVjg6AmoERfqkyrDRYkaDZZCYc');

  }, [title, description, keywords, ogImage, favicon, url, settings]);

  return null; // This component doesn't render anything
};
