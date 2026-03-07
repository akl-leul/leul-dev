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
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: homeContent?.background_image 
            ? `url(${homeContent.background_image}) center/cover no-repeat`
            : homeContent?.background_gradient || 'linear-gradient(135deg, hsl(252 100% 67%), hsl(280 65% 60%))',
        }}
        aria-label="Hero section introducing the developer"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'hsl(252 100% 70%)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: 'hsl(280 65% 60%)' }}
            animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'hsl(200 80% 60%)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24" style={{ zIndex: 10 }}>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6 z-10"
            >
              <motion.p
                className="text-lg md:text-xl font-medium text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Hi, I'm {homeContent?.name || 'Leul Ayfokru'}
              </motion.p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
                <motion.span
                  className="block text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Build Scalable
                </motion.span>
                <motion.span
                  className="block text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Efficient
                </motion.span>
                <motion.span
                  className="block text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Applications
                </motion.span>
              </h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 shadow-lg"
                >
                  <Link to="/projects" className="flex items-center gap-2">
                    See my works
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative h-[600px] lg:h-[700px]"
            >
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <motion.h2
                  className="text-[180px] md:text-[240px] lg:text-[300px] font-bold opacity-10 select-none text-white"
                  style={{ letterSpacing: '-0.05em', lineHeight: 0.8 }}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.15 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                  Code
                </motion.h2>
              </div>

              {homeContent?.hero_image && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <img
                    src={homeContent.hero_image}
                    alt="Profile"
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll Down */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1.5,
            ease: 'easeInOut',
            delay: 2,
          }}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-8 h-8 text-white" />
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
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.image_url}
                          alt={`${project.title} project screenshot`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                </motion.div>
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
              {latestPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group h-full border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
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
                      <CardTitle className="group-hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
                    </CardHeader>
                  </Card>
                </motion.article>
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
