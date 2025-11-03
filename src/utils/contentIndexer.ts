// Content indexer for website pages
export interface PageContent {
  path: string;
  title: string;
  content: string;
  keywords: string[];
}

export const websiteContent: PageContent[] = [
  {
    path: '/',
    title: 'Home',
    content: 'Full stack website and application developer. Build Scalable Efficient Applications. Featured projects showcasing various technologies. Latest blog posts with thoughts, tutorials, and insights from development journey.',
    keywords: ['home', 'developer', 'full stack', 'applications', 'projects', 'blog', 'portfolio', 'web development', 'scalable', 'efficient']
  },
  {
    path: '/about',
    title: 'About Me',
    content: 'Leul Ayfokru - Full-stack Website and Application Developer from Addis Ababa, Ethiopia. Passionate full-stack developer with love for creating elegant solutions to complex problems. Several years of experience in web development. Enjoy working with modern technologies and frameworks to build scalable, user-friendly applications. When not coding, exploring new technologies, contributing to open-source projects, sharing knowledge through blog posts and tutorials. Believe in continuous learning and staying up-to-date with latest trends in web development. Work experience includes various roles and companies.',
    keywords: ['about', 'biography', 'developer', 'full stack', 'experience', 'ethiopia', 'addis ababa', 'work history', 'career', 'skills', 'background', 'leul', 'ayfokru']
  },
  {
    path: '/skills',
    title: 'Skills & Technologies',
    content: 'Comprehensive overview of technical skills and experience levels. Programming languages: JavaScript, TypeScript, Python, HTML5, CSS3. Frontend frameworks: React, React Native, Next.js, Vite. State management: Redux, React Query, React Hook Form. Testing: Jest, Cypress. DevOps: Git, GitHub Actions, Docker, Kubernetes. Deployment: Vercel. Backend: Node.js, GraphQL. Styling: Bootstrap, TailwindCSS, Sass. Databases: MySQL, PostgreSQL, SQLite, Prisma, Supabase. Design tools: Figma, Canva, Adobe Photoshop, Blender, Framer. Other: WordPress, Ethical Hacking. Skills categorized by proficiency levels: beginner, intermediate, advanced, expert.',
    keywords: ['skills', 'technologies', 'programming', 'languages', 'frameworks', 'react', 'typescript', 'javascript', 'python', 'nodejs', 'database', 'design', 'devops', 'expertise', 'proficiency']
  },
  {
    path: '/projects',
    title: 'Projects',
    content: 'Collection of projects showcasing various technologies and skills. Projects include web applications, mobile apps, and full-stack solutions. Each project features tech stack, github repository, live demos, and detailed descriptions. Projects can be filtered by technology stack. Featured projects highlighted with star. Projects include completed and in-progress status.',
    keywords: ['projects', 'portfolio', 'work', 'applications', 'demos', 'github', 'code', 'tech stack', 'web apps', 'mobile apps', 'showcase']
  },
  {
    path: '/blog',
    title: 'Blog',
    content: 'Blog posts featuring thoughts, tutorials, insights, and technical articles. Topics include web development, programming, best practices, tutorials, and industry insights. Articles organized by date with reading time estimates. Posts cover various aspects of software development and technology.',
    keywords: ['blog', 'articles', 'posts', 'tutorials', 'writing', 'insights', 'thoughts', 'guides', 'documentation', 'learning']
  },
  {
    path: '/contact',
    title: 'Contact',
    content: 'Get in touch. Contact information including email, phone, and location. Contact form available to send messages. Response time typically within 24-48 hours. Available for freelance projects, collaborations, job opportunities, or just to chat about technology.',
    keywords: ['contact', 'email', 'message', 'get in touch', 'reach out', 'communicate', 'hire', 'freelance', 'collaboration', 'location', 'phone']
  }
];

export function searchContent(query: string): PageContent[] {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  return websiteContent
    .map(page => {
      let score = 0;
      
      // Check title match
      if (page.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Check keyword matches
      page.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerQuery) || lowerQuery.includes(keyword.toLowerCase())) {
          score += 5;
        }
      });
      
      // Check content matches
      words.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = page.content.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      return { page, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.page);
}
