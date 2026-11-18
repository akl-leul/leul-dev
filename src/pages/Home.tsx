import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePageView } from '@/hooks/usePageView';
import {
  ArrowRight,
  ExternalLink,
  Github,
  Calendar,
  Clock,
  ChevronDown 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import { SITE_OWNER_ID } from '@/config/owner';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  tech_stack: string[];
  featured: boolean;
}

interface Post {
  id: number;
  title: string;
  excerpt: string | null;
  slug: string;
  created_at: string;
  read_time: number;
}

interface HomeContent {
  id: string;
  name: string;
  tagline: string;
  hero_image: string | null;
  background_image: string | null;
  background_gradient: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  text_color: string | null;
  accent_color: string | null;
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Home = () => {
  usePageView('Home');
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('featured', true)
          .eq('user_id', SITE_OWNER_ID)
          .limit(3);

        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, excerpt, slug, created_at, read_time')
          .eq('published', true)
          .eq('user_id', SITE_OWNER_ID)
          .order('created_at', { ascending: false })
          .limit(3);

        const { data: content } = await supabase
          .from('home_content')
          .select('*')
          .limit(1)
          .maybeSingle();

        setFeaturedProjects(projects || []);
        setLatestPosts(posts || []);
        setHomeContent(content);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6 }}
      className="space-y-0"
    >
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        aria-label="Hero section introducing the developer"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_70%_50%,hsl(var(--primary)/0.18),transparent_60%)]" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="space-y-7"
            >
              <p className="bp-label flex items-center gap-3">
                <span className="h-px w-10 bg-primary" /> SPEC.01 — Hi, I'm {homeContent?.name || 'Leul Ayfokru'}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] uppercase text-foreground">
                Build Scalable
                <span className="block text-primary">Efficient</span>
                Applications
              </h1>
              {homeContent?.tagline && (
                <p className="text-lg text-muted-foreground max-w-lg border-l-2 border-destructive pl-4">
                  {homeContent.tagline}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="bp-glow uppercase tracking-widest px-8">
                  <Link to="/projects" className="flex items-center gap-2">
                    See my works
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 max-w-md border border-border divide-x divide-border bg-card/60">
                {[
                  ['Mode', 'Full-stack'],
                  ['Build', 'Scalable'],
                  ['Status', 'Available'],
                ].map(([k, v]) => (
                  <div key={k} className="p-3">
                    <div className="bp-mono text-[10px] text-muted-foreground">{k}</div>
                    <div className="text-sm font-semibold text-foreground">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative bp-corners border border-border bg-card/40 p-6"
            >
              <div className="flex justify-between bp-mono text-[10px] text-muted-foreground mb-4">
                <span>FIG. A — SIDE ELEVATION</span>
                <span className="text-destructive">REV 2026</span>
              </div>
              {homeContent?.hero_image ? (
                <img src={homeContent.hero_image} alt="Profile" className="w-full h-[420px] object-contain" />
              ) : (
                <svg viewBox="0 0 600 260" className="w-full h-auto text-primary" fill="none" stroke="currentColor" aria-hidden="true">
                  <path className="bp-draw" strokeWidth="2" d="M40 190 L60 150 Q90 130 150 125 L230 85 Q280 62 360 66 L430 72 Q470 78 500 112 L545 126 Q568 134 570 160 L570 190 L520 190 M410 190 L200 190 M90 190 L40 190" />
                  <path className="bp-draw" strokeWidth="1.5" d="M240 90 L255 125 L470 120 Q450 90 420 82 Z M262 125 L360 124" />
                  <circle className="bp-draw" cx="145" cy="190" r="38" strokeWidth="2" />
                  <circle cx="145" cy="190" r="16" strokeWidth="1" opacity=".6" />
                  <circle className="bp-draw" cx="465" cy="190" r="38" strokeWidth="2" />
                  <circle cx="465" cy="190" r="16" strokeWidth="1" opacity=".6" />
                  <g stroke="hsl(var(--bp-cyan))" strokeWidth="1" opacity=".7" strokeDasharray="4 4">
                    <line x1="145" y1="240" x2="465" y2="240" />
                    <line x1="145" y1="232" x2="145" y2="248" />
                    <line x1="465" y1="232" x2="465" y2="248" />
                    <line x1="20" y1="66" x2="20" y2="228" />
                  </g>
                  <text x="270" y="256" fill="hsl(var(--bp-cyan))" stroke="none" fontSize="11" fontFamily="IBM Plex Mono">WHEELBASE 2,975 MM</text>
                  <path d="M500 120 L560 40" stroke="hsl(var(--bp-red))" strokeWidth="1" />
                  <text x="520" y="34" fill="hsl(var(--bp-red))" stroke="none" fontSize="11" fontFamily="IBM Plex Mono">AERO</text>
                </svg>
              )}
              <div className="bp-stripe mt-4" />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-7 h-7 text-primary" />
        </motion.div>
      </section>

      {/* Featured Projects Section */}
      <motion.section
        className="py-20 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={pageVariants}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground">Some of my recent work that I'm proud of</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16" />
                      <div className="h-6 bg-muted rounded w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div key={project.id}>
                  <Card className="overflow-hidden border border-border">
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={`${project.title} project screenshot`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-foreground">{project.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <Badge variant="outline">+{project.tech_stack.length - 3} more</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {project.github_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                              <Github className="h-4 w-4" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demo_url && (
                          <Button size="sm" asChild>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                              <ExternalLink className="h-4 w-4" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="text-center mt-14">
              <Button variant="outline" size="lg" asChild>
                <Link to="/projects" className="flex items-center justify-center gap-2">
                  View All Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Latest Blog Posts Section */}
      <motion.section
        className="py-20 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={pageVariants}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Latest Blog Posts</h2>
            <p className="text-lg text-muted-foreground">
              Thoughts, tutorials, and insights from my development journey
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full mb-4" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <article key={post.id}>
                  <Card className="h-full border border-border">
                    <CardHeader>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(post.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.read_time} min read
                        </span>
                      </div>
                      <CardTitle>
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
                    </CardHeader>
                  </Card>
                </article>
              ))}
            </div>
          )}

          {!loading && (
            <div className="text-center mt-14">
              <Button variant="outline" size="lg" asChild>
                <Link to="/blog" className="flex items-center justify-center gap-2">
                  Read All Posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>
    </motion.main>
  );
};

export default Home;
