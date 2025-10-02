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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Create random circles
    const colors = ["#FF6B6B", "#FFD460", "#6BCB77", "#4D96FF", "#E14D2A"];
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
        const gradient = ctx.createRadialGradient(
          c.x, c.y, 0, c.x, c.y, c.radius
        );
        gradient.addColorStop(0, c.color + "AA"); // semi-bright center
        gradient.addColorStop(1, c.color + "00"); // fade out
        ctx.fillStyle = gradient;
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        // Move circle
        c.x += c.dx;
        c.y += c.dy;

        if (c.x + c.radius > width || c.x - c.radius < 0) c.dx *= -1;
        if (c.y + c.radius > height || c.y - c.radius < 0) c.dy *= -1;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);
 
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      
    <section 
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: homeContent?.background_image 
          ? `url(${homeContent.background_image}), ${homeContent.background_gradient || 'linear-gradient(135deg, hsl(250, 70%, 15%), hsl(220, 70%, 10%))'}`
          : homeContent?.background_gradient || 'linear-gradient(135deg, hsl(250, 70%, 15%), hsl(220, 70%, 10%))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      ></canvas>

      {/* Foreground content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-7xl font-bold mb-6"
            style={{ color: homeContent?.text_color || 'hsl(0, 0%, 100%)' }}
          >
            Hi, I'm <span 
              style={{
                background: `linear-gradient(to right, ${homeContent?.primary_color || 'hsl(262, 83%, 58%)'}, ${homeContent?.secondary_color || 'hsl(180, 100%, 50%)'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                
              }} className='font-logo'
            >
              {homeContent?.name || 'Leul Ayfokru'}
            </span>
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            style={{ color: homeContent?.text_color || 'hsl(0, 0%, 100%)' }}
          >
            {homeContent?.tagline || 'Full-stack website and application developer based in Ethiopia.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              style={{
                backgroundColor: homeContent?.primary_color || 'hsl(262, 83%, 58%)',
                color: 'white',
              }}
            >
              <Link to="/projects">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              style={{
                borderColor: homeContent?.accent_color || 'hsl(262, 90%, 65%)',
                color: homeContent?.primary_color || 'hsla(0, 0%, 0%, 1.00)',
              }}
            >
              <Link to="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
 

      {/* Featured Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-muted-foreground">
                Some of my recent work that I'm proud of
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-lg transition-all duration-300">
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <Badge variant="outline">
                            +{project.tech_stack.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {project.github_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demo_url && (
                          <Button size="sm" asChild>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
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
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/projects">
                    View All Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Latest Blog Posts
              </h2>
              <p className="text-lg text-muted-foreground">
                Thoughts, tutorials, and insights from my development journey
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.created_at), 'MMM dd, yyyy')}
                        <Clock className="h-4 w-4 ml-2" />
                        {post.read_time} min read
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Tags will be implemented later with proper relationships */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/blog">
                    Read All Posts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;