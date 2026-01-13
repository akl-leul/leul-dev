import { useState } from 'react';
import { ComponentStyle, PageComponent, PageSection } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Sparkles,
  Image,
  Palette,
  Box,
  Layers,
  Type,
  Trash2,
  Copy,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader, GalleryUploader } from './ImageUploader';
import { IconPicker, IconByName } from './IconPicker';
import { SliderEditor } from './SliderEditor';
import { AccordionEditor } from './AccordionEditor';
import { FormEditor } from './FormEditor';

interface StyleEditorProps {
  selectedItem: PageComponent | PageSection | null;
  selectedType: 'component' | 'section' | null;
  onStyleChange: (styles: Partial<ComponentStyle>) => void;
  onContentChange?: (content: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const FONT_FAMILIES = [
  { value: 'inherit', label: 'Default' },
  { value: '"Inter", sans-serif', label: 'Inter' },
  { value: '"Dancing Script", cursive', label: 'Dancing Script' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
];

const HEADING_LEVELS = [
  { value: 'h1', label: 'H1 - Main Title' },
  { value: 'h2', label: 'H2 - Section Title' },
  { value: 'h3', label: 'H3 - Subsection' },
  { value: 'h4', label: 'H4 - Minor Heading' },
  { value: 'h5', label: 'H5 - Small Heading' },
  { value: 'h6', label: 'H6 - Tiny Heading' },
];

const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function StyleEditor({
  selectedItem,
  selectedType,
  onStyleChange,
  onContentChange,
  onDelete,
  onDuplicate,
}: StyleEditorProps) {
  const { toast } = useToast();

  if (!selectedItem) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No Selection</p>
        <p className="text-sm mt-1">Select a section or component to edit its properties</p>
      </div>
    );
  }

  const styles = selectedItem.styles || {};
  const content = 'content' in selectedItem ? selectedItem.content : null;
  const componentType = 'type' in selectedItem ? selectedItem.type : null;
  return (
    <ScrollArea className="h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">
            {selectedType === 'section' ? 'Section' : componentType}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {selectedType === 'section' && 'name' in selectedItem && (
          <Input
            value={selectedItem.name}
            onChange={(e) => onContentChange?.({ name: e.target.value })}
            placeholder="Section name"
            className="h-8"
          />
        )}
      </div>

      {/* Content Settings - Component Specific */}
      {content && componentType && (
        <CollapsibleSection title="Content" icon={Type} defaultOpen>
          {componentType === 'heading' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Heading Level</Label>
                <Select
                  value={content.level || 'h2'}
                  onValueChange={(v) => onContentChange?.({ ...content, level: v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADING_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Text</Label>
                <Input
                  value={content.text || ''}
                  onChange={(e) => onContentChange?.({ ...content, text: e.target.value })}
                  className="h-8"
                />
              </div>
            </>
          )
          }

          {
            componentType === 'text' && (
              <div className="space-y-2">
                <Label className="text-xs">Text Content</Label>
                <textarea
                  value={content.text || ''}
                  onChange={(e) => onContentChange?.({ ...content, text: e.target.value })}
                  className="w-full min-h-[100px] p-2 text-sm border rounded-md"
                />
              </div>
            )
          }

          {
            componentType === 'button' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={content.text || ''}
                    onChange={(e) => onContentChange?.({ ...content, text: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Link URL</Label>
                  <Input
                    value={content.link || ''}
                    onChange={(e) => onContentChange?.({ ...content, link: e.target.value })}
                    className="h-8"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Variant</Label>
                  <Select
                    value={content.variant || 'primary'}
                    onValueChange={(v) => onContentChange?.({ ...content, variant: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )
          }

          {
            componentType === 'image' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Image</Label>
                  <ImageUploader
                    value={content.src}
                    onChange={(url) => onContentChange?.({ ...content, src: url })}
                    onRemove={() => onContentChange?.({ ...content, src: '' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Alt Text (SEO)</Label>
                  <Input
                    value={content.alt || ''}
                    onChange={(e) => onContentChange?.({ ...content, alt: e.target.value })}
                    className="h-8"
                    placeholder="Describe the image..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Link URL (optional)</Label>
                  <Input
                    value={content.link || ''}
                    onChange={(e) => onContentChange?.({ ...content, link: e.target.value })}
                    className="h-8"
                    placeholder="https://..."
                  />
                </div>
              </>
            )
          }

          {
            componentType === 'gallery' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Gallery Images</Label>
                  <GalleryUploader
                    images={content.images || []}
                    onChange={(images) => onContentChange?.({ ...content, images })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Columns</Label>
                  <Select
                    value={String(content.columns || 3)}
                    onValueChange={(v) => onContentChange?.({ ...content, columns: parseInt(v) })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Gap</Label>
                  <Input
                    value={content.gap || '16px'}
                    onChange={(e) => onContentChange?.({ ...content, gap: e.target.value })}
                    className="h-8"
                    placeholder="e.g., 16px, 1rem"
                  />
                </div>
              </>
            )
          }

          {
            componentType === 'icon' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Icon</Label>
                  <IconPicker
                    value={content.name}
                    onChange={(name) => onContentChange?.({ ...content, name })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Size</Label>
                    <Input
                      type="number"
                      value={content.size || 24}
                      onChange={(e) => onContentChange?.({ ...content, size: parseInt(e.target.value) })}
                      className="h-8"
                      min={12}
                      max={128}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={content.color || '#000000'}
                      onChange={(e) => onContentChange?.({ ...content, color: e.target.value })}
                      className="h-8 p-1"
                    />
                  </div>
                </div>
              </>
            )
          }

          {
            componentType === 'video' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Video URL</Label>
                  <Input
                    value={content.url || ''}
                    onChange={(e) => onContentChange?.({ ...content, url: e.target.value })}
                    className="h-8"
                    placeholder="YouTube or Vimeo URL..."
                  />
                </div>
              </>
            )
          }

          {
            componentType === 'slider' && (
              <SliderEditor
                content={content}
                onChange={(newContent) => onContentChange?.(newContent)}
              />
            )
          }

          {
            componentType === 'accordion' && (
              <AccordionEditor
                content={content}
                onChange={(newContent) => onContentChange?.(newContent)}
              />
            )
          }

          {
            componentType === 'form' && (
              <FormEditor
                content={content}
                onChange={(newContent) => onContentChange?.(newContent)}
              />
            )
          }

          {
            componentType === 'spacer' && (
              <div className="space-y-2">
                <Label className="text-xs">Height</Label>
                <Input
                  value={content.height || '48px'}
                  onChange={(e) => onContentChange?.({ ...content, height: e.target.value })}
                  className="h-8"
                  placeholder="e.g., 48px, 2rem"
                />
              </div>
            )
          }

          {
            componentType === 'divider' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Style</Label>
                  <Select
                    value={content.style || 'solid'}
                    onValueChange={(v) => onContentChange?.({ ...content, style: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={content.color || '#e5e7eb'}
                    onChange={(e) => onContentChange?.({ ...content, color: e.target.value })}
                    className="h-8 p-1"
                  />
                </div>
              </>
            )
          }

          {
            componentType === 'columns' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Number of Columns</Label>
                  <Select
                    value={String(content.columns || 2)}
                    onValueChange={(v) => onContentChange?.({ ...content, columns: parseInt(v) })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Gap</Label>
                  <Input
                    value={content.gap || '24px'}
                    onChange={(e) => onContentChange?.({ ...content, gap: e.target.value })}
                    className="h-8"
                  />
                </div>
              </>
            )
          }
        </CollapsibleSection >
      )
      }

      {/* Typography */}
      <CollapsibleSection title="Typography" icon={Type}>
        <div className="space-y-2">
          <Label className="text-xs">Font Family</Label>
          <Select
            value={styles.fontFamily || 'inherit'}
            onValueChange={(v) => onStyleChange({ fontFamily: v })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map(font => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <Input
              value={styles.fontSize || ''}
              onChange={(e) => onStyleChange({ fontSize: e.target.value })}
              placeholder="16px"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={styles.fontWeight || '400'}
              onValueChange={(v) => onStyleChange({ fontWeight: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map(weight => (
                  <SelectItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Text Align</Label>
          <div className="flex gap-1">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
              { value: 'justify', icon: AlignJustify },
            ].map(({ value, icon: Icon }) => (
              <Button
                key={value}
                variant={styles.textAlign === value ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onStyleChange({ textAlign: value as any })}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={styles.textColor || '#000000'}
              onChange={(e) => onStyleChange({ textColor: e.target.value })}
              className="h-8 w-12 p-1"
            />
            <Input
              value={styles.textColor || ''}
              onChange={(e) => onStyleChange({ textColor: e.target.value })}
              placeholder="inherit"
              className="h-8 flex-1"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Background */}
      <CollapsibleSection title="Background" icon={Palette}>
        <div className="space-y-2">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={styles.backgroundColor?.startsWith('#') ? styles.backgroundColor : '#ffffff'}
              onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
              className="h-8 w-12 p-1"
            />
            <Input
              value={styles.backgroundColor || ''}
              onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
              placeholder="transparent"
              className="h-8 flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Background Gradient</Label>
          <Input
            value={styles.backgroundGradient || ''}
            onChange={(e) => onStyleChange({ backgroundGradient: e.target.value })}
            placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Background Image</Label>
          <ImageUploader
            value={styles.backgroundImage}
            onChange={(url) => onStyleChange({ backgroundImage: url })}
            onRemove={() => onStyleChange({ backgroundImage: undefined })}
          />
        </div>
      </CollapsibleSection>

      {/* Spacing */}
      <CollapsibleSection title="Spacing" icon={Box}>
        <div className="space-y-2">
          <Label className="text-xs">Padding</Label>
          <Input
            value={styles.padding || ''}
            onChange={(e) => onStyleChange({ padding: e.target.value })}
            placeholder="16px"
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Margin</Label>
          <Input
            value={styles.margin || ''}
            onChange={(e) => onStyleChange({ margin: e.target.value })}
            placeholder="0"
            className="h-8"
          />
        </div>
      </CollapsibleSection>

      {/* Border & Shadow */}
      <CollapsibleSection title="Border & Shadow" icon={Layers}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Border Width</Label>
            <Input
              value={styles.borderWidth || ''}
              onChange={(e) => onStyleChange({ borderWidth: e.target.value })}
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Border Radius</Label>
            <Input
              value={styles.borderRadius || ''}
              onChange={(e) => onStyleChange({ borderRadius: e.target.value })}
              placeholder="8px"
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Border Color</Label>
            <Input
              type="color"
              value={styles.borderColor || '#e5e7eb'}
              onChange={(e) => onStyleChange({ borderColor: e.target.value })}
              className="h-8 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Border Style</Label>
            <Select
              value={styles.borderStyle || 'solid'}
              onValueChange={(v) => onStyleChange({ borderStyle: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Box Shadow</Label>
          <Input
            value={styles.boxShadow || ''}
            onChange={(e) => onStyleChange({ boxShadow: e.target.value })}
            placeholder="0 4px 6px rgba(0,0,0,0.1)"
            className="h-8"
          />
        </div>
      </CollapsibleSection>

      {/* Size */}
      <CollapsibleSection title="Size" icon={Box}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Input
              value={styles.width || ''}
              onChange={(e) => onStyleChange({ width: e.target.value })}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Height</Label>
            <Input
              value={styles.height || ''}
              onChange={(e) => onStyleChange({ height: e.target.value })}
              placeholder="auto"
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Min Height</Label>
            <Input
              value={styles.minHeight || ''}
              onChange={(e) => onStyleChange({ minHeight: e.target.value })}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Width</Label>
            <Input
              value={styles.maxWidth || ''}
              onChange={(e) => onStyleChange({ maxWidth: e.target.value })}
              placeholder="none"
              className="h-8"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Effects */}
      <CollapsibleSection title="Effects" icon={Layers}>
        <div className="space-y-2">
          <Label className="text-xs">Opacity ({Math.round((styles.opacity ?? 1) * 100)}%)</Label>
          <Slider
            value={[styles.opacity ?? 1]}
            onValueChange={([v]) => onStyleChange({ opacity: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
      </CollapsibleSection>

      {/* Animations */}
      <CollapsibleSection title="Animations" icon={Sparkles}>
        <div className="space-y-2">
          <Label className="text-xs">Entrance Animation</Label>
          <Select
            value={styles.entranceAnimation || 'none'}
            onValueChange={(v) => onStyleChange({ entranceAnimation: v as ComponentStyle['entranceAnimation'] })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade-in">Fade In</SelectItem>
              <SelectItem value="slide-up">Slide Up</SelectItem>
              <SelectItem value="slide-down">Slide Down</SelectItem>
              <SelectItem value="slide-left">Slide from Left</SelectItem>
              <SelectItem value="slide-right">Slide from Right</SelectItem>
              <SelectItem value="scale-in">Scale In</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Hover Effect</Label>
          <Select
            value={styles.hoverEffect || 'none'}
            onValueChange={(v) => onStyleChange({ hoverEffect: v as ComponentStyle['hoverEffect'] })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="scale">Scale Up</SelectItem>
              <SelectItem value="lift">Lift (Shadow)</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Animation Duration</Label>
            <Select
              value={styles.animationDuration || '0.3s'}
              onValueChange={(v) => onStyleChange({ animationDuration: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.2s">Fast (0.2s)</SelectItem>
                <SelectItem value="0.3s">Normal (0.3s)</SelectItem>
                <SelectItem value="0.5s">Slow (0.5s)</SelectItem>
                <SelectItem value="0.8s">Very Slow (0.8s)</SelectItem>
                <SelectItem value="1s">1 second</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Delay</Label>
            <Select
              value={styles.animationDelay || '0s'}
              onValueChange={(v) => onStyleChange({ animationDelay: v })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0s">None</SelectItem>
                <SelectItem value="0.1s">0.1s</SelectItem>
                <SelectItem value="0.2s">0.2s</SelectItem>
                <SelectItem value="0.3s">0.3s</SelectItem>
                <SelectItem value="0.5s">0.5s</SelectItem>
                <SelectItem value="1s">1s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Transition</Label>
          <Input
            value={styles.transition || ''}
            onChange={(e) => onStyleChange({ transition: e.target.value })}
            placeholder="all 0.3s ease"
            className="h-8"
          />
        </div>
      </CollapsibleSection>
    </ScrollArea>
  );
}
