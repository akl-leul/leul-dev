import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Plus, X, Search, Eye, Star, StarOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageCropUpload } from './ImageCropUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from './RichTextEditor';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';
import { BulkActions, useBulkSelection, createBulkDeleteAction, createBulkStatusAction } from './BulkActions';
interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  status: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  image_url?: string;
  gallery_images?: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, filterStatus]);

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
  } = usePagination({ data: filteredProjects, itemsPerPage: 10 });

  const {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
  } = useBulkSelection(paginatedData);

  const loadProjects = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading projects', variant: 'destructive' });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting project', variant: 'destructive' });
    } else {
      toast({ title: 'Project deleted successfully' });
      loadProjects();
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const { error } = await supabase.from('projects').delete().in('id', ids);
    if (error) {
      toast({ title: 'Error deleting projects', variant: 'destructive' });
    } else {
      toast({ title: `${ids.length} projects deleted successfully` });
      clearSelection();
      loadProjects();
    }
  };

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const { error } = await supabase.from('projects').update({ status }).in('id', ids);
    if (error) {
      toast({ title: 'Error updating projects', variant: 'destructive' });
    } else {
      toast({ title: `${ids.length} projects updated to ${status}` });
      clearSelection();
      loadProjects();
    }
  };

  const handleBulkFeatured = async (ids: string[], featured: boolean) => {
    const { error } = await supabase.from('projects').update({ featured }).in('id', ids);
    if (error) {
      toast({ title: 'Error updating projects', variant: 'destructive' });
    } else {
      toast({ title: `${ids.length} projects ${featured ? 'featured' : 'unfeatured'}` });
      clearSelection();
      loadProjects();
    }
  };

  const bulkActions = [
    createBulkDeleteAction(handleBulkDelete, 'projects'),
    createBulkStatusAction('completed', 'Mark as Completed', <Check className="h-4 w-4" />, handleBulkStatusChange),
    createBulkStatusAction('in-progress', 'Mark as In Progress', <Eye className="h-4 w-4" />, handleBulkStatusChange),
    {
      id: 'feature',
      label: 'Feature selected',
      icon: <Star className="h-4 w-4" />,
      onClick: (ids: string[]) => handleBulkFeatured(ids, true),
    },
    {
      id: 'unfeature',
      label: 'Unfeature selected',
      icon: <StarOff className="h-4 w-4" />,
      onClick: (ids: string[]) => handleBulkFeatured(ids, false),
    },
  ];

  const handleAddGalleryImage = (url: string | null) => {
    if (url && galleryImages.length < 5) {
      setGalleryImages([...galleryImages, url]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content: contentHtml || null,
      status: formData.get('status') as string,
      tech_stack: (formData.get('tech_stack') as string).split(',').map(t => t.trim()).filter(Boolean),
      github_url: formData.get('github_url') as string || null,
      demo_url: formData.get('demo_url') as string || null,
      image_url: imageUrl || null,
      gallery_images: galleryImages,
      featured: formData.get('featured') === 'true',
    };

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject.id);
      
      if (error) {
        toast({ title: 'Error updating project', variant: 'destructive' });
      } else {
        toast({ title: 'Project updated successfully' });
      }
    } else {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: user.user?.id }]);
      
      if (error) {
        toast({ title: 'Error creating project', variant: 'destructive' });
      } else {
        toast({ title: 'Project created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    setEditingProject(null);
    setImageUrl(null);
    setGalleryImages([]);
    setContentHtml('');
    loadProjects();
  };

  const openDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setImageUrl(project.image_url || null);
      setGalleryImages(project.gallery_images || []);
      setContentHtml(project.content || '');
    } else {
      setEditingProject(null);
      setImageUrl(null);
      setGalleryImages([]);
      setContentHtml('');
    }
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Projects Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProject(null);
            setImageUrl(null);
            setGalleryImages([]);
            setContentHtml('');
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="media">Media & Links</TabsTrigger>
                </TabsList>
                
                <div className="max-h-[60vh] overflow-y-auto px-1 mt-4">
                  <TabsContent value="basic" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" name="title" placeholder="Project title" defaultValue={editingProject?.title} required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea id="description" name="description" placeholder="Short description" defaultValue={editingProject?.description} required rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingProject?.status || 'completed'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
                      <Input id="tech_stack" name="tech_stack" placeholder="React, Node.js, PostgreSQL" defaultValue={editingProject?.tech_stack?.join(', ')} />
                    </div>
                    <div>
                      <Label htmlFor="featured">Featured</Label>
                      <Select name="featured" defaultValue={editingProject?.featured ? 'true' : 'false'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Featured" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                    <div>
                      <Label>Project Content</Label>
                      <RichTextEditor
                        content={contentHtml}
                        onChange={setContentHtml}
                        placeholder="Write detailed project description..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                    <div>
                      <Label>Featured Image</Label>
                      <ImageCropUpload
                        bucketName="home-images"
                        label="Featured Image"
                        currentImageUrl={imageUrl || undefined}
                        onImageUpdate={(url) => setImageUrl(url)}
                        aspectRatio={16 / 9}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Gallery Images ({galleryImages.length}/5)</Label>
                      
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {galleryImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={img} 
                                alt={`Gallery ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveGalleryImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {galleryImages.length < 5 && (
                        <ImageCropUpload
                          bucketName="home-images"
                          label="Add Gallery Image"
                          onImageUpdate={handleAddGalleryImage}
                          aspectRatio={16 / 9}
                        />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="github_url">GitHub URL</Label>
                      <Input id="github_url" name="github_url" type="url" placeholder="https://github.com/..." defaultValue={editingProject?.github_url || ''} />
                    </div>
                    <div>
                      <Label htmlFor="demo_url">Demo URL</Label>
                      <Input id="demo_url" name="demo_url" type="url" placeholder="https://..." defaultValue={editingProject?.demo_url || ''} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit">Save Project</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        allSelected={allSelected}
        someSelected={someSelected}
        actions={bulkActions}
        totalCount={paginatedData.length}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={selectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Tech Stack</TableHead>
              <TableHead className="hidden sm:table-cell">Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((project) => (
              <TableRow key={project.id} className={isSelected(project.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={isSelected(project.id)}
                    onCheckedChange={() => toggleSelect(project.id)}
                    aria-label={`Select ${project.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge>{project.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{project.tech_stack?.slice(0, 3).join(', ')}</TableCell>
                <TableCell className="hidden sm:table-cell">{project.featured ? '✓' : '✗'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setPreviewProject(project);
                      setIsPreviewOpen(true);
                    }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDialog(project)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' ? 'No projects match your filters' : 'No projects yet'}
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

      {/* Project Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Preview</DialogTitle>
          </DialogHeader>
          {previewProject && (
            <div className="space-y-6">
              {/* Featured Image */}
              {previewProject.image_url && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={previewProject.image_url} 
                    alt={previewProject.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Title and Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{previewProject.title}</h2>
                  <p className="text-muted-foreground mt-1">{previewProject.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{previewProject.status}</Badge>
                  {previewProject.featured && <Badge variant="secondary">Featured</Badge>}
                </div>
              </div>

              {/* Tech Stack */}
              {previewProject.tech_stack && previewProject.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewProject.tech_stack.map((tech, i) => (
                    <Badge key={i} variant="outline">{tech}</Badge>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3">
                {previewProject.github_url && (
                  <a 
                    href={previewProject.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View on GitHub →
                  </a>
                )}
                {previewProject.demo_url && (
                  <a 
                    href={previewProject.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Live Demo →
                  </a>
                )}
              </div>

              {/* Content */}
              {previewProject.content && (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewProject.content }}
                />
              )}

              {/* Gallery Images */}
              {previewProject.gallery_images && previewProject.gallery_images.length > 0 && (
                <div className="space-y-2">
                  <Label>Gallery</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {previewProject.gallery_images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt={`Gallery ${i + 1}`} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
