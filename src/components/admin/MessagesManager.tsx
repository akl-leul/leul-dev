import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Trash2, Pencil, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export const MessagesManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch = msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, filterStatus]);

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
  } = usePagination({ data: filteredMessages, itemsPerPage: 10 });

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading messages', variant: 'destructive' });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting message', variant: 'destructive' });
    } else {
      toast({ title: 'Message deleted successfully' });
      loadMessages();
    }
  };

  const handleView = async (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    
    if (message.status === 'new') {
      await supabase
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', message.id);
      loadMessages();
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    } else {
      toast({ title: 'Status updated successfully' });
      loadMessages();
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMessage) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase
      .from('contact_submissions')
      .update({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
      })
      .eq('id', editingMessage.id);
    
    if (error) {
      toast({ title: 'Error updating message', variant: 'destructive' });
    } else {
      toast({ title: 'Message updated successfully' });
      setIsEditDialogOpen(false);
      loadMessages();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Messages Management</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
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
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="font-medium">{message.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{message.email}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[150px] truncate">{message.subject}</TableCell>
                <TableCell>
                  <Badge variant={message.status === 'new' ? 'default' : message.status === 'read' ? 'secondary' : 'outline'}>
                    {message.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{new Date(message.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => handleView(message)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(message)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(message.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' ? 'No messages match your filters' : 'No messages yet'}
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
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})
              </div>
              <div>
                <strong>Subject:</strong> {selectedMessage.subject}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong> <Badge>{selectedMessage.status}</Badge>
              </div>
              <div>
                <strong>Message:</strong>
                <p className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          {editingMessage && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingMessage.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingMessage.email}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingMessage.subject}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  defaultValue={editingMessage.message}
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
