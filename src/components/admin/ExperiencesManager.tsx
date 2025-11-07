import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  tech_used?: string[];
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
      role: formData.get('role') as string,
      location: formData.get('location') as string || null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('current') === 'on' ? null : formData.get('end_date') as string,
      current: formData.get('current') === 'on',
      description: formData.get('description') as string || null,
      tech_used: (formData.get('tech_used') as string).split(',').map(t => t.trim()).filter(Boolean),
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experience Management</h2>
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
            <form onSubmit={handleSave} className="space-y-4">
              <Input name="company" placeholder="Company" defaultValue={editingExperience?.company} required />
              <Input name="role" placeholder="Role" defaultValue={editingExperience?.role} required />
              <Input name="location" placeholder="Location" defaultValue={editingExperience?.location} />
              <Input name="start_date" type="date" placeholder="Start Date" defaultValue={editingExperience?.start_date} required />
              <Input name="end_date" type="date" placeholder="End Date" defaultValue={editingExperience?.end_date} />
              <div className="flex items-center space-x-2">
                <Checkbox name="current" id="current" defaultChecked={editingExperience?.current} />
                <label htmlFor="current">Currently working here</label>
              </div>
              <Textarea name="description" placeholder="Description" defaultValue={editingExperience?.description} />
              <Input name="tech_used" placeholder="Technologies (comma separated)" defaultValue={editingExperience?.tech_used?.join(', ')} />
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Technologies</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium">{exp.company}</TableCell>
                <TableCell>{exp.role}</TableCell>
                <TableCell>
                  {new Date(exp.start_date).toLocaleDateString()} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'N/A'}
                  {exp.current && <Badge className="ml-2" variant="secondary">Current</Badge>}
                </TableCell>
                <TableCell>{exp.location || 'N/A'}</TableCell>
                <TableCell>{exp.tech_used?.slice(0, 3).join(', ')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
