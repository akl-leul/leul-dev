import { useState } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  Briefcase, 
  Wrench,
  BarChart3,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'posts', label: 'Blog Posts', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'experiences', label: 'Experience', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && <h2 className="font-semibold text-foreground">Admin Panel</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-2" : "px-3"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;