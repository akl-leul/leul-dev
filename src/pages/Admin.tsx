import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { 
  Trash2, 
  Edit, 
  Search, 
  Upload, 
  Eye,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  MailOpen,
  CheckCircle,
  ExternalLink,
  Heart,
  Plus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('analytics');

  // Projects state
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsSearch, setProjectsSearch] = useState('');
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    content: '',
    tech_stack: '',
    github_url: '',
    demo_url: '',
    featured: false,
    status: 'completed'
  });
  const [editingProject, setEditingProject] = useState<any>(null);

  // Posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [postsSearch, setPostsSearch] = useState('');
  const [postFormData, setPostFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
    read_time: 5
  });
  const [editingPost, setEditingPost] = useState<any>(null);

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [skillFormData, setSkillFormData] = useState({
    name: '',
    level: 'intermediate',
    years_experience: 1,
    icon: '',
    category: 'technical'
  });
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [skillsSearch, setSkillsSearch] = useState('');
  
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const skillCategories = ['technical', 'soft', 'tools', 'languages', 'frameworks', 'backend', 'frontend', 'database', 'devops', 'Backend/ORM/Database'];

  // Experiences state
  const [experiences, setExperiences] = useState<any[]>([]);
  const [experiencesSearch, setExperiencesSearch] = useState('');
  const [experienceFormData, setExperienceFormData] = useState({
    role: '',
    company: '',
    company_url: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
    current: false,
    achievements: '',
    tech_used: ''
  });
  const [editingExperience, setEditingExperience] = useState<any>(null);

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesSearch, setMessagesSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalPosts: 0,
    totalSkills: 0,
    totalMessages: 0,
    recentActivity: []
  });

  // Settings state
  const [settings, setSettings] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Date filter state
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: sortOrder === 'oldest' });
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: sortOrder === 'oldest' });
    
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  };

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching skills:', error);
    } else {
      setSkills(data || []);
    }
  };

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', user?.id)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching experiences:', error);
    } else {
      setExperiences(data || []);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [projectsResponse, postsResponse, skillsResponse, messagesResponse] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }),
        supabase.from('skills').select('*', { count: 'exact' }),
        supabase.from('contact_submissions').select('*', { count: 'exact' })
      ]);

      setAnalytics({
        totalProjects: projectsResponse.count || 0,
        totalPosts: postsResponse.count || 0,
        totalSkills: skillsResponse.count || 0,
        totalMessages: messagesResponse.count || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchPosts();
      fetchSkills();
      fetchExperiences();
      fetchMessages();
      fetchAnalytics();
    }
  }, [user, sortOrder]);

  // Project CRUD operations
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...projectFormData,
        tech_stack: projectFormData.tech_stack.split(',').map(t => t.trim()),
        user_id: user?.id
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        
        if (error) throw error;
        toast({ title: "Project updated successfully" });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        
        if (error) throw error;
        toast({ title: "Project created successfully" });
      }

      setProjectFormData({
        title: '',
        description: '',
        content: '',
        tech_stack: '',
        github_url: '',
        demo_url: '',
        featured: false,
        status: 'completed'
      });
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Project deleted successfully" });
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Post CRUD operations
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const postData = {
        ...postFormData,
        user_id: user?.id,
        slug: postFormData.slug || postFormData.title.toLowerCase().replace(/\s+/g, '-')
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
        toast({ title: "Post updated successfully" });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        
        if (error) throw error;
        toast({ title: "Post created successfully" });
      }

      setPostFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        published: false,
        read_time: 5
      });
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Post deleted successfully" });
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  // Skill CRUD operations
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skillData = {
        ...skillFormData,
        user_id: user?.id
      };

      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);
        
        if (error) throw error;
        toast({ title: "Skill updated successfully" });
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);
        
        if (error) throw error;
        toast({ title: "Skill created successfully" });
      }

      setSkillFormData({
        name: '',
        level: 'intermediate',
        years_experience: 1,
        icon: '',
        category: 'technical'
      });
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Skill deleted successfully" });
      fetchSkills();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    }
  };

  // Experience CRUD operations
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const experienceData = {
        ...experienceFormData,
        achievements: experienceFormData.achievements ? experienceFormData.achievements.split('\n') : [],
        tech_used: experienceFormData.tech_used ? experienceFormData.tech_used.split(',').map(t => t.trim()) : [],
        user_id: user?.id
      };

      if (editingExperience) {
        const { error } = await supabase
          .from('experiences')
          .update(experienceData)
          .eq('id', editingExperience.id);
        
        if (error) throw error;
        toast({ title: "Experience updated successfully" });
      } else {
        const { error } = await supabase
          .from('experiences')
          .insert([experienceData]);
        
        if (error) throw error;
        toast({ title: "Experience created successfully" });
      }

      setExperienceFormData({
        role: '',
        company: '',
        company_url: '',
        location: '',
        description: '',
        start_date: '',
        end_date: '',
        current: false,
        achievements: '',
        tech_used: ''
      });
      setEditingExperience(null);
      fetchExperiences();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save experience",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Experience deleted successfully" });
      fetchExperiences();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    }
  };

  // Message operations
  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Message marked as read",
        description: "The message has been marked as read.",
      });
      
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const replyToMessage = (email: string, subject: string) => {
    window.location.href = `mailto:${email}?subject=Re: ${subject}`;
  };

  // Filter functions
  const filterItemsByDate = (items: any[]) => {
    if (dateFilter === 'all') return items;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return items.filter(item => {
      const itemDate = new Date(item.created_at);
      switch (dateFilter) {
        case 'today':
          return itemDate >= today;
        case 'week':
          return itemDate >= thisWeek;
        case 'month':
          return itemDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  const filteredProjects = filterItemsByDate(projects).filter(project =>
    !projectsSearch || 
    project.title.toLowerCase().includes(projectsSearch.toLowerCase()) ||
    project.description.toLowerCase().includes(projectsSearch.toLowerCase())
  );

  const filteredPosts = filterItemsByDate(posts).filter(post =>
    !postsSearch || 
    post.title.toLowerCase().includes(postsSearch.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(postsSearch.toLowerCase())
  );

  const filteredSkills = skills.filter(skill =>
    !skillsSearch || 
    skill.name.toLowerCase().includes(skillsSearch.toLowerCase()) ||
    skill.category.toLowerCase().includes(skillsSearch.toLowerCase())
  );

  const filteredExperiences = experiences.filter(experience =>
    !experiencesSearch || 
    experience.role.toLowerCase().includes(experiencesSearch.toLowerCase()) ||
    experience.company.toLowerCase().includes(experiencesSearch.toLowerCase())
  );

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !messagesSearch || 
      message.name.toLowerCase().includes(messagesSearch.toLowerCase()) ||
      message.email.toLowerCase().includes(messagesSearch.toLowerCase()) ||
      message.subject.toLowerCase().includes(messagesSearch.toLowerCase());
    
    const matchesFilter = messageFilter === 'all' || 
      (messageFilter === 'unread' && message.status === 'new') ||
      (messageFilter === 'read' && message.status === 'read');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="pl-16 transition-all duration-300">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your portfolio content and settings</p>
            </div>

            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Analytics Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-muted-foreground">Total Projects</p>
                          <p className="text-2xl font-bold">{analytics.totalProjects}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                          <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-muted-foreground">Blog Posts</p>
                          <p className="text-2xl font-bold">{analytics.totalPosts}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-muted-foreground">Skills</p>
                          <p className="text-2xl font-bold">{analytics.totalSkills}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/10 rounded-full">
                          <MessageSquare className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-muted-foreground">Messages</p>
                          <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Projects</h2>
                  <Button onClick={() => setEditingProject({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={projectsSearch}
                    onChange={e => setProjectsSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredProjects.map(project => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <p className="text-muted-foreground line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.tech_stack?.map((tech: string) => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingProject(project)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this project? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Project Form Dialog */}
                <Dialog open={!!editingProject} onOpenChange={open => !open && setEditingProject(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProject?.id ? 'Edit Project' : 'Add Project'}</DialogTitle>
                      <DialogDescription>Manage your project details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      <Input
                        placeholder="Title"
                        value={projectFormData.title}
                        onChange={e => setProjectFormData({...projectFormData, title: e.target.value})}
                        required
                      />
                      <Textarea
                        placeholder="Description"
                        value={projectFormData.description}
                        onChange={e => setProjectFormData({...projectFormData, description: e.target.value})}
                        required
                      />
                      <Textarea
                        placeholder="Content"
                        value={projectFormData.content}
                        onChange={e => setProjectFormData({...projectFormData, content: e.target.value})}
                      />
                      <Input
                        placeholder="Tech stack (comma separated)"
                        value={projectFormData.tech_stack}
                        onChange={e => setProjectFormData({...projectFormData, tech_stack: e.target.value})}
                      />
                      <Input
                        placeholder="GitHub URL"
                        value={projectFormData.github_url}
                        onChange={e => setProjectFormData({...projectFormData, github_url: e.target.value})}
                      />
                      <Input
                        placeholder="Demo URL"
                        value={projectFormData.demo_url}
                        onChange={e => setProjectFormData({...projectFormData, demo_url: e.target.value})}
                      />
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="featured">Featured</Label>
                        <input
                          id="featured"
                          type="checkbox"
                          checked={projectFormData.featured}
                          onChange={e => setProjectFormData({...projectFormData, featured: e.target.checked})}
                        />
                      </div>
                      <Select
                        value={projectFormData.status}
                        onValueChange={value => setProjectFormData({...projectFormData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end space-x-2">
                        <Button type="submit">{editingProject?.id ? 'Update' : 'Create'}</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSection === 'posts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Blog Posts</h2>
                  <Button onClick={() => setEditingPost({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Post
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={postsSearch}
                    onChange={e => setPostsSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredPosts.map(post => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">{post.title}</h3>
                            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                              <Badge variant={post.published ? 'secondary' : 'destructive'}>
                                {post.published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingPost(post)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this post? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Post Form Dialog */}
                <Dialog open={!!editingPost} onOpenChange={open => !open && setEditingPost(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingPost?.id ? 'Edit Post' : 'Add Post'}</DialogTitle>
                      <DialogDescription>Manage your blog post details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                      <Input
                        placeholder="Title"
                        value={postFormData.title}
                        onChange={e => setPostFormData({...postFormData, title: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Slug"
                        value={postFormData.slug}
                        onChange={e => setPostFormData({...postFormData, slug: e.target.value})}
                      />
                      <Textarea
                        placeholder="Excerpt"
                        value={postFormData.excerpt}
                        onChange={e => setPostFormData({...postFormData, excerpt: e.target.value})}
                      />
                      <Textarea
                        placeholder="Content (Markdown)"
                        value={postFormData.content}
                        onChange={e => setPostFormData({...postFormData, content: e.target.value})}
                        required
                        rows={10}
                      />
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="published">Published</Label>
                        <input
                          id="published"
                          type="checkbox"
                          checked={postFormData.published}
                          onChange={e => setPostFormData({...postFormData, published: e.target.checked})}
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Read time (minutes)"
                        value={postFormData.read_time}
                        onChange={e => setPostFormData({...postFormData, read_time: Number(e.target.value)})}
                        min={1}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="submit">{editingPost?.id ? 'Update' : 'Create'}</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSection === 'skills' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Skills</h2>
                  <Button onClick={() => setEditingSkill({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search skills..."
                    value={skillsSearch}
                    onChange={e => setSkillsSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredSkills.map(skill => (
                    <Card key={skill.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">{skill.name}</h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{skill.level}</Badge>
                              <Badge variant="outline">{skill.category}</Badge>
                              <span>{skill.years_experience} years</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingSkill(skill)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this skill? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Skill Form Dialog */}
                <Dialog open={!!editingSkill} onOpenChange={open => !open && setEditingSkill(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingSkill?.id ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
                      <DialogDescription>Manage your skill details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSkillSubmit} className="space-y-4">
                      <Input
                        placeholder="Name"
                        value={skillFormData.name}
                        onChange={e => setSkillFormData({...skillFormData, name: e.target.value})}
                        required
                      />
                      <Select
                        value={skillFormData.level}
                        onValueChange={value => setSkillFormData({...skillFormData, level: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Years of experience"
                        value={skillFormData.years_experience}
                        onChange={e => setSkillFormData({...skillFormData, years_experience: Number(e.target.value)})}
                        min={0}
                      />
                      <Input
                        placeholder="Icon (optional)"
                        value={skillFormData.icon}
                        onChange={e => setSkillFormData({...skillFormData, icon: e.target.value})}
                      />
                      <Select
                        value={skillFormData.category}
                        onValueChange={value => setSkillFormData({...skillFormData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end space-x-2">
                        <Button type="submit">{editingSkill?.id ? 'Update' : 'Create'}</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingSkill(null)}>Cancel</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSection === 'experiences' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Experience</h2>
                  <Button onClick={() => setEditingExperience({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search experiences..."
                    value={experiencesSearch}
                    onChange={e => setExperiencesSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredExperiences.map(experience => (
                    <Card key={experience.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">{experience.role}</h3>
                            <p className="text-muted-foreground">{experience.company}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(experience.start_date), 'MMM yyyy')} -{' '}
                                {experience.current || !experience.end_date ? 'Present' : format(new Date(experience.end_date), 'MMM yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingExperience(experience)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this experience? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteExperience(experience.id)}>Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Experience Form Dialog */}
                <Dialog open={!!editingExperience} onOpenChange={open => !open && setEditingExperience(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingExperience?.id ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
                      <DialogDescription>Manage your experience details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleExperienceSubmit} className="space-y-4">
                      <Input
                        placeholder="Role"
                        value={experienceFormData.role}
                        onChange={e => setExperienceFormData({...experienceFormData, role: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Company"
                        value={experienceFormData.company}
                        onChange={e => setExperienceFormData({...experienceFormData, company: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Company URL"
                        value={experienceFormData.company_url}
                        onChange={e => setExperienceFormData({...experienceFormData, company_url: e.target.value})}
                      />
                      <Input
                        placeholder="Location"
                        value={experienceFormData.location}
                        onChange={e => setExperienceFormData({...experienceFormData, location: e.target.value})}
                      />
                      <Textarea
                        placeholder="Description"
                        value={experienceFormData.description}
                        onChange={e => setExperienceFormData({...experienceFormData, description: e.target.value})}
                      />
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={experienceFormData.start_date}
                        onChange={e => setExperienceFormData({...experienceFormData, start_date: e.target.value})}
                        required
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        value={experienceFormData.end_date}
                        onChange={e => setExperienceFormData({...experienceFormData, end_date: e.target.value})}
                        disabled={experienceFormData.current}
                      />
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="current">Current</Label>
                        <input
                          id="current"
                          type="checkbox"
                          checked={experienceFormData.current}
                          onChange={e => setExperienceFormData({...experienceFormData, current: e.target.checked})}
                        />
                      </div>
                      <Textarea
                        placeholder="Achievements (one per line)"
                        value={experienceFormData.achievements}
                        onChange={e => setExperienceFormData({...experienceFormData, achievements: e.target.value})}
                      />
                      <Input
                        placeholder="Technologies Used (comma separated)"
                        value={experienceFormData.tech_used}
                        onChange={e => setExperienceFormData({...experienceFormData, tech_used: e.target.value})}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="submit">{editingExperience?.id ? 'Update' : 'Create'}</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingExperience(null)}>Cancel</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSection === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Messages</h2>
                  <Select value={messageFilter} onValueChange={setMessageFilter}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Filter messages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={messagesSearch}
                    onChange={e => setMessagesSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredMessages.map(message => (
                    <Card key={message.id} className={message.status === 'new' ? 'border-2 border-primary' : ''}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{message.subject}</h3>
                            <p className="text-muted-foreground">{message.name} &lt;{message.email}&gt;</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}</p>
                            <p className="mt-2 whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            {message.status === 'new' && (
                              <Button size="sm" variant="outline" onClick={() => markMessageAsRead(message.id)} title="Mark as read">
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => replyToMessage(message.email, message.subject)} title="Reply">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" title="Delete message">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this message? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMessage(message.id)}>Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Settings</h2>
                <form className="max-w-md space-y-4" onSubmit={e => e.preventDefault()}>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={settings.email}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                  />
                  <Input
                    type="password"
                    placeholder="Current Password"
                    value={settings.currentPassword}
                    onChange={e => setSettings({...settings, currentPassword: e.target.value})}
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={settings.newPassword}
                    onChange={e => setSettings({...settings, newPassword: e.target.value})}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={settings.confirmPassword}
                    onChange={e => setSettings({...settings, confirmPassword: e.target.value})}
                  />
                  <Button type="submit">Update Settings</Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
