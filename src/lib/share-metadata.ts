export const SITE_URL = 'https://leul.tech';
export const HOME_IMAGE = `${SITE_URL}/leul-social-preview.jpg`;

export interface ShareContent {
  title?: string;
  description?: string | null;
  image?: string | null;
  type?: 'website' | 'article';
}

const pages: Record<string, ShareContent> = {
  '/': { title: 'Leul Ayfokru — Developer & Engineer', description: 'Code, engineering, and a different perspective. Explore my projects, writing, and professional journey.' },
  '/projects': { title: 'Projects — Leul Ayfokru', description: 'A collection of applications, experiments, and engineering projects by Leul Ayfokru.' },
  '/blog': { title: 'Articles — Leul Ayfokru', description: 'Notes on development, engineering, and building things that matter.' },
  '/about': { title: 'My journey — Leul Ayfokru', description: 'The experience, ideas, and engineering background behind my work.' },
  '/skills': { title: 'Skills — Leul Ayfokru', description: 'The tools and technologies behind my development and engineering work.' },
  '/achievements': { title: 'Recognition — Leul Ayfokru', description: 'Certificates, awards, publications, and milestones from my professional journey.' },
  '/contact': { title: 'Let’s build — Leul Ayfokru', description: 'Get in touch with Leul Ayfokru about your next project or collaboration.' },
};

export function getShareMetadata(pathname: string, content?: ShareContent) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const fallback = pages[path] || { title: 'Leul Ayfokru — Portfolio', description: 'Projects, writing, and engineering by Leul Ayfokru.' };
  const image = content?.image;
  return {
    title: content?.title || fallback.title,
    description: (content?.description || fallback.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200),
    image: image && /^https:\/\//.test(image) ? image : HOME_IMAGE,
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    type: content?.type || 'website',
  };
}