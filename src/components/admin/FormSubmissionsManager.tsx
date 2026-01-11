import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Trash2, 
  Eye, 
  RefreshCw,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TablePagination } from './TablePagination';
import { usePagination } from '@/hooks/usePagination';

interface FormSubmission {
  id: string;
  form_id: string;
  page_id: string | null;
  form_name: string | null;
  data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export function FormSubmissionsManager() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const dataStr = JSON.stringify(s.data).toLowerCase();
      return (
        dataStr.includes(searchLower) ||
        s.form_name?.toLowerCase().includes(searchLower) ||
        s.form_id.toLowerCase().includes(searchLower)
      );
    });
  }, [submissions, searchQuery]);

  const pagination = usePagination({ data: filteredSubmissions, itemsPerPage: 10 });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev =>
        prev.map(s => (s.id === id ? { ...s, status } : s))
      );
      
      toast({
        title: 'Updated',
        description: `Status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Deleted',
        description: 'Submission has been deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete submission',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" /> New</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Reviewed</Badge>;
      case 'archived':
        return <Badge variant="outline" className="gap-1"><Archive className="h-3 w-3" /> Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderDataPreview = (data: Record<string, any>) => {
    const entries = Object.entries(data).slice(0, 2);
    return entries
      .map(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${key}: ${displayValue.slice(0, 20)}${displayValue.length > 20 ? '...' : ''}`;
      })
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form</TableHead>
              <TableHead>Data Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading submissions...
                </TableCell>
              </TableRow>
            ) : pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">
                        {submission.form_name || 'Unnamed Form'}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {submission.form_id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {renderDataPreview(submission.data as Record<string, any>)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={submission.status}
                      onValueChange={(v) => updateStatus(submission.id, v)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        {getStatusBadge(submission.status)}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteSubmission(submission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.goToPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
      />

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.form_name || 'Form'} Submission
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4 py-4">
              {selectedSubmission && (
                <>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">
                      Submitted {new Date(selectedSubmission.created_at).toLocaleString()}
                    </span>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                  <div className="space-y-3">
                    {Object.entries(selectedSubmission.data as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </Label>
                        <div className="p-2 bg-muted rounded text-sm">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className || ''}`}>{children}</label>;
}
