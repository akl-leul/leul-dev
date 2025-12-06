import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, X } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "./TablePagination";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
  icon: string | null;
  years_experience: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: "",
    category: "frontend",
    level: "intermediate",
    icon: "",
    years_experience: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading skills",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingSkill) {
        const { error } = await supabase
          .from("skills")
          .update({
            name: formData.name,
            category: formData.category,
            level: formData.level,
            icon: formData.icon || null,
            years_experience: formData.years_experience || null,
          })
          .eq("id", editingSkill.id);

        if (error) throw error;
        toast({ title: "Skill updated successfully" });
      } else {
        const { error } = await supabase
          .from("skills")
          .insert({
            name: formData.name,
            category: formData.category,
            level: formData.level,
            icon: formData.icon || null,
            years_experience: formData.years_experience || null,
            user_id: user.id,
          });

        if (error) throw error;
        toast({ title: "Skill created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      loadSkills();
    } catch (error: any) {
      toast({
        title: editingSkill ? "Error updating skill" : "Error creating skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon || "",
      years_experience: skill.years_experience || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Skill deleted successfully" });
      loadSkills();
    } catch (error: any) {
      toast({
        title: "Error deleting skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "frontend",
      level: "intermediate",
      icon: "",
      years_experience: 0,
    });
    setEditingSkill(null);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, filterCategory]);

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
  } = usePagination({ data: filteredSkills, itemsPerPage: 10 });

  if (loading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Skills Management</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Proficiency Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., react, nodejs, python"
                />
              </div>
              <div>
                <Label htmlFor="years">Years of Experience</Label>
                <Input
                  id="years"
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSkill ? "Update" : "Create"}
                </Button>
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
            placeholder="Search skills..."
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
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="hidden md:table-cell">Years</TableHead>
              <TableHead className="hidden md:table-cell">Icon</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{skill.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{skill.level}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{skill.years_experience || "N/A"}</TableCell>
                <TableCell className="hidden md:table-cell">{skill.icon || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 sm:gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(skill)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(skill.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filterCategory !== 'all' ? 'No skills match your filters' : 'No skills found. Add your first skill to get started.'}
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
    </div>
  );
}
