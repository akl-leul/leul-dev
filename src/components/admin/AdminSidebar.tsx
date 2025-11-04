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
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [contentOpen, setContentOpen] = useState(true);

  const contentItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "about", label: "About", icon: Info, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "contact", label: "Contact", icon: Phone, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const managementItems = [
    { id: "projects", label: "Projects", icon: FolderOpen, color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: "posts", label: "Blog Posts", icon: PenLine, color: "text-pink-600", bgColor: "bg-pink-50" },
    { id: "skills", label: "Skills", icon: Award, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: "experiences", label: "Experience", icon: Briefcase, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { id: "dynamic-pages", label: "Dynamic Pages", icon: FileCode, color: "text-violet-600", bgColor: "bg-violet-50" },
    { id: "navigation", label: "Navigation", icon: Navigation, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  ];

  const communicationItems = [
    { id: "contacts", label: "Messages", icon: Mail, color: "text-red-600", bgColor: "bg-red-50" },
    { id: "comments", label: "Comments", icon: MessageCircle, color: "text-teal-600", bgColor: "bg-teal-50" },
    { id: "feedback", label: "Feedback", icon: MessageCircle, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  ];

  const getItemStyle = (item: any, isActive: boolean) => {
    if (isActive) {
      return `${item.bgColor} ${item.color} border-l-4 border-current shadow-md`;
    }
    return "hover:bg-gray-50 hover:text-gray-700";
  };

  return (
    <Sidebar className="pt-16 bg-gradient-to-b from-gray-50 to-white border-r-2 border-gray-200">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-indigo-700 font-bold text-sm uppercase tracking-wider mb-3">
            📊 Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange("analytics")}
                  isActive={activeTab === "analytics"}
                  className={`${activeTab === "analytics" 
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-l-4 border-indigo-500 shadow-md" 
                    : "hover:bg-indigo-50 hover:text-indigo-600"
                  } transition-all duration-200`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-purple-700 font-bold text-sm uppercase tracking-wider mb-3 hover:text-purple-800 transition-colors">
                📝 Content Management
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${contentOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-3">
            🛠️ Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
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
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700 font-bold text-sm uppercase tracking-wider mb-3">
            💬 Communication
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationItems.map((item) => (
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
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-bold text-sm uppercase tracking-wider mb-3">
            ⚙️ Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTabChange("settings")}
                  isActive={activeTab === "settings"}
                  className={`${activeTab === "settings" 
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-l-4 border-gray-500 shadow-md" 
                    : "hover:bg-gray-50 hover:text-gray-600"
                  } transition-all duration-200 font-medium`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
