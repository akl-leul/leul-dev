import {
  Home,
  FolderOpen,
  PenLine,
  Award,
  Briefcase,
  Mail,
  MessageCircle,
  Settings,
  BarChart3,
  FileText,
  Info,
  Phone,
  Navigation,
  FileCode,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeProvider";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [contentOpen, setContentOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const { theme } = useTheme();

  const contentItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950" },
    { id: "about", label: "About", icon: Info, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950" },
    { id: "contact", label: "Contact", icon: Phone, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950" },
  ];

  const managementItems = [
    { id: "projects", label: "Projects", icon: FolderOpen, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950" },
    { id: "posts", label: "Blog Posts", icon: PenLine, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-950" },
    { id: "skills", label: "Skills", icon: Award, color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-950" },
    { id: "experiences", label: "Experience", icon: Briefcase, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-950" },
    { id: "dynamic-pages", label: "Dynamic Pages", icon: FileCode, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-950" },
    { id: "navigation", label: "Navigation", icon: Navigation, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950" },
  ];

  const communicationItems = [
    { id: "contacts", label: "Messages", icon: Mail, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950" },
    { id: "comments", label: "Comments", icon: MessageCircle, color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-50 dark:bg-teal-950" },
    { id: "feedback", label: "Feedback", icon: MessageCircle, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-50 dark:bg-cyan-950" },
  ];

  const getItemStyle = (item: any, isActive: boolean) => {
    if (isActive) {
      return `${item.bgColor} ${item.color} border-l-4 border-current shadow-md`;
    }
    return theme === 'dark' 
      ? "hover:bg-gray-800 hover:text-gray-200"
      : "hover:bg-gray-50 hover:text-gray-700";
  };

  const CollapsibleSection = ({
    title,
    emoji,
    items,
    open,
    onOpenChange,
    colorClass,
  }: {
    title: string;
    emoji: string;
    items: typeof contentItems;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    colorClass: string;
  }) => (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className={`flex items-center justify-between w-full ${colorClass} font-bold text-sm uppercase tracking-wider mb-3 hover:opacity-80 transition-colors cursor-pointer`}>
            <span>{emoji} {title}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent className="transition-all duration-200">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={`${getItemStyle(item, activeTab === item.id)} transition-all duration-200 font-medium`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );

  return (
    <Sidebar className="pt-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r-2 border-gray-200 dark:border-gray-700">
      <SidebarContent className="p-4">
        {/* Analytics - Always visible */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-indigo-700 dark:text-indigo-300 font-bold text-sm uppercase tracking-wider mb-3">
            📊 Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange("analytics")}
                  isActive={activeTab === "analytics"}
                  className={`${activeTab === "analytics" 
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 dark:from-indigo-900 dark:to-indigo-800 border-l-4 border-indigo-500 dark:border-indigo-400 shadow-md" 
                    : "hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-800 dark:hover:text-indigo-300"
                  } transition-all duration-200`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management - Collapsible */}
        <CollapsibleSection
          title="Content"
          emoji="📝"
          items={contentItems}
          open={contentOpen}
          onOpenChange={setContentOpen}
          colorClass="text-purple-700 dark:text-purple-300"
        />

        {/* Management - Collapsible */}
        <CollapsibleSection
          title="Management"
          emoji="🛠️"
          items={managementItems}
          open={managementOpen}
          onOpenChange={setManagementOpen}
          colorClass="text-orange-700 dark:text-orange-300"
        />

        {/* Communication - Collapsible */}
        <CollapsibleSection
          title="Communication"
          emoji="💬"
          items={communicationItems}
          open={communicationOpen}
          onOpenChange={setCommunicationOpen}
          colorClass="text-green-700 dark:text-green-300"
        />

        {/* Settings - Collapsible */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 font-bold text-sm uppercase tracking-wider mb-3 hover:opacity-80 transition-colors cursor-pointer">
                <span>⚙️ Settings</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="transition-all duration-200">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onTabChange("settings")}
                      isActive={activeTab === "settings"}
                      className={`${activeTab === "settings" 
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 dark:from-gray-800 dark:to-gray-700 border-l-4 border-gray-500 dark:border-gray-400 shadow-md" 
                        : "hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      } transition-all duration-200 font-medium`}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}