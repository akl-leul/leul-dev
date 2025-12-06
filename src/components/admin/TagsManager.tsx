import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Tag, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';

interface TagType {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export const TagsManager = () => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      toast({ title: 'Error loading tags', variant: 'destructive' });
    } else {
      setTags(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = searchQuery === '' ||
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [tags, searchQuery]);

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
  } = usePagination({ data: filteredTags, itemsPerPage: 10 });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    // First delete related post_tags entries
    await supabase.from('post_tags').delete().eq('tag_id', id);
    
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting tag', variant: 'destructive' });
    } else {
      toast({ title: 'Tag deleted successfully' });
      loadTags();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const tagData = { name, slug };

    if (editingTag) {
      const { error } = await supabase
        .from('tags')
        .update(tagData)
        .eq('id', editingTag.id);
      
      if (error) {
        toast({ title: 'Error updating tag', variant: 'destructive' });
      } else {
        toast({ title: 'Tag updated successfully' });
      }
    } else {
      const { error } = await supabase.from('tags').insert([tagData]);
      
      if (error) {
        toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Tag created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    setEditingTag(null);
    loadTags();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Blog Tags</h2>
        <Button onClick={() => {
          setEditingTag(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tags Grid View */}
      <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/50">
        {filteredTags.map((tag) => (
          <Badge 
            key={tag.id} 
            variant="secondary"
            className="px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 flex items-center gap-2"
            onClick={() => {
              setEditingTag(tag);
              setIsDialogOpen(true);
            }}
          >
            <Tag className="h-3 w-3" />
            {tag.name}
          </Badge>
        ))}
        {filteredTags.length === 0 && (
          <p className="text-muted-foreground">{searchQuery ? 'No tags match your search' : 'No tags yet. Create your first tag.'}</p>
        )}
      </div>

      {/* Tags Table View */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {tag.name}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{tag.slug}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(tag.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTag(tag);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No tags match your search' : 'No tags yet'}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingTag?.name || ''} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                name="slug" 
                placeholder="auto-generated-from-name"
                defaultValue={editingTag?.slug || ''} 
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
