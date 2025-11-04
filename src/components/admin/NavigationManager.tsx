import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  location: 'navbar' | 'footer';
  is_external: boolean;
  is_visible: boolean;
  display_order: number;
  section: string | null;
  icon: string | null;
}

export function NavigationManager() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    label: '',
    href: '',
    location: 'navbar' as 'navbar' | 'footer',
    is_external: false,
    is_visible: true,
    section: '',
    icon: '',
  });

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('location')
        .order('display_order');

      if (error) throw error;
      setNavItems(data || []);
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

    try {
      const itemData = {
        ...formData,
        section: formData.section || null,
        icon: formData.icon || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('navigation_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Navigation item updated',
        });
      } else {
        // Get max display order for location
        const maxOrder = Math.max(
          ...navItems
            .filter((item) => item.location === formData.location)
            .map((item) => item.display_order),
          0
        );

        const { error } = await supabase
          .from('navigation_items')
          .insert([{ ...itemData, display_order: maxOrder + 1 }]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Navigation item created',
        });
      }

      fetchNavItems();
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Navigation item deleted',
      });
      fetchNavItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleVisibility = async (item: NavigationItem) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (error) throw error;
      fetchNavItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const moveItem = async (item: NavigationItem, direction: 'up' | 'down') => {
    const itemsInLocation = navItems
      .filter((i) => i.location === item.location)
      .sort((a, b) => a.display_order - b.display_order);

    const currentIndex = itemsInLocation.findIndex((i) => i.id === item.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === itemsInLocation.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapItem = itemsInLocation[swapIndex];

    try {
      // Swap display orders
      await supabase
        .from('navigation_items')
        .update({ display_order: swapItem.display_order })
        .eq('id', item.id);

      await supabase
        .from('navigation_items')
        .update({ display_order: item.display_order })
        .eq('id', swapItem.id);

      fetchNavItems();
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
      label: '',
      href: '',
      location: 'navbar',
      is_external: false,
      is_visible: true,
      section: '',
      icon: '',
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      href: item.href,
      location: item.location,
      is_external: item.is_external,
      is_visible: item.is_visible,
      section: item.section || '',
      icon: item.icon || '',
    });
    setIsDialogOpen(true);
  };

  const renderNavigationList = (location: 'navbar' | 'footer') => {
    const items = navItems
      .filter((item) => item.location === location)
      .sort((a, b) => a.display_order - b.display_order);

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No items in {location}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.label}</span>
                    {!item.is_visible && (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                    {item.is_external && (
                      <Badge variant="outline">External</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.href}</p>
                  {item.section && (
                    <p className="text-xs text-muted-foreground">
                      Section: {item.section}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveItem(item, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveItem(item, 'down')}
                  disabled={index === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleVisibility(item)}
                >
                  {item.is_visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditDialog(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this navigation item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading navigation...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Navigation Manager</h2>
          <p className="text-muted-foreground">
            Customize navbar and footer links
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Navigation Item' : 'Add Navigation Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="href">Link URL</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) =>
                    setFormData({ ...formData, href: e.target.value })
                  }
                  placeholder="/about or https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: 'navbar' | 'footer') =>
                    setFormData({ ...formData, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navbar">Navbar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.location === 'footer' && (
                <div className="space-y-2">
                  <Label htmlFor="section">Footer Section (Optional)</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    placeholder="e.g., Navigation, Content"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_external"
                  checked={formData.is_external}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_external: checked })
                  }
                />
                <Label htmlFor="is_external">External Link</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_visible: checked })
                  }
                />
                <Label htmlFor="is_visible">Visible</Label>
              </div>

              <div className="flex justify-end space-x-2">
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
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="navbar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="navbar">Navbar</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="navbar" className="space-y-4">
          {renderNavigationList('navbar')}
        </TabsContent>
        <TabsContent value="footer" className="space-y-4">
          {renderNavigationList('footer')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
