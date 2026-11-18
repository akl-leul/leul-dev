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
import HeroPortrait3D from '@/components/HeroPortrait3D';

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
  const [counts, setCounts] = useState({ projects: 0, posts: 0 });

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

        const [{ count: pc }, { count: bc }] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', SITE_OWNER_ID),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true).eq('user_id', SITE_OWNER_ID),
        ]);
        setCounts({ projects: pc ?? 0, posts: bc ?? 0 });
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
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_72%_45%,hsl(var(--primary)/0.22),transparent_55%)]" />

        {/* Vertical side rail */}
        <div className="hidden md:flex absolute left-6 lg:left-10 top-32 bottom-16 flex-col items-center gap-6 z-10">
          <span className="bp-mono text-[10px] tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">FULL-STACK DEVELOPER</span>
          <span className="flex-1 w-px bg-border" />
          <span className="bp-mono text-[10px] tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">{new Date().getFullYear()}</span>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 md:pl-24 lg:pl-28 pt-28 pb-16 z-10">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-col gap-10 lg:min-h-[70vh] justify-between"
            >
              <div className="flex gap-10">
                {[['+' , `${counts.projects}`, 'Projects built'], ['+', `${counts.posts}`, 'Articles written']].map(([s, n, l]) => (
                  <div key={l}>
                    <div className="text-4xl font-light text-foreground"><sup className="text-primary text-lg mr-0.5">{s}</sup>{n}</div>
                    <div className="bp-mono text-[10px] tracking-widest text-muted-foreground mt-1 uppercase">{l}</div>
                  </div>
                ))}
              </div>

              <div>
                <h1 className="text-[22vw] sm:text-[9rem] lg:text-[11rem] font-light leading-[0.85] tracking-tight text-foreground">
                  Hello<span className="text-destructive">.</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground flex items-center gap-3">
                  <span className="h-px w-8 bg-primary" />
                  It's {homeContent?.name || 'Leul Ayfokru'} — I build scalable, efficient applications
                </p>
                {homeContent?.tagline && (
                  <p className="mt-3 text-sm text-muted-foreground max-w-md pl-11">{homeContent.tagline}</p>
                )}
                <Link to="/projects" className="mt-8 ml-11 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-foreground border-b border-primary pb-1 hover:text-primary transition-colors">
                  See my works <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <a href="#featured" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Scroll down <ChevronDown className="h-4 w-4" />
              </a>
            </motion.div>

            <HeroPortrait3D />
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <motion.section
        id="featured"
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
                  <Card className="bp-card overflow-hidden border border-border">
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
                  <Card className="bp-card h-full border border-border">
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
