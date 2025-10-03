import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ExternalLink, Github, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

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

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('featured', true)
          .limit(3);

        // Fetch latest blog posts
        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, excerpt, slug, created_at, read_time')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch home content
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

    // Create random circles
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
        gradient.addColorStop(0, c.color + 'AA'); // semi-bright center
        gradient.addColorStop(1, c.color + '00'); // fade out
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
    <main className="space-y-24">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:px-8"
        style={{
          background: homeContent?.background_image
            ? `url(${homeContent.background_image}), ${homeContent.background_gradient || 'linear-gradient(135deg,#3c1361,#0d1f40)'}`
            : homeContent?.background_gradient || 'linear-gradient(135deg,#3c1361,#0d1f40)',
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          backgroundAttachment: 'fixed, fixed',
          backgroundBlendMode: 'overlay',
        }}
        aria-label="Hero section introducing the developer"
      >
        {/* Animated background */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true"></canvas>

        {/* Foreground content */}
        <div className="relative max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            style={{ color: homeContent?.text_color || '#fff' }}
          >
            Hi, I'm{' '}
            <span
              className="font-logo"
              style={{
                background: `linear-gradient(to right, ${homeContent?.primary_color || '#8b5cf6'}, ${
                  homeContent?.secondary_color || '#14b8a6'
                })`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              aria-label={homeContent?.name || 'Leul Ayfokru'}
            >
              {homeContent?.name || 'Leul Ayfokru'}
            </span>
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl max-w-xl mx-auto mb-10 text-gray-100"
            style={{ color: homeContent?.text_color || 'rgba(255,255,255,0.85)' }}
          >
            {homeContent?.tagline || 'Full-stack website and application developer based in Ethiopia.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button
              size="lg"
              asChild
              style={{
                backgroundColor: homeContent?.primary_color || '#8b5cf6',
                color: '#fff',
                fontWeight: 600,
              }}
              aria-label="View my projects"
            >
              <Link to="/projects" className="flex items-center justify-center px-6 py-3 rounded-lg">
                View My Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              style={{
                borderColor: homeContent?.accent_color || '#a78bfa',
                color: homeContent?.primary_color || '#8b5cf6',
                fontWeight: 600,
              }}
              aria-label="Get in touch"
            >
              <Link to="/contact" className="flex items-center justify-center px-6 py-3 rounded-lg">
                Get In Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Featured Projects</h2>
          <p className="text-lg text-gray-600 select-none">Some of my recent work that I'm proud of</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-6 space-y4">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="flex gap-3 mt-4">
                    <div className="h-7 bg-gray-300 rounded w-14"></div>
                    <div className="h-7 bg-gray-300 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="group shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden flex flex-col"
                aria-label={`Project: ${project.title}`}
              >
                {project.image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={project.image_url}
                      alt={`${project.title} project screenshot`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{project.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech_stack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-sm font-medium">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <Badge variant="outline" className="text-sm font-medium">
                        +{project.tech_stack.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-auto flex-wrap">
                    {project.github_url && (
                      <Button size="sm" variant="outline" asChild aria-label={`View GitHub code for ${project.title}`}>
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Github className="h-4 w-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.demo_url && (
                      <Button size="sm" asChild aria-label={`View live demo for ${project.title}`}>
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" asChild aria-label="View all projects">
              <Link to="/projects" className="flex items-center justify-center gap-2">
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Latest Blog Posts</h2>
          <p className="text-lg text-gray-600 select-none">Thoughts, tutorials, and insights from my development journey</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow rounded-lg overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {latestPosts.map((post) => (
              <Card
                key={post.id}
                className="group shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col"
                aria-label={`Blog post titled ${post.title}`}
              >
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 select-none" aria-hidden="true">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={post.created_at}>{format(new Date(post.created_at), 'MMM dd, yyyy')}</time>
                    <Clock className="h-4 w-4 ml-4" aria-hidden="true" />
                    <span>{post.read_time} min read</span>
                  </div>
                  <CardTitle className="group-hover:text-indigo-600 transition-colors text-lg font-semibold">
                    <Link to={`/blog/${post.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
                      {post.title}
                    </Link>
                  </CardTitle>
                  {post.excerpt && <CardDescription className="line-clamp-3 mt-2 text-gray-700">{post.excerpt}</CardDescription>}
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow"></CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-center mt-16">
            <Button variant="outline" size="lg" asChild aria-label="Read all blog posts">
              <Link to="/blog" className="flex items-center justify-center gap-2">
                Read All Posts
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
