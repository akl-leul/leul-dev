import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Heading, 
  Image, 
  Grid3X3, 
  MousePointer2, 
  Video, 
  FileInput, 
  SlidersHorizontal, 
  ChevronDown, 
  Code, 
  Minus, 
  Space, 
  Star,
  Columns3,
  Square,
  Search,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComponentType } from './types';

interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  category: 'basic' | 'media' | 'interactive' | 'layout' | 'advanced';
  description: string;
}

const COMPONENTS: ComponentItem[] = [
  { type: 'heading', label: 'Heading', icon: <Heading className="h-5 w-5" />, category: 'basic', description: 'H1-H6 headings' },
  { type: 'text', label: 'Text Block', icon: <Type className="h-5 w-5" />, category: 'basic', description: 'Rich text content' },
  { type: 'button', label: 'Button', icon: <MousePointer2 className="h-5 w-5" />, category: 'basic', description: 'Call to action' },
  { type: 'divider', label: 'Divider', icon: <Minus className="h-5 w-5" />, category: 'basic', description: 'Horizontal line' },
  { type: 'spacer', label: 'Spacer', icon: <Space className="h-5 w-5" />, category: 'basic', description: 'Vertical spacing' },
  { type: 'icon', label: 'Icon', icon: <Star className="h-5 w-5" />, category: 'basic', description: 'Decorative icon' },
  { type: 'image', label: 'Image', icon: <Image className="h-5 w-5" />, category: 'media', description: 'Single image' },
  { type: 'gallery', label: 'Gallery', icon: <Grid3X3 className="h-5 w-5" />, category: 'media', description: 'Image gallery' },
  { type: 'video', label: 'Video', icon: <Video className="h-5 w-5" />, category: 'media', description: 'YouTube/Vimeo embed' },
  { type: 'slider', label: 'Slider', icon: <SlidersHorizontal className="h-5 w-5" />, category: 'media', description: 'Image carousel' },
  { type: 'form', label: 'Form', icon: <FileInput className="h-5 w-5" />, category: 'interactive', description: 'Contact form' },
  { type: 'accordion', label: 'Accordion', icon: <ChevronDown className="h-5 w-5" />, category: 'interactive', description: 'Collapsible sections' },
  { type: 'columns', label: 'Columns', icon: <Columns3 className="h-5 w-5" />, category: 'layout', description: 'Multi-column layout' },
  { type: 'container', label: 'Container', icon: <Square className="h-5 w-5" />, category: 'layout', description: 'Content wrapper' },
  { type: 'html', label: 'Custom HTML', icon: <Code className="h-5 w-5" />, category: 'advanced', description: 'Raw HTML/CSS' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'basic', label: 'Basic', icon: <Type className="h-4 w-4" /> },
  { id: 'media', label: 'Media', icon: <Image className="h-4 w-4" /> },
  { id: 'interactive', label: 'Interactive', icon: <MousePointer2 className="h-4 w-4" /> },
  { id: 'layout', label: 'Layout', icon: <Columns3 className="h-4 w-4" /> },
  { id: 'advanced', label: 'Advanced', icon: <Code className="h-4 w-4" /> },
];

interface ComponentLibraryProps {
  onDragStart: (componentType: ComponentType) => void;
  onAddComponent: (componentType: ComponentType) => void;
}

export function ComponentLibrary({ onDragStart, onAddComponent }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredComponents = COMPONENTS.filter(comp => {
    const matchesSearch = comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Components
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="h-7 text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 gap-2">
          <AnimatePresence mode="popLayout">
            {filteredComponents.map((comp) => (
              <motion.div
                key={comp.type}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('componentType', comp.type);
                    e.dataTransfer.effectAllowed = 'copy';
                    onDragStart(comp.type);
                  }}
                  onClick={() => onAddComponent(comp.type)}
                  className="w-full p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                      {comp.icon}
                    </div>
                    <span className="text-xs font-medium text-center">{comp.label}</span>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredComponents.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No components found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
