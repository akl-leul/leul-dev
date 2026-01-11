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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  Archive,
  ArrowLeft,
  BarChart3,
  ListFilter,
  FileSpreadsheet,
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

interface GroupedForm {
  id: string;
  name: string;
  count: number;
  lastSubmission: string;
  submissions: FormSubmission[];
}

export function FormSubmissionsManager() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // New view states
  const [viewMode, setViewMode] = useState<'forms' | 'detail'>('forms');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const groupedForms = useMemo(() => {
    const groups: Record<string, GroupedForm> = {};

    submissions.forEach(s => {
      const formKey = s.form_id || 'unknown';
      if (!groups[formKey]) {
        groups[formKey] = {
          id: formKey,
          name: s.form_name || 'Unnamed Form',
          count: 0,
          lastSubmission: s.created_at,
          submissions: []
        };
      }
      groups[formKey].count++;
      groups[formKey].submissions.push(s);
      if (new Date(s.created_at) > new Date(groups[formKey].lastSubmission)) {
        groups[formKey].lastSubmission = s.created_at;
      }
    });

    return Object.values(groups).sort((a, b) =>
      new Date(b.lastSubmission).getTime() - new Date(a.lastSubmission).getTime()
    );
  }, [submissions]);

  const selectedForm = useMemo(() => {
    return groupedForms.find(f => f.id === selectedFormId) || null;
  }, [groupedForms, selectedFormId]);

  const filteredSubmissions = useMemo(() => {
    if (!selectedForm) return [];

    return selectedForm.submissions.filter(s => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const dataStr = JSON.stringify(s.data).toLowerCase();
      return dataStr.includes(searchLower);
    });
  }, [selectedForm, searchQuery, statusFilter]);

  const pagination = usePagination({ data: filteredSubmissions, itemsPerPage: 10 });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

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
  }, []);

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

  const renderAnalysis = () => {
    if (!selectedForm) return null;

    const fieldStats: Record<string, Record<string, number>> = {};
    const submissions = selectedForm.submissions;

    submissions.forEach(s => {
      Object.entries(s.data).forEach(([key, value]) => {
        if (!fieldStats[key]) fieldStats[key] = {};
        const valStr = String(value);
        fieldStats[key][valStr] = (fieldStats[key][valStr] || 0) + 1;
      });
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submission Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{selectedForm.count}</span>
              <span className="text-muted-foreground pb-1">Total Responses</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last submission: {new Date(selectedForm.lastSubmission).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {Object.entries(fieldStats).map(([field, values]) => {
          // Only show stats for fields that have 2-10 unique values (likely choices)
          const uniqueValues = Object.keys(values);
          if (uniqueValues.length < 1 || uniqueValues.length > 10) return null;

          return (
            <Card key={field}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase truncate">{field}</CardTitle>
                <CardDescription>Frequency Distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(values)
                  .sort((a, b) => b[1] - a[1])
                  .map(([val, count]) => {
                    const percentage = Math.round((count / selectedForm.count) * 100);
                    return (
                      <div key={val} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="truncate flex-1 pr-2">{val}</span>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDataPreview = (data: Record<string, any>) => {
    const entries = Object.entries(data).slice(0, 2);
    return entries
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
        return `${key}: ${displayValue.slice(0, 20)}${displayValue.length > 20 ? '...' : ''}`;
      })
      .join(', ');
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'forms') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Forms</h2>
            <p className="text-muted-foreground text-sm">Select a form to view responses and analytics.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSubmissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {groupedForms.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="font-semibold text-lg">No submissions yet</h3>
            <p className="text-sm text-muted-foreground">When users submit your forms, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedForms.map((form) => (
              <Card
                key={form.id}
                className="group cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/50"
                onClick={() => {
                  setSelectedFormId(form.id);
                  setViewMode('detail');
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                      {form.name}
                    </CardTitle>
                    <Badge variant="secondary">{form.count}</Badge>
                  </div>
                  <CardDescription className="font-mono text-[10px] truncate">
                    ID: {form.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last activity: {new Date(form.lastSubmission).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewMode('forms');
              setSelectedFormId(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h2 className="text-xl font-bold tracking-tight truncate">
            {selectedForm?.name}
          </h2>
        </div>

        <Tabs defaultValue="responses" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="responses" className="gap-2">
              <ListFilter className="h-4 w-4" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search response data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
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

            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 opacity-20" />
                          <p>No matching submissions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagination.paginatedData.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-muted/30">
                        <TableCell className="max-w-md truncate text-sm font-medium">
                          {renderDataPreview(submission.data as Record<string, any>)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={submission.status}
                            onValueChange={(v) => updateStatus(submission.id, v)}
                          >
                            <SelectTrigger className="w-32 h-8 border-none bg-transparent hover:bg-muted p-0 pl-1">
                              {getStatusBadge(submission.status)}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-primary"
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
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
          </TabsContent>

          <TabsContent value="analysis" className="pt-4">
            {renderAnalysis()}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-8">
              <span className="truncate">{selectedSubmission?.form_name || 'Form'} Submission</span>
              {selectedSubmission && getStatusBadge(selectedSubmission.status)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 py-4">
              {selectedSubmission && (
                <>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex justify-between">
                    <span>ID: {selectedSubmission.id}</span>
                    <span>{new Date(selectedSubmission.created_at).toLocaleString()}</span>
                  </div>
                  <div className="grid gap-6">
                    {Object.entries(selectedSubmission.data as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="space-y-2 group">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                          {key}
                        </Label>
                        <div className="text-sm font-medium leading-relaxed">
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {value.map((v, i) => (
                                <Badge key={i} variant="secondary" className="px-2 py-0 h-6 text-xs font-normal border-primary/10">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 p-3 rounded-lg bg-muted/40 border border-transparent hover:border-border transition-all whitespace-pre-wrap">
                              {String(value)}
                            </div>
                          )}
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

