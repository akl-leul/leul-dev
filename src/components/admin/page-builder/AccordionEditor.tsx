import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionContent {
  items: AccordionItem[];
  allowMultiple: boolean;
  defaultOpen?: string[];
  iconPosition?: 'left' | 'right';
}

interface AccordionEditorProps {
  content: AccordionContent;
  onChange: (content: AccordionContent) => void;
}

export function AccordionEditor({ content, onChange }: AccordionEditorProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const items = content.items || [];
  const allowMultiple = content.allowMultiple ?? false;
  const iconPosition = content.iconPosition || 'right';

  const addItem = () => {
    const newItem: AccordionItem = {
      id: `item-${Date.now()}`,
      title: 'New Accordion Item',
      content: 'Enter your content here...',
    };
    onChange({ ...content, items: [...items, newItem] });
    setExpandedItem(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<AccordionItem>) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({ ...content, items: newItems });
  };

  const removeItem = (id: string) => {
    onChange({ ...content, items: items.filter(item => item.id !== id) });
    if (expandedItem === id) setExpandedItem(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange({ ...content, items: newItems });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== id) {
      setDragOverItem(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    onChange({ ...content, items: newItems });
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Accordion Settings */}
      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Allow Multiple Open</Label>
          <Switch
            checked={allowMultiple}
            onCheckedChange={(checked) => onChange({ ...content, allowMultiple: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Icon Position</Label>
          <div className="flex gap-2">
            <Button
              variant={iconPosition === 'left' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => onChange({ ...content, iconPosition: 'left' })}
            >
              Left
            </Button>
            <Button
              variant={iconPosition === 'right' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => onChange({ ...content, iconPosition: 'right' })}
            >
              Right
            </Button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">FAQ Items ({items.length})</Label>
          <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Drag items to reorder, or use the arrow buttons
        </p>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`border rounded-lg bg-background transition-all ${
                draggedItem === item.id ? 'opacity-50' : ''
              } ${
                dragOverItem === item.id ? 'border-primary border-2' : ''
              }`}
            >
              <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${
                    expandedItem === item.id ? 'rotate-90' : ''
                  }`} 
                />
                
                <span className="flex-1 text-sm font-medium truncate">
                  {item.title || `Item ${index + 1}`}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                    disabled={index === items.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="p-3 border-t space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Question / Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      placeholder="Enter the question..."
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Answer / Content</Label>
                    <Textarea
                      value={item.content}
                      onChange={(e) => updateItem(item.id, { content: e.target.value })}
                      placeholder="Enter the answer..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              No FAQ items yet. Click "Add Item" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
