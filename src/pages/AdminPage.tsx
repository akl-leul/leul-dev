import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WordPressAdminLayout } from '@/components/admin/WordPressAdminLayout';
import { WordPressPageEditor } from '@/components/admin/WordPressPageEditor';
import { NavigationManager } from '@/components/admin/NavigationManager';
import { AdminFeedbackManager } from '@/components/admin/AdminFeedbackManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { HomeContentEditor } from '@/components/admin/HomeContentEditor';
import { AboutContentEditor } from '@/components/admin/AboutContentEditor';
import { ContactContentEditor } from '@/components/admin/ContactContentEditor';
import { BlogPostEditor } from '@/components/admin/BlogPostEditor';

const AdminPage = () => {
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (isAdmin) {
      loadHomeContent();
      loadAboutContent();
      loadContactContent();
    }
  }, [isAdmin]);

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
            <AnalyticsDashboard
              analytics={{
                totalProjects: 0,
                totalPosts: 0,
                totalViews: 0,
                totalLikes: 0,
                totalContacts: 0,
                totalComments: 0,
              }}
            />
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
            <h1 className="text-3xl font-bold mb-4">Projects</h1>
            <p className="text-muted-foreground">Projects management coming soon...</p>
          </div>
        );
      case 'posts':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
            <p className="text-muted-foreground">Blog post management coming soon...</p>
          </div>
        );
      case 'skills':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Skills</h1>
            <p className="text-muted-foreground">Skills management coming soon...</p>
          </div>
        );
      case 'experiences':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Experience</h1>
            <p className="text-muted-foreground">Experience management coming soon...</p>
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
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <p className="text-muted-foreground">Messages management coming soon...</p>
          </div>
        );
      case 'comments':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Comments</h1>
            <p className="text-muted-foreground">Comments management coming soon...</p>
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
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
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
    <WordPressAdminLayout
      activeSection={selectedSection}
      onSectionChange={setSelectedSection}
    >
      {renderSection()}
    </WordPressAdminLayout>
  );
};

export default AdminPage;
