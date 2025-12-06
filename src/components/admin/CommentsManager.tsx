import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Trash2, Check, X, Pencil, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';

interface Comment {
  id: number;
  content: string;
  author_name: string;
  author_email: string;
  post_id: number;
  parent_id?: number;
  user_id?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredComments = useMemo(() => {
    return comments.filter(comment => {
      const matchesSearch = comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'approved' && comment.approved) ||
        (filterStatus === 'pending' && !comment.approved);
      return matchesSearch && matchesStatus;
    });
  }, [comments, searchQuery, filterStatus]);

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: filteredComments, itemsPerPage: 10 });

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Comments Management</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Content</TableHead>
              <TableHead className="hidden lg:table-cell">Post ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Likes</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.author_name}</TableCell>
                <TableCell className="hidden sm:table-cell">{comment.author_email}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[150px] truncate">{comment.content}</TableCell>
                <TableCell className="hidden lg:table-cell">{comment.post_id}</TableCell>
                <TableCell>
                  <Badge variant={comment.approved ? 'default' : 'secondary'}>
                    {comment.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{comment.likes_count}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => handleView(comment)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(comment)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleApprove(comment.id, !comment.approved)}>
                      {comment.approved ? <X className="w-4 h-4 text-yellow-600" /> : <Check className="w-4 h-4 text-green-600" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(comment.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' ? 'No comments match your filters' : 'No comments yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
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
                <strong>Parent ID:</strong> {selectedComment.parent_id || 'None (Top-level comment)'}
              </div>
              <div>
                <strong>User ID:</strong> {selectedComment.user_id || 'Anonymous'}
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
                <Label htmlFor="author_name">Author Name</Label>
                <Input id="author_name" name="author_name" defaultValue={editingComment.author_name} required />
              </div>
              <div>
                <Label htmlFor="author_email">Author Email</Label>
                <Input id="author_email" name="author_email" type="email" defaultValue={editingComment.author_email} required />
              </div>
              <div>
                <Label htmlFor="content">Comment</Label>
                <Textarea id="content" name="content" defaultValue={editingComment.content} required rows={6} />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Post ID, Parent ID, and User ID cannot be edited here for data integrity.
                </p>
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
