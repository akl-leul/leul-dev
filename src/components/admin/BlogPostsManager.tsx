import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ImageCropUpload } from './ImageCropUpload';
import { RichTextEditor } from './RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id?: number;
  status: string;
  published: boolean;
  read_time: number;
  views: number;
  likes_count: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export const BlogPostsManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading posts', variant: 'destructive' });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting post', variant: 'destructive' });
    } else {
      toast({ title: 'Post deleted successfully' });
      loadPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('posts')
      .update({ 
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null
      })
      .eq('id', post.id);
    
    if (error) {
      toast({ title: 'Error updating post', variant: 'destructive' });
    } else {
      toast({ title: `Post ${!post.published ? 'published' : 'unpublished'} successfully` });
      loadPosts();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const categoryId = formData.get('category_id') as string;
    
    const postData = {
      title,
      slug,
      excerpt: formData.get('excerpt') as string,
      content: contentHtml,
      featured_image: featuredImage || null,
      category_id: categoryId ? parseInt(categoryId) : null,
      read_time: parseInt(formData.get('read_time') as string) || 5,
      status: formData.get('status') as string,
      published: formData.get('published') === 'true',
    };

    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', editingPost.id);
      
      if (error) {
        toast({ title: 'Error updating post', variant: 'destructive' });
      } else {
        toast({ title: 'Post updated successfully' });
      }
    }
    
    setIsDialogOpen(false);
    setEditingPost(null);
    loadPosts();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Blog Posts Management</h2>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="hidden lg:table-cell">Likes</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[150px] truncate">{post.title}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={post.published ? 'default' : 'secondary'}>
                    {post.published ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{post.views}</TableCell>
                <TableCell className="hidden lg:table-cell">{post.likes_count}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setFeaturedImage(post.featured_image || null);
                        setContentHtml(post.content || '');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <form onSubmit={handleSave} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="meta">Metadata</TabsTrigger>
                </TabsList>
                
                <div className="max-h-[60vh] overflow-y-auto px-1 mt-4">
                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" name="title" defaultValue={editingPost.title} required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input id="slug" name="slug" placeholder="url-friendly-title" defaultValue={editingPost.slug} required />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Excerpt *</Label>
                      <Textarea id="excerpt" name="excerpt" defaultValue={editingPost.excerpt} required rows={3} />
                    </div>
                    <div>
                      <ImageCropUpload
                        bucketName="blog-media"
                        label="Featured Image"
                        currentImageUrl={featuredImage || undefined}
                        onImageUpdate={(url) => setFeaturedImage(url)}
                        aspectRatio={16 / 9}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label>Blog Post Content</Label>
                      <RichTextEditor
                        content={contentHtml || editingPost.content || ''}
                        onChange={setContentHtml}
                        placeholder="Write your blog post content..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="meta" className="space-y-4">
                    <div>
                      <Label htmlFor="category_id">Category ID</Label>
                      <Input id="category_id" name="category_id" type="number" placeholder="Category ID" defaultValue={editingPost.category_id || ''} />
                    </div>
                    <div>
                      <Label htmlFor="read_time">Read Time (minutes) *</Label>
                      <Input id="read_time" name="read_time" type="number" min="1" defaultValue={editingPost.read_time} required />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingPost.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="published">Published</Label>
                      <Select name="published" defaultValue={editingPost.published ? 'true' : 'false'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Views</Label>
                        <Input value={editingPost.views} disabled />
                      </div>
                      <div>
                        <Label>Likes Count</Label>
                        <Input value={editingPost.likes_count} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>Published At</Label>
                      <Input value={editingPost.published_at ? new Date(editingPost.published_at).toLocaleString() : 'Not published'} disabled />
                    </div>
                    <div>
                      <Label>User ID</Label>
                      <Input value={editingPost.user_id || 'N/A'} disabled className="text-xs" />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
