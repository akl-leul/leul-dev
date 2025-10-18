import { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, Variants } from 'framer-motion';

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

// Page and element animation variants
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const iconAnimation = {
  idle: {
    rotate: [0, 5, 0, -5, 0],
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" as const },
  },
  hover: {
    scale: 1.2,
    rotate: [0, 15, -15, 0],
    transition: { duration: 0.5 },
  },
};

const Home = () => {
  usePageView('Home');
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('featured', true)
          .limit(3);

        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, excerpt, slug, created_at, read_time')
          .eq('published', true)
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

  // Canvas background animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#FF6B6B', '#FFD460', '#6BCB77', '#4D96FF', '#E14D2A'];
    const circles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 40 + Math.random() * 60,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);
      circles.forEach((c) => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        gradient.addColorStop(0, c.color + 'AA');
        gradient.addColorStop(1, c.color + '00');
        ctx.fillStyle = gradient;
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        c.x += c.dx;
        c.y += c.dy;
        if (c.x + c.radius > width || c.x - c.radius < 0) c.dx *= -1;
        if (c.y + c.radius > height || c.y - c.radius < 0) c.dy *= -1;
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6 }}
      className="space-y-20"
    >
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden "
        style={{
          background: homeContent?.background_gradient || 'linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))',
        }}
        aria-label="Hero section introducing the developer"
      >
        {/* Animated background canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  mt-24">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6 z-10"
            >
              <p
                className="text-lg md:text-xl font-medium"
                style={{ color: homeContent?.text_color || 'rgba(255, 255, 255, 0.9)' }}
              >
                Hi, I'm {homeContent?.name || 'Leul Ayfokru'}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
                <motion.span
                  className="block"
                  style={{ color: homeContent?.text_color || '#fff' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Let's Create
                </motion.span>
                <motion.span
                  className="block"
                  style={{ color: homeContent?.text_color || '#fff' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Portraits That
                </motion.span>
                <motion.span
                  className="block"
                  style={{ color: homeContent?.text_color || '#fff' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Tell Your Story
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
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8"
                >
                  <Link to="/projects" className="flex items-center gap-2">
                    See my works
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Image with text overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative h-[600px] lg:h-[700px]"
            >
              {/* Large artistic text behind image */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <motion.h2
                  className="text-[180px] md:text-[240px] lg:text-[300px] font-bold opacity-10 select-none"
                  style={{
                    color: homeContent?.text_color || '#fff',
                    letterSpacing: '-0.05em',
                    lineHeight: 0.8,
                  }}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.15 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                 Code
                </motion.h2>
              </div>
              
              {/* Profile image */}
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
      </section>

      {/* Featured Projects Section */}
      <motion.section
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={pageVariants}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground">Some of my recent work that I'm proud of</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-live="polite">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  className="group hover:shadow-lg transition-all duration-300 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.04, zIndex: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4 }}
                  aria-label={`Project: ${project.title}`}
                >
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={project.image_url}
                        alt={`${project.title} project screenshot`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <Badge variant="outline">+{project.tech_stack.length - 3} more</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {project.github_url && (
                        <Button size="sm" variant="outline" asChild aria-label={`View GitHub code for ${project.title}`}>
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <motion.span whileHover={iconAnimation.hover} animate={iconAnimation.idle} className="mr-2">
                              <Github className="h-4 w-4" />
                            </motion.span>
                            Code
                          </a>
                        </Button>
                      )}
                      {project.demo_url && (
                        <Button size="sm" asChild aria-label={`View live demo for ${project.title}`}>
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <motion.span whileHover={iconAnimation.hover} animate={iconAnimation.idle} className="mr-2">
                              <ExternalLink className="h-4 w-4" />
                            </motion.span>
                            Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild aria-label="View all projects">
                <Link to="/projects" className="flex items-center justify-center gap-2">
                  View All Projects
                  <motion.span whileHover={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Latest Blog Posts Section */}
      <motion.section
        className="py-16 bg-muted/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={pageVariants}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Latest Blog Posts</h2>
            <p className="text-lg text-muted-foreground">
              Thoughts, tutorials, and insights from my development journey
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-live="polite">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-4"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <motion.article
                  key={post.id}
                  className="group hover:shadow-lg transition-all duration-300 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4 }}
                  aria-label={`Blog post titled ${post.title}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <motion.span
                        animate={iconAnimation.idle}
                        whileHover={iconAnimation.hover}
                        className="flex items-center"
                        aria-hidden="true"
                      >
                        <Calendar className="h-4 w-4" />
                      </motion.span>
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                      <motion.span
                        animate={iconAnimation.idle}
                        whileHover={iconAnimation.hover}
                        className="flex items-center ml-2"
                        aria-hidden="true"
                      >
                        <Clock className="h-4 w-4" />
                      </motion.span>
                      {post.read_time} min read
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
                  </CardHeader>
                  <CardContent>{/* future tags */}</CardContent>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild aria-label="Read all blog posts">
                <Link to="/blog" className="flex items-center justify-center gap-2">
                  Read All Posts
                  <motion.span whileHover={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
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
