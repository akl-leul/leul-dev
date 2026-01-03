import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { WordPressAdminLayout } from '@/components/admin/WordPressAdminLayout';
import { WordPressPageEditor } from '@/components/admin/WordPressPageEditor';
import { NavigationManager } from '@/components/admin/NavigationManager';
import { AdminFeedbackManager } from '@/components/admin/AdminFeedbackManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { HomeContentEditor } from '@/components/admin/HomeContentEditor';
import { AboutContentEditor } from '@/components/admin/AboutContentEditor';
import { ContactContentEditor } from '@/components/admin/ContactContentEditor';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';
import { ProjectsManager } from '@/components/admin/ProjectsManager';
import { BlogPostsManager } from '@/components/admin/BlogPostsManager';
import { ExperiencesManager } from '@/components/admin/ExperiencesManager';
import { SkillsManager } from '@/components/admin/SkillsManager';
import { MessagesManager } from '@/components/admin/MessagesManager';
import { CommentsManager } from '@/components/admin/CommentsManager';
import { SettingsManager } from '@/components/admin/SettingsManager';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { TagsManager } from '@/components/admin/TagsManager';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const { refetch: refetchSettings } = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedSection, setSelectedSection] = useState('analytics');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // State for content editors
  const [homeContent, setHomeContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [contactContent, setContactContent] = useState<any>({
    email: '',
    phone: '',
    location: '',
  });
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalContacts: 0,
    totalComments: 0,
  });

  // Check if user is admin by querying admin_roles table
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Load home content
  const loadHomeContent = async () => {
    const { data } = await supabase
      .from('home_content')
      .select('*')
      .maybeSingle();
    setHomeContent(data);
  };

  // Load about content
  const loadAboutContent = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setAboutContent(data);
  };

  // Load contact content
  const loadContactContent = async () => {
    const { data } = await supabase
      .from('contact_content')
      .select('*')
      .maybeSingle();
    if (data) {
      setContactContent({
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
      });
    }
  };
  
  // Load analytics data
  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      // Fetch counts in parallel - filter by user_id where applicable
      const [projectsRes, postsRes, viewsRes, contactsRes, commentsRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('posts').select('id, likes_count', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('page_views').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      // Calculate total likes from posts
      const totalLikes = postsRes.data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;

      setAnalytics({
        totalProjects: projectsRes.count || 0,
        totalPosts: postsRes.count || 0,
        totalViews: viewsRes.count || 0,
        totalLikes,
        totalContacts: contactsRes.count || 0,
        totalComments: commentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      loadHomeContent();
      loadAboutContent();
      loadContactContent();
      loadAnalytics();
    }
  }, [isAdmin, user]);

  // Handle URL parameter changes
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setSelectedSection(sectionParam);
    }
  }, [searchParams]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const renderSection = () => {
    switch (selectedSection) {
      case 'analytics':
        return (
          <div className="p-6">
            <AnalyticsDashboard analytics={analytics} />
          </div>
        );
      case 'home':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Home Content</h1>
            <HomeContentEditor content={homeContent} onUpdate={loadHomeContent} />
          </div>
        );
      case 'about':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">About Content</h1>
            <AboutContentEditor profile={aboutContent} onUpdate={loadAboutContent} />
          </div>
        );
      case 'contact':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Contact Content</h1>
            <ContactContentEditor
              contactInfo={contactContent}
              onUpdate={async (info) => {
                setContactContent(info);
                const { data: existing } = await supabase
                  .from('contact_content')
                  .select('id')
                  .maybeSingle();
                
                if (existing) {
                  await supabase
                    .from('contact_content')
                    .update(info)
                    .eq('id', existing.id);
                } else {
                  await supabase
                    .from('contact_content')
                    .insert([info]);
                }
              }}
            />
          </div>
        );
      case 'projects':
        return (
          <div className="p-6">
            <ProjectsManager />
          </div>
        );
      case 'posts':
        return (
          <div className="p-6">
            <BlogPostsManager />
          </div>
        );
      case 'skills':
        return (
          <div className="p-6">
            <SkillsManager />
          </div>
        );
      case 'experiences':
        return (
          <div className="p-6">
            <ExperiencesManager />
          </div>
        );
      case 'dynamic-pages':
        return <WordPressPageEditor />;
      case 'navigation':
        return (
          <div className="p-6">
            <NavigationManager />
          </div>
        );
      case 'contacts':
        return (
          <div className="p-6">
            <MessagesManager />
          </div>
        );
      case 'comments':
        return (
          <div className="p-6">
            <CommentsManager />
          </div>
        );
      case 'feedback':
        return (
          <div className="p-6">
            <AdminFeedbackManager />
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <SettingsManager onSettingsUpdate={refetchSettings} />
          </div>
        );
      case 'categories':
        return (
          <div className="p-6">
            <CategoriesManager />
          </div>
        );
      case 'tags':
        return (
          <div className="p-6">
            <TagsManager />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Welcome to Admin</h1>
            <p className="text-muted-foreground">Select a section from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="pt-20">
      <WordPressAdminLayout
        activeSection={selectedSection}
        onSectionChange={setSelectedSection}
      >
        {renderSection()}
      </WordPressAdminLayout>
    </div>
  );
};

export default AdminPage;
