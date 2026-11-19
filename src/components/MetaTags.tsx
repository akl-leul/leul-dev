import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getShareMetadata, HOME_IMAGE, ShareContent } from '@/lib/share-metadata';
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
  const { pathname } = useLocation();
  const [page, setPage] = useState<{ path: string; content: ShareContent } | null>(null);

  useEffect(() => {
    let active = true;
    setPage(null);
    const load = async () => {
      let content: ShareContent | undefined;
      const project = pathname.match(/^\/projects\/([^/]+)\/?$/);
      const article = pathname.match(/^\/blog\/([^/]+)\/?$/);
      const dynamic = pathname.match(/^\/page\/([^/]+)\/?$/);
      if (project) {
        const { data } = await supabase.from('projects').select('title, description, image_url').eq('id', project[1]).maybeSingle();
        if (data) content = { title: `${data.title} — Leul Ayfokru`, description: data.description, image: data.image_url };
      } else if (article) {
        const { data } = await supabase.from('posts').select('title, excerpt, featured_image').eq('slug', decodeURIComponent(article[1])).eq('published', true).maybeSingle();
        if (data) content = { title: `${data.title} — Leul Ayfokru`, description: data.excerpt, image: data.featured_image, type: 'article' };
      } else if (dynamic) {
        const { data } = await supabase.from('dynamic_pages').select('title, meta_description, password').eq('slug', decodeURIComponent(dynamic[1])).eq('is_published', true).maybeSingle();
        if (data && !data.password) content = { title: `${data.title} — Leul Ayfokru`, description: data.meta_description };
      }
      if (active && content) setPage({ path: pathname, content });
    };
    void load().catch(() => { /* Keep the safe page fallback when content is unavailable. */ });
    return () => { active = false; };
  }, [pathname]);

  const metadata = getShareMetadata(pathname, {
    ...(page?.path === pathname ? page.content : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(ogImage ? { image: ogImage } : {}),
  });

  useEffect(() => {
    // Use provided props or fall back to settings
    const finalKeywords = keywords || settings.meta_keywords;
    const finalFavicon = favicon || settings.favicon_url;

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
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', 'Leul-ayfokru');

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

  return (
    <Helmet>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="canonical" href={metadata.url} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:url" content={metadata.url} />
      <meta property="og:type" content={metadata.type} />
      <meta property="og:image" content={metadata.image} />
      <meta property="og:image:alt" content={metadata.title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={metadata.image} />
      <meta name="twitter:image:alt" content={metadata.title} />
      {metadata.image === HOME_IMAGE && <meta property="og:image:width" content="1200" />}
      {metadata.image === HOME_IMAGE && <meta property="og:image:height" content="630" />}
    </Helmet>
  );
};
