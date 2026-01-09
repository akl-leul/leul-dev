import { useState, useMemo } from 'react';
import { icons, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  trigger?: React.ReactNode;
}

// Icon categories for better organization
const ICON_CATEGORIES: Record<string, string[]> = {
  common: [
    'Home', 'User', 'Settings', 'Search', 'Menu', 'X', 'Check', 'ChevronRight', 
    'ChevronLeft', 'ChevronDown', 'ChevronUp', 'ArrowRight', 'ArrowLeft', 
    'Plus', 'Minus', 'Heart', 'Star', 'Bell', 'Mail', 'Phone', 'MapPin',
    'Calendar', 'Clock', 'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key',
  ],
  social: [
    'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github',
    'Twitch', 'Dribbble', 'Figma', 'Slack', 'Discord',
  ],
  media: [
    'Image', 'Video', 'Camera', 'Film', 'Music', 'Mic', 'Volume2', 'VolumeX',
    'Play', 'Pause', 'SkipForward', 'SkipBack', 'Maximize', 'Minimize',
  ],
  files: [
    'File', 'FileText', 'Folder', 'FolderOpen', 'Download', 'Upload',
    'Paperclip', 'Link', 'ExternalLink', 'Copy', 'Clipboard',
  ],
  commerce: [
    'ShoppingCart', 'ShoppingBag', 'CreditCard', 'DollarSign', 'Wallet',
    'Receipt', 'Tag', 'Gift', 'Package', 'Truck',
  ],
  communication: [
    'MessageCircle', 'MessageSquare', 'Send', 'Inbox', 'AtSign',
    'Share', 'Share2', 'Forward', 'Reply', 'Users',
  ],
  devices: [
    'Smartphone', 'Tablet', 'Laptop', 'Monitor', 'Tv', 'Speaker',
    'Headphones', 'Printer', 'Cpu', 'HardDrive', 'Wifi',
  ],
  weather: [
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'Wind',
    'Thermometer', 'Umbrella', 'Sunrise', 'Sunset',
  ],
  arrows: [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUpRight',
    'ArrowDownLeft', 'CornerUpRight', 'CornerDownLeft', 'RefreshCw',
    'RotateCw', 'RotateCcw', 'Repeat', 'Shuffle',
  ],
  shapes: [
    'Circle', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'Octagon',
    'Diamond', 'RectangleHorizontal', 'RectangleVertical',
  ],
};

export function IconPicker({ value, onChange, trigger }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('common');

  // Get all icons as array with names
  const allIcons = useMemo(() => {
    return Object.entries(icons).map(([name, Icon]) => ({
      name,
      Icon: Icon as LucideIcon,
    }));
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (search) {
      return allIcons.filter(({ name }) =>
        name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Get icons for current category
    const categoryIcons = ICON_CATEGORIES[activeTab] || [];
    return allIcons.filter(({ name }) => categoryIcons.includes(name));
  }, [allIcons, search, activeTab]);

  // Get currently selected icon
  const SelectedIcon = value ? (icons[value as keyof typeof icons] as LucideIcon) : null;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start gap-2 h-10">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select icon...</span>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="pl-9"
          />
        </div>

        {!search && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              {Object.keys(ICON_CATEGORIES).map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize text-xs px-3 py-1"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No icons found matching "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map(({ name, Icon }) => (
                <Button
                  key={name}
                  variant={value === name ? 'default' : 'outline'}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleSelect(name)}
                  title={name}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        {search && filteredIcons.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {filteredIcons.length} of {allIcons.length} icons
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Render icon by name helper component
export function IconByName({ 
  name, 
  className,
  size = 24,
  color = 'currentColor',
}: { 
  name: string; 
  className?: string;
  size?: number;
  color?: string;
}) {
  const Icon = icons[name as keyof typeof icons] as LucideIcon | undefined;
  
  if (!Icon) {
    return <span className={className}>⭐</span>;
  }
  
  return <Icon className={className} size={size} color={color} />;
}
