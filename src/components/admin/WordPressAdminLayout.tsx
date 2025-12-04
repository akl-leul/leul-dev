import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeProvider';
import {
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  Link,
  MessageSquare,
  Home,
  Info,
  Phone,
  FolderOpen,
  PenLine,
  Award,
  Briefcase,
  Mail,
  MessageCircle,
  FileCode,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordPressAdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function WordPressAdminLayout({
  children,
  activeSection,
  onSectionChange,
}: WordPressAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuSections = [
    {
      title: 'Analytics',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
      ],
    },
    {
      title: 'Content',
      items: [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'about', icon: Info, label: 'About' },
        { id: 'contact', icon: Phone, label: 'Contact' },
      ],
    },
    {
      title: 'Management',
      items: [
        { id: 'projects', icon: FolderOpen, label: 'Projects' },
        { id: 'posts', icon: PenLine, label: 'Blog Posts' },
        { id: 'categories', icon: FolderOpen, label: 'Categories' },
        { id: 'tags', icon: Award, label: 'Tags' },
        { id: 'skills', icon: Award, label: 'Skills' },
        { id: 'experiences', icon: Briefcase, label: 'Experience' },
        { id: 'dynamic-pages', icon: FileCode, label: 'Dynamic Pages' },
        { id: 'navigation', icon: Link, label: 'Navigation' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { id: 'contacts', icon: Mail, label: 'Messages' },
        { id: 'comments', icon: MessageCircle, label: 'Comments' },
        { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    if (isMobile) {
      setMobileSheetOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="p-4 space-y-6">
      {menuSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-[hsl(var(--sidebar-foreground))]/60 uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
                    activeSection === item.id &&
                      'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]'
                  )}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top admin bar */}
      <header className="h-14 bg-[hsl(var(--wp-admin-bar))] text-white flex items-center justify-between px-2 sm:px-4 border-b border-black/20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu */}
          {isMobile ? (
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[hsl(var(--sidebar-background))]">
                <ScrollArea className="h-full">
                  <SidebarContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-sm sm:text-lg font-semibold truncate">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white hover:bg-white/10"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[hsl(var(--wp-blue))] text-white text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm truncate max-w-[150px]">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              'bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 shrink-0',
              sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
            )}
          >
            <ScrollArea className="h-full">
              <SidebarContent />
            </ScrollArea>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
