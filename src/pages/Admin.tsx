import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WordPressAdminLayout } from '@/components/admin/WordPressAdminLayout';
import { WordPressPageEditor } from '@/components/admin/WordPressPageEditor';
import { NavigationManager } from '@/components/admin/NavigationManager';
import { AdminFeedbackManager } from '@/components/admin/AdminFeedbackManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

const Admin = () => {
  const { user, loading } = useAuth();
  const [selectedSection, setSelectedSection] = useState('pages');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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
      case 'dashboard':
        return (
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
        );
      case 'pages':
        return <WordPressPageEditor />;
      case 'navigation':
        return (
          <div className="p-6">
            <NavigationManager />
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

export default Admin;
