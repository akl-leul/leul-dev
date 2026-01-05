import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Eye, Plus, Tag, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ImageCropUpload } from './ImageCropUpload';
import { RichTextEditor } from './RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from './TablePagination';
import { BulkActions, useBulkSelection, createBulkDeleteAction, createBulkPublishAction, createBulkUnpublishAction } from './BulkActions';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id?: number;
  status: string;
  published: boolean;
  read_time: number;
  views: number;
  likes_count: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface TagType {
  id: number;
  name: string;
  slug: string;
}

export const BlogPostsManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTagName, setNewTagName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus ||
        (filterStatus === 'published' && post.published) ||
        (filterStatus === 'unpublished' && !post.published);
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, filterStatus]);

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
  } = usePagination({ data: filteredPosts, itemsPerPage: 10 });

  const {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
  } = useBulkSelection(paginatedData);

  const loadPosts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error loading posts', variant: 'destructive' });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const loadTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    setTags(data || []);
  };

  const loadPostTags = async (postId: number) => {
    const { data } = await supabase
      .from('post_tags')
      .select('tag_id')
      .eq('post_id', postId);
    return data?.map(pt => pt.tag_id) || [];
  };

  useEffect(() => {
    loadPosts();
    loadCategories();
    loadTags();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting post', variant: 'destructive' });
    } else {
      toast({ title: 'Post deleted successfully' });
      loadPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('posts')
      .update({ 
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null
      })
      .eq('id', post.id);
    
    if (error) {
      toast({ title: 'Error updating post', variant: 'destructive' });
    } else {
      toast({ title: `Post ${!post.published ? 'published' : 'unpublished'} successfully` });
      loadPosts();
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const numericIds = ids.map(id => parseInt(id));
    const { error } = await supabase.from('posts').delete().in('id', numericIds);
    if (error) {
      toast({ title: 'Error deleting posts', variant: 'destructive' });
    } else {
      toast({ title: `${ids.length} posts deleted successfully` });
      clearSelection();
      loadPosts();
    }
  };

  const handleBulkPublish = async (ids: string[], published: boolean) => {
    const numericIds = ids.map(id => parseInt(id));
    const { error } = await supabase.from('posts').update({ 
      published,
      published_at: published ? new Date().toISOString() : null
    }).in('id', numericIds);
    if (error) {
      toast({ title: 'Error updating posts', variant: 'destructive' });
    } else {
      toast({ title: `${ids.length} posts ${published ? 'published' : 'unpublished'}` });
      clearSelection();
      loadPosts();
    }
  };

  const bulkActions = [
    createBulkDeleteAction(handleBulkDelete, 'posts'),
    createBulkPublishAction(handleBulkPublish),
    createBulkUnpublishAction(handleBulkPublish),
  ];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const postData = {
      title,
      slug,
      excerpt: formData.get('excerpt') as string,
      content: contentHtml,
      featured_image: featuredImage || null,
      category_id: selectedCategoryId && selectedCategoryId !== 'none' ? parseInt(selectedCategoryId) : null,
      read_time: parseInt(formData.get('read_time') as string) || 5,
      status: formData.get('status') as string,
      published: formData.get('published') === 'true',
    };

    let postId: number;

    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', editingPost.id);
      
      if (error) {
        toast({ title: 'Error updating post', variant: 'destructive' });
        return;
      }
      postId = editingPost.id;
      toast({ title: 'Post updated successfully' });
    } else {
      // Create new post
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          ...postData, 
          user_id: user.user?.id,
          published_at: postData.published ? new Date().toISOString() : null
        }])
        .select('id')
        .single();
      
      if (error) {
        toast({ title: 'Error creating post', description: error.message, variant: 'destructive' });
        return;
      }
      postId = data.id;
      toast({ title: 'Post created successfully' });
    }

    // Update post tags
    await supabase.from('post_tags').delete().eq('post_id', postId);
    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map(tagId => ({ post_id: postId, tag_id: tagId }));
      await supabase.from('post_tags').insert(tagInserts);
    }
    
    setIsDialogOpen(false);
    setEditingPost(null);
    setFeaturedImage(null);
    setContentHtml('');
    setSelectedTags([]);
    setSelectedCategoryId('none');
    loadPosts();
  };

  const openEditDialog = async (post: BlogPost) => {
    setEditingPost(post);
    setFeaturedImage(post.featured_image || null);
    setContentHtml(post.content || '');
    setSelectedCategoryId(post.category_id?.toString() || 'none');
    const postTags = await loadPostTags(post.id);
    setSelectedTags(postTags);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPost(null);
    setFeaturedImage(null);
    setContentHtml('');
    setSelectedTags([]);
    setSelectedCategoryId('none');
    setIsDialogOpen(true);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    
    const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: newTagName.trim(), slug }])
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
    } else if (data) {
      setTags(prev => [...prev, data]);
      setSelectedTags(prev => [...prev, data.id]);
      setNewTagName('');
      toast({ title: 'Tag created and selected' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Blog Posts Management</h2>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Post
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
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
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((post) => (
              <TableRow key={post.id} className={isSelected(post.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={isSelected(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                    aria-label={`Select ${post.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[150px] truncate">{post.title}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">
                    {categories.find(c => c.id === post.category_id)?.name || 'None'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={post.published ? 'default' : 'secondary'}>
                    {post.published ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{post.views}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(post)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="meta">Metadata</TabsTrigger>
              </TabsList>
              
              <div className="max-h-[60vh] overflow-y-auto px-1 mt-4">
                <TabsContent value="basic" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" defaultValue={editingPost?.title || ''} required />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input id="slug" name="slug" placeholder="url-friendly-title" defaultValue={editingPost?.slug || ''} required />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea id="excerpt" name="excerpt" defaultValue={editingPost?.excerpt || ''} required rows={3} />
                  </div>
                  <div>
                    <ImageCropUpload
                      bucketName="blog-media"
                      label="Featured Image"
                      currentImageUrl={featuredImage || undefined}
                      onImageUpdate={(url) => setFeaturedImage(url)}
                      aspectRatio={16 / 9}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                  <div>
                    <Label>Blog Post Content</Label>
                    <RichTextEditor
                      content={contentHtml}
                      onChange={setContentHtml}
                      placeholder="Write your blog post content..."
                    />
                  </div>
                </TabsContent>

                  <TabsContent value="meta" className="space-y-4 mt-0 data-[state=inactive]:hidden" forceMount>
                    <div>
                      <Label>Category</Label>
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add new tag..."
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                            className="flex-1"
                          />
                          <Button type="button" variant="secondary" onClick={handleAddNewTag} disabled={!newTagName.trim()}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                          {tags.map(tag => (
                            <label 
                              key={tag.id} 
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                                selectedTags.includes(tag.id) 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <Checkbox
                                checked={selectedTags.includes(tag.id)}
                                onCheckedChange={() => toggleTag(tag.id)}
                                className="sr-only"
                              />
                              {tag.name}
                            </label>
                          ))}
                          {tags.length === 0 && (
                            <span className="text-muted-foreground text-sm">No tags yet. Create one above!</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="read_time">Read Time (minutes) *</Label>
                      <Input id="read_time" name="read_time" type="number" min="1" defaultValue={editingPost?.read_time || 5} required />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingPost?.status || 'draft'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="published">Published</Label>
                      <Select name="published" defaultValue={editingPost?.published ? 'true' : 'false'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editingPost && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Views</Label>
                            <Input value={editingPost.views} disabled />
                          </div>
                          <div>
                            <Label>Likes Count</Label>
                            <Input value={editingPost.likes_count} disabled />
                          </div>
                        </div>
                        <div>
                          <Label>Published At</Label>
                          <Input value={editingPost.published_at ? new Date(editingPost.published_at).toLocaleString() : 'Not published'} disabled />
                        </div>
                      </>
                    )}
                  </TabsContent>
              </div>
            </Tabs>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit">{editingPost ? 'Save Changes' : 'Create Post'}</Button>
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
