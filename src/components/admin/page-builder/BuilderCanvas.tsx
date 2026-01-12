import { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { PageSection, PageComponent, ComponentType } from './types';
import { ComponentRenderer } from './ComponentRenderer';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BuilderCanvasProps {
  sections: PageSection[];
  selectedId: string | null;
  selectedType: 'section' | 'component' | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  zoom: number;
  onSelectItem: (id: string, type: 'section' | 'component') => void;
  onAddSection: (index?: number) => void;
  onRemoveSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  onUpdateSection: (sectionId: string, updates: Partial<PageSection>) => void;
  onAddComponent: (sectionId: string, type: ComponentType, index?: number) => void;
  onRemoveComponent: (sectionId: string, componentId: string) => void;
  onDuplicateComponent: (sectionId: string, componentId: string) => void;
  onMoveComponent: (fromSectionId: string, toSectionId: string, fromIndex: number, toIndex: number) => void;
  onUpdateComponent: (sectionId: string, componentId: string, updates: Partial<PageComponent>) => void;
  onAddChildComponent?: (sectionId: string, parentId: string, type: ComponentType, index?: number) => void;
  onUpdateChildComponent?: (sectionId: string, parentId: string, childId: string, updates: Partial<PageComponent>) => void;
  onRemoveChildComponent?: (sectionId: string, parentId: string, childId: string) => void;
  onClearSelection: () => void;
}

export function BuilderCanvas({
  sections,
  selectedId,
  selectedType,
  viewMode,
  showGrid,
  zoom,
  onSelectItem,
  onAddSection,
  onRemoveSection,
  onDuplicateSection,
  onMoveSection,
  onUpdateSection,
  onAddComponent,
  onRemoveComponent,
  onDuplicateComponent,
  onMoveComponent,
  onUpdateComponent,
  onAddChildComponent,
  onUpdateChildComponent,
  onRemoveChildComponent,
  onClearSelection,
}: BuilderCanvasProps) {
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionId(sectionId);
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverSectionId(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (componentType) {
      onAddComponent(sectionId, componentType, index);
    }
    
    setDragOverSectionId(null);
    setDragOverIndex(null);
  };

  const getSectionStyles = (section: PageSection): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    
    if (section.styles.backgroundColor) styles.backgroundColor = section.styles.backgroundColor;
    if (section.styles.backgroundImage) styles.backgroundImage = `url(${section.styles.backgroundImage})`;
    if (section.styles.backgroundGradient) styles.background = section.styles.backgroundGradient;
    if (section.styles.padding) styles.padding = section.styles.padding;
    if (section.styles.margin) styles.margin = section.styles.margin;
    if (section.styles.minHeight) styles.minHeight = section.styles.minHeight;
    if (section.styles.maxWidth) styles.maxWidth = section.styles.maxWidth;
    
    return styles;
  };

  return (
    <div 
      className={cn(
        "flex-1 overflow-auto bg-muted/30 p-8",
        showGrid && "bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px]"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClearSelection();
        }
      }}
    >
      <div 
        className="mx-auto bg-background min-h-[600px] shadow-xl rounded-lg overflow-hidden transition-all duration-300"
        style={{ 
          width: getCanvasWidth(),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Add Section Button at Top */}
        <motion.div
          className="p-4 border-b border-dashed flex justify-center"
          whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAddSection(0)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </motion.div>

        {/* Sections */}
        <AnimatePresence>
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "relative group border-y transition-all",
                selectedId === section.id && selectedType === 'section' 
                  ? "ring-2 ring-primary ring-offset-2" 
                  : "border-transparent hover:border-primary/30"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(section.id, 'section');
              }}
            >
              {/* Section Header */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span className="text-xs font-medium text-muted-foreground">{section.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateSection(section.id, { collapsed: !section.collapsed });
                    }}
                  >
                    {section.collapsed ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronUp className="h-3 w-3" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDuplicateSection(section.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {sectionIndex > 0 && (
                        <DropdownMenuItem onClick={() => onMoveSection(sectionIndex, sectionIndex - 1)}>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Move Up
                        </DropdownMenuItem>
                      )}
                      {sectionIndex < sections.length - 1 && (
                        <DropdownMenuItem onClick={() => onMoveSection(sectionIndex, sectionIndex + 1)}>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Move Down
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onRemoveSection(section.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Section Content */}
              <AnimatePresence>
                {!section.collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={getSectionStyles(section)}
                    className="min-h-[100px]"
                  >
                    {/* Drop zone at top */}
                    <div
                      className={cn(
                        "h-4 transition-all",
                        dragOverSectionId === section.id && dragOverIndex === 0
                          ? "h-16 bg-primary/20 border-2 border-dashed border-primary rounded-lg my-2"
                          : ""
                      )}
                      onDragOver={(e) => handleDragOver(e, section.id, 0)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, section.id, 0)}
                    />

                    {/* Components */}
                    {section.components.map((component, componentIndex) => (
                      <div key={component.id}>
                        <motion.div
                          layout
                          className={cn(
                            "relative group/component transition-all cursor-pointer",
                            selectedId === component.id && selectedType === 'component'
                              ? "ring-2 ring-primary rounded-lg"
                              : "hover:ring-1 hover:ring-primary/50 rounded-lg"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(component.id, 'component');
                          }}
                        >
                          {/* Component Controls */}
                          <div className="absolute -top-3 right-2 flex items-center gap-1 opacity-0 group-hover/component:opacity-100 transition-opacity z-10">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 shadow"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateComponent(section.id, component.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 shadow"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveComponent(section.id, component.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Render Component */}
                          <ComponentRenderer
                            component={component}
                            isEditing={selectedId === component.id}
                            viewMode={viewMode}
                            onContentChange={(content) => 
                              onUpdateComponent(section.id, component.id, { content })
                            }
                            onAddChildComponent={onAddChildComponent ? (parentId, type, index) => 
                              onAddChildComponent(section.id, parentId, type, index)
                            : undefined}
                            onUpdateChildComponent={onUpdateChildComponent ? (parentId, childId, updates) =>
                              onUpdateChildComponent(section.id, parentId, childId, updates)
                            : undefined}
                            onRemoveChildComponent={onRemoveChildComponent ? (parentId, childId) =>
                              onRemoveChildComponent(section.id, parentId, childId)
                            : undefined}
                          />
                        </motion.div>

                        {/* Drop zone after component */}
                        <div
                          className={cn(
                            "h-4 transition-all",
                            dragOverSectionId === section.id && dragOverIndex === componentIndex + 1
                              ? "h-16 bg-primary/20 border-2 border-dashed border-primary rounded-lg my-2"
                              : ""
                          )}
                          onDragOver={(e) => handleDragOver(e, section.id, componentIndex + 1)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, section.id, componentIndex + 1)}
                        />
                      </div>
                    ))}

                    {/* Empty Section Placeholder */}
                    {section.components.length === 0 && (
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg m-4 transition-colors",
                          dragOverSectionId === section.id
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/30"
                        )}
                        onDragOver={(e) => handleDragOver(e, section.id, 0)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, section.id, 0)}
                      >
                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">Drag components here</p>
                        <p className="text-muted-foreground text-xs">or click a component from the library</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Section Button Between Sections */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                whileHover={{ scale: 1.1 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-lg bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSection(sectionIndex + 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Start Building</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first section to begin creating your page
            </p>
            <Button onClick={() => onAddSection()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
