import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePageBuilder } from './usePageBuilder';
import { ComponentLibrary } from './ComponentLibrary';
import { BuilderCanvas } from './BuilderCanvas';
import { StyleEditor } from './StyleEditor';
import { TemplateManager, VersionHistory } from './TemplateManager';
import { PageSection, ComponentType } from './types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Grid3X3,
  LayoutTemplate,
  Clock,
  ZoomIn,
  ZoomOut,
  Eye,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface PageBuilderProps {
  initialContent?: PageSection[];
  pageId?: string;
  onSave: (sections: PageSection[]) => void;
  onPreview?: () => void;
  onBack: () => void;
}

export function PageBuilder({
  initialContent = [],
  pageId,
  onSave,
  onPreview,
  onBack,
}: PageBuilderProps) {
  const builder = usePageBuilder(initialContent);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);

  // Get selected item
  const getSelectedItem = useCallback(() => {
    if (!builder.selectedId) return null;
    
    if (builder.selectedType === 'section') {
      return builder.sections.find(s => s.id === builder.selectedId) || null;
    }
    
    const result = builder.findComponent(builder.selectedId);
    return result?.component || null;
  }, [builder.selectedId, builder.selectedType, builder.sections, builder.findComponent]);

  // Get section ID for selected component
  const getSelectedSectionId = useCallback(() => {
    if (builder.selectedType === 'section') return builder.selectedId;
    if (!builder.selectedId) return null;
    
    const result = builder.findComponent(builder.selectedId);
    return result?.section.id || null;
  }, [builder.selectedId, builder.selectedType, builder.findComponent]);

  const handleAddComponentFromLibrary = (componentType: ComponentType) => {
    // Add to first section or create one
    if (builder.sections.length === 0) {
      const sectionId = builder.addSection();
      setTimeout(() => builder.addComponent(sectionId, componentType), 0);
    } else {
      const targetSection = builder.selectedType === 'section' && builder.selectedId
        ? builder.selectedId
        : builder.sections[builder.sections.length - 1].id;
      builder.addComponent(targetSection, componentType);
    }
  };

  const handleStyleChange = (styles: any) => {
    if (!builder.selectedId) return;
    
    if (builder.selectedType === 'section') {
      builder.updateSection(builder.selectedId, { styles: { ...getSelectedItem()?.styles, ...styles } });
    } else {
      const sectionId = getSelectedSectionId();
      if (sectionId) {
        builder.updateComponentStyle(sectionId, builder.selectedId, styles);
      }
    }
  };

  const handleContentChange = (content: any) => {
    if (!builder.selectedId) return;
    
    if (builder.selectedType === 'section') {
      builder.updateSection(builder.selectedId, content);
    } else {
      const sectionId = getSelectedSectionId();
      if (sectionId) {
        builder.updateComponent(sectionId, builder.selectedId, { content });
      }
    }
  };

  const handleDelete = () => {
    if (!builder.selectedId) return;
    
    if (builder.selectedType === 'section') {
      builder.removeSection(builder.selectedId);
    } else {
      const sectionId = getSelectedSectionId();
      if (sectionId) {
        builder.removeComponent(sectionId, builder.selectedId);
      }
    }
  };

  const handleDuplicate = () => {
    if (!builder.selectedId) return;
    
    if (builder.selectedType === 'section') {
      builder.duplicateSection(builder.selectedId);
    } else {
      const sectionId = getSelectedSectionId();
      if (sectionId) {
        builder.duplicateComponent(sectionId, builder.selectedId);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        builder.undo();
      } else if ((e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) || 
                 (e.key === 'y' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        builder.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (builder.selectedId && document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          handleDelete();
        }
      } else if (e.key === 'Escape') {
        builder.clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [builder.selectedId, builder.undo, builder.redo]);

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={builder.undo} disabled={!builder.canUndo}>
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={builder.redo} disabled={!builder.canRedo}>
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={builder.viewMode} onValueChange={(v) => builder.setViewMode(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="desktop" className="px-3">
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="tablet" className="px-3">
                  <Tablet className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="mobile" className="px-3">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[builder.zoom]}
                onValueChange={([v]) => builder.setZoom(v)}
                min={50}
                max={150}
                step={10}
                className="w-24"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-8">{builder.zoom}%</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={builder.showGrid ? 'secondary' : 'ghost'} size="icon" onClick={() => builder.setShowGrid(!builder.showGrid)}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowTemplates(true)}>
                  <LayoutTemplate className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Templates</TooltipContent>
            </Tooltip>
            {pageId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}>
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Version History</TooltipContent>
              </Tooltip>
            )}
            <Separator orientation="vertical" className="h-6" />
            {onPreview && (
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            <Button size="sm" onClick={() => onSave(builder.sections)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Components */}
          <div className="w-64 border-r bg-card shrink-0 overflow-hidden">
            <ComponentLibrary
              onDragStart={setDraggingType}
              onAddComponent={handleAddComponentFromLibrary}
            />
          </div>

          {/* Canvas */}
          <BuilderCanvas
            sections={builder.sections}
            selectedId={builder.selectedId}
            selectedType={builder.selectedType}
            viewMode={builder.viewMode}
            showGrid={builder.showGrid}
            zoom={builder.zoom}
            onSelectItem={builder.selectItem}
            onAddSection={builder.addSection}
            onRemoveSection={builder.removeSection}
            onDuplicateSection={builder.duplicateSection}
            onMoveSection={builder.moveSection}
            onUpdateSection={builder.updateSection}
            onAddComponent={builder.addComponent}
            onRemoveComponent={builder.removeComponent}
            onDuplicateComponent={builder.duplicateComponent}
            onMoveComponent={builder.moveComponent}
            onUpdateComponent={builder.updateComponent}
            onClearSelection={builder.clearSelection}
          />

          {/* Right Panel - Style Editor */}
          <div className="w-80 border-l bg-card shrink-0 overflow-hidden">
            <StyleEditor
              selectedItem={getSelectedItem()}
              selectedType={builder.selectedType}
              onStyleChange={handleStyleChange}
              onContentChange={handleContentChange}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
        </div>

        {/* Template Manager */}
        <TemplateManager
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onLoadTemplate={builder.loadSections}
          currentSections={builder.sections}
        />

        {/* Version History */}
        {pageId && (
          <VersionHistory
            pageId={pageId}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            onRestore={builder.loadSections}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export { PageSection } from './types';
