import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  status: string;
  published: boolean;
  views: number;
  likes_count: number;
  created_at: string;
  published_at?: string;
}

export const BlogPostsManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts Management</h2>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={post.published ? 'default' : 'secondary'}>
                    {post.published ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell>{post.likes_count}</TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
    </div>
  );
};
