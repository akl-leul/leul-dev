import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  id: string;
  company: string;
  company_url?: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  tech_used?: string[];
  achievements?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const ExperiencesManager = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadExperiences = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading experiences', variant: 'destructive' });
    } else {
      setExperiences(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting experience', variant: 'destructive' });
    } else {
      toast({ title: 'Experience deleted successfully' });
      loadExperiences();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const experienceData = {
      company: formData.get('company') as string,
      company_url: formData.get('company_url') as string || null,
      role: formData.get('role') as string,
      location: formData.get('location') as string || null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('current') === 'on' ? null : formData.get('end_date') as string,
      current: formData.get('current') === 'on',
      description: formData.get('description') as string || null,
      tech_used: (formData.get('tech_used') as string).split(',').map(t => t.trim()).filter(Boolean),
      achievements: (formData.get('achievements') as string).split('\n').map(a => a.trim()).filter(Boolean),
    };

    if (editingExperience) {
      const { error } = await supabase
        .from('experiences')
        .update(experienceData)
        .eq('id', editingExperience.id);
      
      if (error) {
        toast({ title: 'Error updating experience', variant: 'destructive' });
      } else {
        toast({ title: 'Experience updated successfully' });
      }
    } else {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('experiences')
        .insert([{ ...experienceData, user_id: user.user?.id }]);
      
      if (error) {
        toast({ title: 'Error creating experience', variant: 'destructive' });
      } else {
        toast({ title: 'Experience created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    setEditingExperience(null);
    loadExperiences();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Experience Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingExperience(null)}>
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Company name" defaultValue={editingExperience?.company} required />
              </div>
              <div>
                <Label htmlFor="company_url">Company URL</Label>
                <Input id="company_url" name="company_url" type="url" placeholder="https://company.com" defaultValue={editingExperience?.company_url || ''} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="Job title" defaultValue={editingExperience?.role} required />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="City, Country" defaultValue={editingExperience?.location || ''} />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" defaultValue={editingExperience?.start_date} required />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" defaultValue={editingExperience?.end_date || ''} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox name="current" id="current" defaultChecked={editingExperience?.current} />
                <Label htmlFor="current">Currently working here</Label>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Job description" defaultValue={editingExperience?.description || ''} rows={3} />
              </div>
              <div>
                <Label htmlFor="tech_used">Technologies Used (comma separated)</Label>
                <Input id="tech_used" name="tech_used" placeholder="React, Node.js, AWS" defaultValue={editingExperience?.tech_used?.join(', ')} />
              </div>
              <div>
                <Label htmlFor="achievements">Achievements (one per line)</Label>
                <Textarea id="achievements" name="achievements" placeholder="Led team of 5 developers&#10;Improved performance by 40%" defaultValue={editingExperience?.achievements?.join('\n') || ''} rows={4} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Period</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Technologies</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium">
                  <div>{exp.company}</div>
                  <div className="sm:hidden text-xs text-muted-foreground">{exp.role}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{exp.role}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(exp.start_date).toLocaleDateString()} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'N/A'}
                  {exp.current && <Badge className="ml-2" variant="secondary">Current</Badge>}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{exp.location || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">{exp.tech_used?.slice(0, 3).join(', ')}</TableCell>
                <TableCell>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingExperience(exp);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(exp.id)}
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
