import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Reply, Settings, Upload, Eye, Mail, MapPin, Phone, Send, Check, Clock, Search, BarChart3, TrendingUp, Users, FileText, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  featured: boolean;
  status: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  slug: string;
  featured_image?: string;
  read_time: number;
  likes_count: number;
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
  years_experience?: number;
  icon?: string;
  created_at: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  company_url?: string;
  location?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  achievements?: string[];
  tech_used?: string[];
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [projectSearch, setProjectSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  // Date filter states
  const [projectSortBy, setProjectSortBy] = useState('latest');
  const [postSortBy, setPostSortBy] = useState('latest');
  const [skillSortBy, setSkillSortBy] = useState('latest');
  const [experienceSortBy, setExperienceSortBy] = useState('latest');
  const [contactSortBy, setContactSortBy] = useState('latest');

  // Filtered data
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactSubmission[]>([]);

const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [contactToDelete, setContactToDelete] = useState(null);
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    featuredProjects: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalSkills: 0,
    totalExperiences: 0,
    totalContacts: 0,
    newContacts: 0,
  });

  // Form states
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newSkillOpen, setNewSkillOpen] = useState(false);
  const [newExperienceOpen, setNewExperienceOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Post form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [readTime, setReadTime] = useState(5);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  
  // Project form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectContent, setProjectContent] = useState('');
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImageUrl, setProjectImageUrl] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [projectGithubUrl, setProjectGithubUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectFeatured, setProjectFeatured] = useState(false);
  const [projectStatus, setProjectStatus] = useState('completed');
  
  // Skill form state
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [skillCategory, setSkillCategory] = useState('technical');
  const [skillYears, setSkillYears] = useState(1);
  const [skillIcon, setSkillIcon] = useState('');
  
  // Experience form state
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expCompanyUrl, setExpCompanyUrl] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expAchievements, setExpAchievements] = useState('');
  const [expTechUsed, setExpTechUsed] = useState('');
  
  // Reply form state
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  
  // Settings form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const resetForms = () => {
    // Reset post form
    setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setPublished(false); setReadTime(5);
    setFeaturedImageFile(null); setFeaturedImageUrl('');
    
    // Reset project form
    setProjectTitle(''); setProjectDescription(''); setProjectContent(''); setProjectImageFile(null); setProjectImageUrl('');
    setProjectTechStack(''); setProjectGithubUrl(''); setProjectDemoUrl(''); setProjectFeatured(false); setProjectStatus('completed');
    
    // Reset skill form
    setSkillName(''); setSkillLevel('intermediate'); setSkillCategory('technical'); setSkillYears(1); setSkillIcon('');
    
    // Reset experience form
    setExpRole(''); setExpCompany(''); setExpCompanyUrl(''); setExpLocation(''); setExpDescription('');
    setExpStartDate(''); setExpEndDate(''); setExpCurrent(false); setExpAchievements(''); setExpTechUsed('');
    
    // Reset reply form
    setReplySubject(''); setReplyMessage('');
    
    // Reset settings form
    setNewEmail(''); setNewPassword(''); setConfirmPassword('');
    
    setEditMode(false); setCurrentItem(null);
  };

  const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
    if (!user || !file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFeaturedImageFile(file);
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProjectImageFile(file);
  };

  // CRUD Functions
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = featuredImageUrl;
      if (featuredImageFile) {
        imageUrl = await uploadImage(featuredImageFile, 'blog-images') || '';
      }

      const postData = {
        title, slug, excerpt, content, featured_image: imageUrl || null,
        published, published_at: published ? new Date().toISOString() : null,
        read_time: readTime, user_id: user.id,
      };

      if (editMode && currentItem) {
        const { error } = await supabase.from('posts').update(postData).eq('id', currentItem.id);
        if (error) throw error;
        toast({ title: 'Post updated', description: 'Your post has been updated successfully.' });
      } else {
        const { error } = await supabase.from('posts').insert(postData);
        if (error) throw error;
        toast({ title: 'Post created', description: 'Your post has been created successfully.' });
      }

      setNewPostOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save post', error);
      toast({ title: 'Error', description: error.message || 'Failed to save post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = projectImageUrl;
      if (projectImageFile) {
        imageUrl = await uploadImage(projectImageFile, 'project-images') || '';
      }

      const projectData = {
        title: projectTitle, description: projectDescription, content: projectContent,
        image_url: imageUrl || null, tech_stack: projectTechStack.split(',').map(t => t.trim()),
        github_url: projectGithubUrl || null, demo_url: projectDemoUrl || null,
        featured: projectFeatured, status: projectStatus, user_id: user.id,
      };

      if (editMode && currentItem) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', currentItem.id);
        if (error) throw error;
        toast({ title: 'Project updated', description: 'Your project has been updated successfully.' });
      } else {
        const { error } = await supabase.from('projects').insert(projectData);
        if (error) throw error;
        toast({ title: 'Project created', description: 'Your project has been created successfully.' });
      }

      setNewProjectOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save project', error);
      toast({ title: 'Error', description: error.message || 'Failed to save project', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const skillData = {
        name: skillName, level: skillLevel, category: skillCategory,
        years_experience: skillYears, icon: skillIcon || null, user_id: user.id,
      };

      if (editMode && currentItem) {
        const { error } = await supabase.from('skills').update(skillData).eq('id', currentItem.id);
        if (error) throw error;
        toast({ title: 'Skill updated', description: 'Your skill has been updated successfully.' });
      } else {
        const { error } = await supabase.from('skills').insert(skillData);
        if (error) throw error;
        toast({ title: 'Skill created', description: 'Your skill has been created successfully.' });
      }

      setNewSkillOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save skill', error);
      toast({ title: 'Error', description: error.message || 'Failed to save skill', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
const handleDeleteConfirm = async () => {
  if (!contactToDelete) return;
  const { error } = await supabase.from("contact_submissions").delete().eq("id", contactToDelete.id);
  if (error) {
    alert("Failed to delete: " + error.message);
  } else {
    mutate(); // refresh list
    setDeleteModalOpen(false);
    setContactToDelete(null);
  }
};
  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const experienceData = {
        role: expRole, company: expCompany, company_url: expCompanyUrl || null,
        location: expLocation || null, description: expDescription || null,
        start_date: expStartDate, end_date: expCurrent ? null : (expEndDate || null),
        current: expCurrent,
        achievements: expAchievements ? expAchievements.split('\n') : null,
        tech_used: expTechUsed ? expTechUsed.split(',').map(t => t.trim()) : null,
        user_id: user.id,
      };

      if (editMode && currentItem) {
        const { error } = await supabase.from('experiences').update(experienceData).eq('id', currentItem.id);
        if (error) throw error;
        toast({ title: 'Experience updated', description: 'Your experience has been updated successfully.' });
      } else {
        const { error } = await supabase.from('experiences').insert(experienceData);
        if (error) throw error;
        toast({ title: 'Experience created', description: 'Your experience has been created successfully.' });
      }

      setNewExperienceOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save experience', error);
      toast({ title: 'Error', description: error.message || 'Failed to save experience', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-email-reply', {
        body: {
          contactId: selectedContact.id,
          replySubject: replySubject,
          replyMessage: replyMessage,
          recipientEmail: selectedContact.email,
          recipientName: selectedContact.name,
        },
      });

      if (error) throw error;

      toast({ title: 'Reply sent', description: 'Your reply has been sent successfully.' });
      setReplyModalOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      console.error('Failed to send reply', error);
      toast({ title: 'Error', description: error.message || 'Failed to send reply', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const updates: any = {};
      if (newEmail) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      toast({ title: 'Settings updated', description: 'Your account settings have been updated successfully.' });
      setSettingsModalOpen(false);
      resetForms();
    } catch (error: any) {
      console.error('Failed to update settings', error);
      toast({ title: 'Error', description: error.message || 'Failed to update settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter effects
  useEffect(() => {
    let filtered = projects.filter(project =>
      project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      project.description.toLowerCase().includes(projectSearch.toLowerCase())
    );
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      
      if (projectSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA; // latest (default)
    });
    
    setFilteredProjects(filtered);
  }, [projects, projectSearch, projectSortBy]);

  useEffect(() => {
    let filtered = posts.filter(post =>
      post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(postSearch.toLowerCase())
    );
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      
      if (postSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA; // latest (default)
    });
    
    setFilteredPosts(filtered);
  }, [posts, postSearch, postSortBy]);

  useEffect(() => {
    let filtered = skills.filter(skill =>
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      skill.category.toLowerCase().includes(skillSearch.toLowerCase())
    );
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      
      if (skillSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA; // latest (default)
    });
    
    setFilteredSkills(filtered);
  }, [skills, skillSearch, skillSortBy]);

  useEffect(() => {
    let filtered = experiences.filter(exp =>
      exp.role.toLowerCase().includes(experienceSearch.toLowerCase()) ||
      exp.company.toLowerCase().includes(experienceSearch.toLowerCase())
    );
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      
      if (experienceSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA; // latest (default)
    });
    
    setFilteredExperiences(filtered);
  }, [experiences, experienceSearch, experienceSortBy]);

  useEffect(() => {
    let filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.subject.toLowerCase().includes(contactSearch.toLowerCase())
    );
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      if (contactSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA; // latest (default)
    });
    
    setFilteredContacts(filtered);
  }, [contacts, contactSearch, contactSortBy]);

  // Update analytics when data changes
  useEffect(() => {
    setAnalytics({
      totalProjects: projects.length,
      featuredProjects: projects.filter(p => p.featured).length,
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.published).length,
      totalViews: posts.reduce((sum, post) => sum + (post.likes_count || 0), 0),
      totalLikes: posts.reduce((sum, post) => sum + (post.likes_count || 0), 0),
      totalSkills: skills.length,
      totalExperiences: experiences.length,
      totalContacts: contacts.length,
      newContacts: contacts.filter(c => c.status === 'new').length,
    });
  }, [projects, posts, skills, experiences, contacts]);

  const fetchData = async () => {
    try {
      const [projectsRes, postsRes, skillsRes, experiencesRes, contactsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user?.id),
        supabase.from('posts').select('*').eq('user_id', user?.id),
        supabase.from('skills').select('*').eq('user_id', user?.id),
        supabase.from('experiences').select('*').eq('user_id', user?.id),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      ]);

      setProjects(projectsRes.data || []);
      setPosts(postsRes.data || []);
      setSkills(skillsRes.data || []);
      setExperiences(experiencesRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Project deleted successfully" });
      fetchData();
    }
  };

  const deletePost = async (id: number) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Post deleted successfully" });
      fetchData();
    }
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete skill", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Skill deleted successfully" });
      fetchData();
    }
  };

  const deleteExperience = async (id: string) => {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete experience", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Experience deleted successfully" });
      fetchData();
    }
  };

  const handleConfirmDelete = (type: string, id: string, name: string) => {
    switch (type) {
      case 'project':
        deleteProject(id);
        break;
      case 'post':
        deletePost(Number(id));
        break;
      case 'skill':
        deleteSkill(id);
        break;
      case 'experience':
        deleteExperience(id);
        break;
    }
  };

  // Edit functions
  const editPost = (post: Post) => {
    setCurrentItem(post);
    setEditMode(true);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setPublished(post.published);
    setReadTime(post.read_time);
    setFeaturedImageUrl(post.featured_image || '');
    setNewPostOpen(true);
  };

  const editProject = (project: Project) => {
    setCurrentItem(project);
    setEditMode(true);
    setProjectTitle(project.title);
    setProjectDescription(project.description);
    setProjectContent(project.content || '');
    setProjectImageUrl(project.image_url || '');
    setProjectTechStack(project.tech_stack?.join(', ') || '');
    setProjectGithubUrl(project.github_url || '');
    setProjectDemoUrl(project.demo_url || '');
    setProjectFeatured(project.featured);
    setProjectStatus(project.status);
    setNewProjectOpen(true);
  };

  const editSkill = (skill: Skill) => {
    setCurrentItem(skill);
    setEditMode(true);
    setSkillName(skill.name);
    setSkillLevel(skill.level);
    setSkillCategory(skill.category);
    setSkillYears(skill.years_experience || 1);
    setSkillIcon(skill.icon || '');
    setNewSkillOpen(true);
  };

  const editExperience = (experience: Experience) => {
    setCurrentItem(experience);
    setEditMode(true);
    setExpRole(experience.role);
    setExpCompany(experience.company);
    setExpCompanyUrl(experience.company_url || '');
    setExpLocation(experience.location || '');
    setExpDescription(experience.description || '');
    setExpStartDate(experience.start_date);
    setExpEndDate(experience.end_date || '');
    setExpCurrent(experience.current);
    setExpAchievements(experience.achievements?.join('\n') || '');
    setExpTechUsed(experience.tech_used?.join(', ') || '');
    setNewExperienceOpen(true);
  };

  const openReplyModal = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setReplySubject(contact.subject);
    setReplyMessage('');
    setReplyModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 space-y-4 text-center">
            <p>Please log in to access the admin panel.</p>
            <Button asChild>
              <a href="/auth">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="analytics">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="posts">Blog Posts</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experiences">Experience</TabsTrigger>
            <TabsTrigger value="contacts">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Analytics Overview</h2>
              <Badge variant="secondary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{analytics.totalProjects}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {analytics.featuredProjects} featured
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Blog Posts</p>
                      <p className="text-2xl font-bold">{analytics.totalPosts}</p>
                    </div>
                    <Edit className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {analytics.publishedPosts} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Skills</p>
                      <p className="text-2xl font-bold">{analytics.totalSkills}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    across {skills.reduce((acc, skill) => {
                      if (!acc.includes(skill.category)) acc.push(skill.category);
                      return acc;
                    }, [] as string[]).length} categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Messages</p>
                      <p className="text-2xl font-bold">{analytics.totalContacts}</p>
                    </div>
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {analytics.newContacts} unread
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across all content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground">Blog post • ❤️ {post.likes_count || 0}</p>
                        </div>
                      </div>
                    ))}
                    {projects.slice(0, 2).map((project) => (
                      <div key={project.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">Project • {project.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                  <CardDescription>Overview of your content performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Work Experience</span>
                      <Badge variant="outline">{analytics.totalExperiences} entries</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Skills</span>
                      <Badge variant="outline">{skills.filter(s => s.category === 'technical').length} skills</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Featured Projects</span>
                      <Badge variant="outline">{analytics.featuredProjects} projects</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Published Posts</span>
                      <Badge variant="outline">{analytics.publishedPosts} posts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Projects ({filteredProjects.length})</h2>
              <Dialog open={newProjectOpen} onOpenChange={(open) => { setNewProjectOpen(open); if (!open) resetForms(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectTitle">Title</Label>
                        <Input id="projectTitle" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="projectStatus">Status</Label>
                        <Select value={projectStatus} onValueChange={setProjectStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="projectDescription">Description</Label>
                      <Textarea id="projectDescription" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="projectContent">Content (Optional)</Label>
                      <Textarea id="projectContent" value={projectContent} onChange={(e) => setProjectContent(e.target.value)} className="min-h-[120px]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectTechStack">Tech Stack (comma separated)</Label>
                        <Input id="projectTechStack" value={projectTechStack} onChange={(e) => setProjectTechStack(e.target.value)} placeholder="React, Node.js, MongoDB" />
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <Label htmlFor="projectFeatured">Featured Project</Label>
                        <Switch id="projectFeatured" checked={projectFeatured} onCheckedChange={setProjectFeatured} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectGithubUrl">GitHub URL</Label>
                        <Input id="projectGithubUrl" value={projectGithubUrl} onChange={(e) => setProjectGithubUrl(e.target.value)} placeholder="https://github.com/..." />
                      </div>
                      <div>
                        <Label htmlFor="projectDemoUrl">Demo URL</Label>
                        <Input id="projectDemoUrl" value={projectDemoUrl} onChange={(e) => setProjectDemoUrl(e.target.value)} placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <Label>Project Image</Label>
                      <Input type="file" accept="image/*" onChange={handleProjectFileChange} />
                      <div className="text-xs text-muted-foreground mt-1">Or paste an image URL</div>
                      <Input placeholder="https://..." value={projectImageUrl} onChange={(e) => setProjectImageUrl(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setNewProjectOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (editMode ? 'Update Project' : 'Create Project')}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={projectSortBy} onValueChange={setProjectSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {project.title}
                            {project.featured && <Badge>Featured</Badge>}
                            <Badge variant="secondary">{project.status}</Badge>
                          </CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editProject(project)}>
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
                                  Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmDelete('project', project.id, project.title)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Blog Posts ({filteredPosts.length})</h2>
              <Dialog open={newPostOpen} onOpenChange={(open) => { setNewPostOpen(open); if (!open) resetForms(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editMode ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="content">Content (Markdown)</Label>
                      <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[160px]" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="read_time">Read time (min)</Label>
                        <Input id="read_time" type="number" min={1} value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} />
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <Label htmlFor="published">Publish now</Label>
                        <Switch id="published" checked={published} onCheckedChange={setPublished} />
                      </div>
                    </div>
                    <div>
                      <Label>Featured image</Label>
                      <Input type="file" accept="image/*" onChange={handleFileChange} />
                      <div className="text-xs text-muted-foreground mt-1">Or paste an image URL</div>
                      <Input placeholder="https://..." value={featuredImageUrl} onChange={(e) => setFeaturedImageUrl(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setNewPostOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (editMode ? 'Update Post' : 'Create Post')}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blog posts..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={postSortBy} onValueChange={setPostSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {post.title}
                            {post.published ? (
                              <Badge>Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span>{post.excerpt}</span>
                            <span className="text-sm">❤️ {post.likes_count || 0}</span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editPost(post)}>
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
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmDelete('post', post.id.toString(), post.title)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Skills ({filteredSkills.length})</h2>
              <Dialog open={newSkillOpen} onOpenChange={(open) => { setNewSkillOpen(open); if (!open) resetForms(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editMode ? 'Edit Skill' : 'Create New Skill'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSkill} className="space-y-4">
                    <div>
                      <Label htmlFor="skillName">Skill Name</Label>
                      <Input id="skillName" value={skillName} onChange={(e) => setSkillName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="skillLevel">Level</Label>
                        <Select value={skillLevel} onValueChange={setSkillLevel}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="skillCategory">Category</Label>
                        <Select value={skillCategory} onValueChange={setSkillCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="soft">Soft Skills</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
<SelectItem value="Backend/ORM/Database" >Backend/ORM/Database</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="skillYears">Years Experience</Label>
                        <Input id="skillYears" type="number" min={0} value={skillYears} onChange={(e) => setSkillYears(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="skillIcon">Icon (optional)</Label>
                        <Input id="skillIcon" value={skillIcon} onChange={(e) => setSkillIcon(e.target.value)} placeholder="react, javascript, etc." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setNewSkillOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (editMode ? 'Update Skill' : 'Create Skill')}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillSortBy} onValueChange={setSkillSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {skill.icon && <span>{skill.icon}</span>}
                            {skill.name}
                            <Badge variant="outline">{skill.level}</Badge>
                          </CardTitle>
                          <CardDescription>
                            {skill.category} • {skill.years_experience || 0} years
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => editSkill(skill)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{skill.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmDelete('skill', skill.id, skill.name)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="experiences" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Work Experience ({filteredExperiences.length})</h2>
              <Dialog open={newExperienceOpen} onOpenChange={(open) => { setNewExperienceOpen(open); if (!open) resetForms(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editMode ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateExperience} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expRole">Job Title</Label>
                        <Input id="expRole" value={expRole} onChange={(e) => setExpRole(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="expCompany">Company</Label>
                        <Input id="expCompany" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expCompanyUrl">Company URL (optional)</Label>
                        <Input id="expCompanyUrl" value={expCompanyUrl} onChange={(e) => setExpCompanyUrl(e.target.value)} placeholder="https://..." />
                      </div>
                      <div>
                        <Label htmlFor="expLocation">Location (optional)</Label>
                        <Input id="expLocation" value={expLocation} onChange={(e) => setExpLocation(e.target.value)} placeholder="San Francisco, CA" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expDescription">Description</Label>
                      <Textarea id="expDescription" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} className="min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expStartDate">Start Date</Label>
                        <Input id="expStartDate" type="date" value={expStartDate} onChange={(e) => setExpStartDate(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="expEndDate">End Date</Label>
                        <Input id="expEndDate" type="date" value={expEndDate} onChange={(e) => setExpEndDate(e.target.value)} disabled={expCurrent} />
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <Label htmlFor="expCurrent">Current Role</Label>
                        <Switch id="expCurrent" checked={expCurrent} onCheckedChange={setExpCurrent} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expAchievements">Key Achievements (one per line)</Label>
                      <Textarea id="expAchievements" value={expAchievements} onChange={(e) => setExpAchievements(e.target.value)} placeholder="Increased performance by 40%..." className="min-h-[80px]" />
                    </div>
                    <div>
                      <Label htmlFor="expTechUsed">Technologies Used (comma separated)</Label>
                      <Input id="expTechUsed" value={expTechUsed} onChange={(e) => setExpTechUsed(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setNewExperienceOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (editMode ? 'Update Experience' : 'Create Experience')}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search experiences..."
                  value={experienceSearch}
                  onChange={(e) => setExperienceSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={experienceSortBy} onValueChange={setExperienceSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {filteredExperiences.map((exp) => (
                  <Card key={exp.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {exp.role} at {exp.company}
                            {exp.current && <Badge>Current</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {exp.location && `${exp.location} • `}
                            {format(new Date(exp.start_date), 'MMM yyyy')} - {exp.current ? 'Present' : (exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'Present')}
                          </CardDescription>
                          {exp.description && <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editExperience(exp)}>
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
                                  Are you sure you want to delete "{exp.role} at {exp.company}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmDelete('experience', exp.id, `${exp.role} at ${exp.company}`)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    {(exp.tech_used || exp.achievements) && (
                      <CardContent>
                        {exp.tech_used && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-2">Technologies:</h4>
                            <div className="flex flex-wrap gap-1">
                              {exp.tech_used.map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {exp.achievements && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Key Achievements:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {exp.achievements.map((achievement, idx) => (
                                <li key={idx}>• {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Contact Messages ({filteredContacts.length})</h2>
              <Badge variant="secondary">{contacts.filter(c => c.status === 'new').length} new</Badge>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={contactSortBy} onValueChange={setContactSortBy}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className={contact.status === 'new' ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {contact.subject}
                            <Badge variant={contact.status === 'new' ? 'default' : contact.status === 'replied' ? 'secondary' : 'outline'}>
                              {contact.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contact.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(contact.created_at), 'MMM dd, yyyy')}
                            </span>
                          </CardDescription>
                          <p className="mt-3 text-sm text-muted-foreground">{contact.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openReplyModal(contact)}>
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                
   {filteredContacts.length === 0 && (
  <Card>
    <CardContent className="p-8 text-center">
      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No contact messages yet.</p>
    </CardContent>
  </Card>
)}

{filteredContacts.map((contact) => (
  <Card key={contact.id} className="p-4 flex justify-between items-center mb-2">
    <div>
      <p className="font-medium">{contact.name}</p>
      <p className="text-sm text-muted-foreground">{contact.email}</p>
    </div>
    <Button
      variant="destructive"
      size="icon"
      onClick={() => {
        setContactToDelete(contact);
        setDeleteModalOpen(true);
      }}
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  </Card>
))}

{/* Delete Confirmation Modal */}
<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to delete this message?</p>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDeleteConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Reply Modal */}
<Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
  <DialogContent className="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSendReply} className="space-y-4">
      <div>
        <Label htmlFor="replySubject">Subject</Label>
        <Input
          id="replySubject"
          value={replySubject}
          onChange={(e) => setReplySubject(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="replyMessage">Your Reply</Label>
        <Textarea
          id="replyMessage"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          className="min-h-[200px]"
          required
          placeholder="Write your reply here..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setReplyModalOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reply"}
          <Send className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Account Settings</h2>
            </div>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Update Account Information
                  </CardTitle>
                  <CardDescription>Change your email address and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div>
                      <Label htmlFor="newEmail">New Email Address (optional)</Label>
                      <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newPassword">New Password (optional)</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Settings'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Current User Information</CardTitle>
                  <CardDescription>Your current account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User ID:</span>
                    <span className="text-sm text-muted-foreground">{user?.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm text-muted-foreground">
                      {user?.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;