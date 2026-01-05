import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
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
import { PerformanceToggle } from '@/components/PerformanceToggle';
import {
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
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
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
  ExternalLink,
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
      title: 'Overview',
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
        { id: 'skills', icon: Sparkles, label: 'Skills' },
        { id: 'experiences', icon: Briefcase, label: 'Experience' },
        { id: 'dynamic-pages', icon: FileCode, label: 'Pages' },
        { id: 'navigation', icon: LinkIcon, label: 'Navigation' },
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
      title: 'System',
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
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
    
    if (isMobile) {
      setMobileSheetOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="py-4 space-y-6">
      {/* Logo/Brand */}
      <div className="px-4 mb-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(280_65%_60%)] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Admin</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </Link>
      </div>

      {menuSections.map((section) => (
        <div key={section.title} className="space-y-1">
          <h3 className="px-4 text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest mb-2">
            {section.title}
          </h3>
          <div className="space-y-0.5 px-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={cn(
                    'flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary font-medium sidebar-active'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 mr-3 transition-colors",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                  )} />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto text-sidebar-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top admin bar - sleek and minimal */}
      <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          {isMobile ? (
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-[hsl(var(--sidebar-background))] border-sidebar-border">
                <ScrollArea className="h-full">
                  <SidebarContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold gradient-text">Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Performance toggle */}
          <PerformanceToggle className="text-muted-foreground hover:text-foreground hover:bg-accent" />
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 hover:bg-accent rounded-xl"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''} 
                    alt={user?.email || 'User'} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium truncate max-w-[120px]">
                  {user?.email?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={() => handleSectionChange('settings')}
                className="cursor-pointer rounded-lg"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSectionChange('settings')}
                className="cursor-pointer rounded-lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
              >
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
              'bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border transition-all duration-300 shrink-0',
              sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
            )}
          >
            <ScrollArea className="h-full">
              <SidebarContent />
            </ScrollArea>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
