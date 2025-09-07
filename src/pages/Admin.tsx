import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  featured: boolean;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  slug: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);

  // New Post form state
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [readTime, setReadTime] = useState(5);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFeaturedImageFile(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = featuredImageUrl;

      if (featuredImageFile) {
        const path = `user-${user.id}/${Date.now()}-${featuredImageFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('blog-images')
          .upload(path, featuredImageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title,
        slug,
        excerpt,
        content,
        featured_image: imageUrl || null,
        published,
        published_at: published ? new Date().toISOString() : null,
        read_time: readTime,
        user_id: user.id,
      } as any);
      if (insertError) throw insertError;

      toast({ title: 'Post created', description: 'Your post has been created successfully.' });
      setNewPostOpen(false);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setPublished(false);
      setReadTime(5);
      setFeaturedImageFile(null);
      setFeaturedImageUrl('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to create post', error);
      toast({ title: 'Error', description: error.message || 'Failed to create post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);
      
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user?.id);

      setProjects(projectsData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
      fetchData();
    }
  };

  const deletePost = async (id: number) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
      fetchData();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 space-y-4 text-center">
            <p>Please log in to access the admin panel.</p>
            <Button asChild>
              <a href="/auth">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="posts">Blog Posts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Projects</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {project.title}
                            {project.featured && <Badge>Featured</Badge>}
                          </CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Blog Posts</h2>
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="content">Content (Markdown)</Label>
                      <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[160px]" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="read_time">Read time (min)</Label>
                        <Input id="read_time" type="number" min={1} value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} />
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <Label htmlFor="published">Publish now</Label>
                        <Switch id="published" checked={published} onCheckedChange={setPublished} />
                      </div>
                    </div>
                    <div>
                      <Label>Featured image</Label>
                      <Input type="file" accept="image/*" onChange={handleFileChange} />
                      <div className="text-xs text-muted-foreground mt-1">Or paste an image URL</div>
                      <Input placeholder="https://..." value={featuredImageUrl} onChange={(e) => setFeaturedImageUrl(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setNewPostOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Post'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {post.title}
                            {post.published ? (
                              <Badge>Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{post.excerpt}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Name" />
                <Input placeholder="Email" />
                <Textarea placeholder="Bio" />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;