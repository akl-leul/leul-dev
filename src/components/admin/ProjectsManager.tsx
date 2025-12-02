import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageCropUpload } from './ImageCropUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from './RichTextEditor';

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState<string>('');
  const { toast } = useToast();

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
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
    loadProjects();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProject(null);
            setImageUrl(null);
            setContentHtml('');
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProject(null);
              setImageUrl(null);
              setContentHtml('');
            }}>
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
                  <TabsTrigger value="links">Links & Media</TabsTrigger>
                </TabsList>
                
                <div className="max-h-[60vh] overflow-y-auto px-1 mt-4">
                  <TabsContent value="basic" className="space-y-4">
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

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label>Project Content</Label>
                      <RichTextEditor
                        content={contentHtml || editingProject?.content || ''}
                        onChange={setContentHtml}
                        placeholder="Write detailed project description..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4">
                    <div>
                      <ImageCropUpload
                        bucketName="home-images"
                        label="Project Image"
                        currentImageUrl={imageUrl || editingProject?.image_url || undefined}
                        onImageUpdate={(url) => setImageUrl(url)}
                        aspectRatio={16 / 9}
                      />
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tech Stack</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>
                  <Badge>{project.status}</Badge>
                </TableCell>
                <TableCell>{project.tech_stack?.slice(0, 3).join(', ')}</TableCell>
                <TableCell>{project.featured ? '✓' : '✗'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProject(project);
                        setImageUrl(project.image_url);
                        setContentHtml(project.content || '');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
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
