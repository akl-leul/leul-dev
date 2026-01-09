import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BlogPostEditor } from './BlogPostEditor';
import { PageBuilder } from './page-builder';
import { PageSection } from './page-builder/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Lock, Blocks, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Json } from '@/integrations/supabase/types';

interface DynamicPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  password: string | null;
  is_published: boolean;
  meta_description: string | null;
  use_builder: boolean | null;
  builder_content: Json | null;
  created_at: string;
  updated_at: string;
}

export function DynamicPageEditor() {
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'code' | 'builder'>('builder');
  const [builderSections, setBuilderSections] = useState<PageSection[]>([]);
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
        .order('created_at', { ascending: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        created_by: user.id,
        use_builder: editorMode === 'builder',
        builder_content: editorMode === 'builder' ? builderSections as unknown as Json : null,
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
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBuilderSave = async (sections: PageSection[]) => {
    setBuilderSections(sections);
    
    if (!user) return;

    if (editingPage) {
      try {
        const { error } = await supabase
          .from('dynamic_pages')
          .update({
            builder_content: sections as unknown as Json,
            use_builder: true,
            title: formData.title,
            slug: formData.slug,
            meta_description: formData.meta_description || null,
            password: formData.password || null,
            is_published: formData.is_published,
          })
          .eq('id', editingPage.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Page saved successfully',
        });
        
        fetchPages();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const addToNavigation = async (slug: string, title: string) => {
    try {
      // Get max display order for navbar
      const { data: navbarItems } = await supabase
        .from('navigation_items')
        .select('display_order')
        .eq('location', 'navbar')
        .order('display_order', { ascending: false })
        .limit(1);

      const maxNavbarOrder = navbarItems?.[0]?.display_order || 0;

      // Get max display order for footer
      const { data: footerItems } = await supabase
        .from('navigation_items')
        .select('display_order')
        .eq('location', 'footer')
        .order('display_order', { ascending: false })
        .limit(1);

      const maxFooterOrder = footerItems?.[0]?.display_order || 0;

      // Add to navbar and footer
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

      // Remove from navigation
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
    setBuilderSections([]);
    setEditorMode('builder');
  };

  const openEditDialog = (page: DynamicPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      password: page.password || '',
      is_published: page.is_published,
      meta_description: page.meta_description || '',
    });
    setEditorMode(page.use_builder ? 'builder' : 'code');
    setBuilderSections(
      Array.isArray(page.builder_content) 
        ? (page.builder_content as unknown as PageSection[]) 
        : []
    );
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading pages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Pages</h2>
          <p className="text-muted-foreground">
            Create custom pages with visual builder or code editor
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        })
                      }
                      placeholder="my-custom-page"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Page will be at: /page/{formData.slug || 'my-custom-page'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                    <Input
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_description: e.target.value })
                      }
                      placeholder="Brief description for search engines"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password Protection (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Leave empty for public access"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as 'code' | 'builder')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="builder" className="flex items-center gap-2">
                      <Blocks className="h-4 w-4" />
                      Visual Builder
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Code Editor
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="builder" className="mt-4">
                    <div className="border rounded-lg overflow-hidden" style={{ height: 'calc(95vh - 400px)' }}>
                      <PageBuilder
                        pageId={editingPage?.id}
                        initialContent={builderSections}
                        onSave={handleBuilderSave}
                        onBack={() => setIsDialogOpen(false)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="mt-4">
                    <div className="space-y-2">
                      <Label>Page Content (HTML)</Label>
                      <BlogPostEditor
                        content={formData.content}
                        onChange={(content) =>
                          setFormData({ ...formData, content })
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {editorMode === 'code' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingPage ? 'Update Page' : 'Create Page'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{page.title}</span>
                <div className="flex items-center space-x-1">
                  {page.use_builder && (
                    <Badge variant="outline" className="text-xs">
                      <Blocks className="h-3 w-3 mr-1" />
                      Builder
                    </Badge>
                  )}
                  {page.password && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {!page.is_published && (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>/page/{page.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(page)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`/page/${page.slug}`, '_blank')
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this page and remove it
                          from navigation. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(page.id, page.slug)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No dynamic pages yet. Create your first page!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
