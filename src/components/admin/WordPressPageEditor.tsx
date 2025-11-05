import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Copy,
  Search,
  FileText,
  Save,
  Eye as Preview,
} from 'lucide-react';
import { WordPressBlockEditor } from './WordPressBlockEditor';

interface DynamicPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  password: string | null;
  is_published: boolean;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface WordPressPageEditorProps {
  onNewPage?: () => void;
}

export function WordPressPageEditor({ onNewPage }: WordPressPageEditorProps) {
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    password: '',
    is_published: true,
    meta_description: '',
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pageData = {
        ...formData,
        password: formData.password || null,
        is_published: publish || formData.is_published,
        created_by: user.id,
      };

      if (editingPage) {
        const { error } = await supabase
          .from('dynamic_pages')
          .update(pageData)
          .eq('id', editingPage.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('dynamic_pages')
          .insert([pageData]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Page created successfully',
        });

        // Add to navigation
        await addToNavigation(formData.slug, formData.title);
      }

      fetchPages();
      setViewMode('list');
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addToNavigation = async (slug: string, title: string) => {
    try {
      const { data: navbarItems } = await supabase
        .from('navigation_items')
        .select('display_order')
        .eq('location', 'navbar')
        .order('display_order', { ascending: false })
        .limit(1);

      const maxNavbarOrder = navbarItems?.[0]?.display_order || 0;

      const { data: footerItems } = await supabase
        .from('navigation_items')
        .select('display_order')
        .eq('location', 'footer')
        .order('display_order', { ascending: false })
        .limit(1);

      const maxFooterOrder = footerItems?.[0]?.display_order || 0;

      await supabase.from('navigation_items').insert([
        {
          label: title,
          href: `/page/${slug}`,
          location: 'navbar',
          display_order: maxNavbarOrder + 1,
        },
        {
          label: title,
          href: `/page/${slug}`,
          location: 'footer',
          section: 'Content',
          display_order: maxFooterOrder + 1,
        },
      ]);
    } catch (error: any) {
      console.error('Error adding to navigation:', error);
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    try {
      const { error } = await supabase
        .from('dynamic_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase
        .from('navigation_items')
        .delete()
        .eq('href', `/page/${slug}`);

      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
      fetchPages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (page: DynamicPage) => {
    try {
      const newSlug = `${page.slug}-copy-${Date.now()}`;
      const { error } = await supabase
        .from('dynamic_pages')
        .insert([{
          ...page,
          id: undefined,
          slug: newSlug,
          title: `${page.title} (Copy)`,
          is_published: false,
          created_by: user?.id,
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Page duplicated successfully',
      });
      fetchPages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      password: '',
      is_published: true,
      meta_description: '',
    });
    setEditingPage(null);
  };

  const openEditView = (page?: DynamicPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title: page.title,
        content: page.content,
        password: page.password || '',
        is_published: page.is_published,
        meta_description: page.meta_description || '',
      });
    } else {
      resetForm();
    }
    setViewMode('edit');
    onNewPage?.();
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && page.is_published) ||
      (statusFilter === 'draft' && !page.is_published);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pages...</div>
      </div>
    );
  }

  if (viewMode === 'edit') {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* WordPress-style top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
            >
              ← Back to Pages
            </Button>
            <div className="flex-1 max-w-2xl">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Add title"
                className="text-2xl font-semibold border-0 px-2 focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/page/${formData.slug}`, '_blank')}
              disabled={!editingPage}
            >
              <Preview className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              className="bg-[hsl(var(--wp-blue))] hover:bg-[hsl(var(--wp-blue-hover))]"
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main editor area */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto py-8 px-4">
              <WordPressBlockEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="w-80 border-l bg-card overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Page Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                          })
                        }
                        placeholder="page-url"
                      />
                      <p className="text-xs text-muted-foreground">
                        /page/{formData.slug || 'page-url'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta" className="text-sm">Meta Description</Label>
                      <Input
                        id="meta"
                        value={formData.meta_description}
                        onChange={(e) =>
                          setFormData({ ...formData, meta_description: e.target.value })
                        }
                        placeholder="SEO description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Password Protection</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Optional password"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_published: checked })
                        }
                      />
                      <Label htmlFor="published" className="text-sm">Published</Label>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Create and manage your pages</p>
        </div>
        <Button
          onClick={() => openEditView()}
          className="bg-[hsl(var(--wp-blue))] hover:bg-[hsl(var(--wp-blue-hover))]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Page
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pages table */}
      {filteredPages.length > 0 ? (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <button
                        onClick={() => openEditView(page)}
                        className="hover:text-[hsl(var(--wp-blue))] text-left"
                      >
                        {page.title}
                      </button>
                      {page.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    /page/{page.slug}
                  </TableCell>
                  <TableCell>
                    {page.is_published ? (
                      <Badge className="bg-[hsl(var(--wp-success))]">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditView(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(page)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(page.id, page.slug)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-lg bg-card p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pages found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first page'}
          </p>
          <Button
            onClick={() => openEditView()}
            className="bg-[hsl(var(--wp-blue))] hover:bg-[hsl(var(--wp-blue-hover))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
        </div>
      )}
    </div>
  );
}
