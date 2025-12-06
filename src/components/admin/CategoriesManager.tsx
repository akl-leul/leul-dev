import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      toast({ title: 'Error loading categories', variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = searchQuery === '' ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [categories, searchQuery]);

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
  } = usePagination({ data: filteredCategories, itemsPerPage: 10 });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting category', variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted successfully' });
      loadCategories();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const categoryData = {
      name,
      slug,
      description: formData.get('description') as string || null,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      
      if (error) {
        toast({ title: 'Error updating category', variant: 'destructive' });
      } else {
        toast({ title: 'Category updated successfully' });
      }
    } else {
      const { error } = await supabase.from('categories').insert([categoryData]);
      
      if (error) {
        toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Category created successfully' });
      }
    }
    
    setIsDialogOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Blog Categories</h2>
        <Button onClick={() => {
          setEditingCategory(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                  {category.description || 'No description'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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
                  {searchQuery ? 'No categories match your search' : 'No categories yet. Create your first category.'}
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
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingCategory?.name || ''} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                name="slug" 
                placeholder="auto-generated-from-name"
                defaultValue={editingCategory?.slug || ''} 
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                rows={3}
                defaultValue={editingCategory?.description || ''} 
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
