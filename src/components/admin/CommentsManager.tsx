import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Trash2, Check, X, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: number;
  content: string;
  author_name: string;
  author_email: string;
  post_id: number;
  approved: boolean;
  likes_count: number;
  created_at: string;
}

export const CommentsManager = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading comments', variant: 'destructive' });
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting comment', variant: 'destructive' });
    } else {
      toast({ title: 'Comment deleted successfully' });
      loadComments();
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ approved })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error updating comment', variant: 'destructive' });
    } else {
      toast({ title: `Comment ${approved ? 'approved' : 'rejected'} successfully` });
      loadComments();
    }
  };

  const handleView = (comment: Comment) => {
    setSelectedComment(comment);
    setIsDialogOpen(true);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingComment) {
      const { error } = await supabase
        .from('comments')
        .update({
          content: formData.get('content') as string,
          author_name: formData.get('author_name') as string,
          author_email: formData.get('author_email') as string,
        })
        .eq('id', editingComment.id);
      
      if (error) {
        toast({ title: 'Error updating comment', variant: 'destructive' });
      } else {
        toast({ title: 'Comment updated successfully' });
      }
    }
    
    setIsEditDialogOpen(false);
    setEditingComment(null);
    loadComments();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comments Management</h2>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.author_name}</TableCell>
                <TableCell>{comment.author_email}</TableCell>
                <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                <TableCell>
                  <Badge variant={comment.approved ? 'default' : 'secondary'}>
                    {comment.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>{comment.likes_count}</TableCell>
                <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(comment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(comment)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!comment.approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(comment.id, true)}
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {comment.approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(comment.id, false)}
                      >
                        <X className="w-4 h-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <strong>Author:</strong> {selectedComment.author_name}
              </div>
              <div>
                <strong>Email:</strong> {selectedComment.author_email}
              </div>
              <div>
                <strong>Post ID:</strong> {selectedComment.post_id}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedComment.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong> <Badge>{selectedComment.approved ? 'Approved' : 'Pending'}</Badge>
              </div>
              <div>
                <strong>Likes:</strong> {selectedComment.likes_count}
              </div>
              <div>
                <strong>Comment:</strong>
                <p className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">{selectedComment.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          {editingComment && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Author Name</label>
                <Input name="author_name" defaultValue={editingComment.author_name} required />
              </div>
              <div>
                <label className="text-sm font-medium">Author Email</label>
                <Input name="author_email" type="email" defaultValue={editingComment.author_email} required />
              </div>
              <div>
                <label className="text-sm font-medium">Comment</label>
                <Textarea name="content" defaultValue={editingComment.content} required rows={6} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
