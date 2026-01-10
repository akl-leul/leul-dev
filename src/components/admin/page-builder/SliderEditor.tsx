import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from './ImageUploader';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

interface SlideItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  link?: string;
}

interface SliderContent {
  slides: SlideItem[];
  autoplay: boolean;
  interval: number;
  transition: 'slide' | 'fade' | 'zoom';
  showDots: boolean;
  showArrows: boolean;
  pauseOnHover: boolean;
}

interface SliderEditorProps {
  content: SliderContent;
  onChange: (content: SliderContent) => void;
}

export function SliderEditor({ content, onChange }: SliderEditorProps) {
  const [expandedSlide, setExpandedSlide] = useState<string | null>(null);

  const slides = content.slides || [];
  const autoplay = content.autoplay ?? true;
  const interval = content.interval || 5000;
  const transition = content.transition || 'slide';
  const showDots = content.showDots ?? true;
  const showArrows = content.showArrows ?? true;
  const pauseOnHover = content.pauseOnHover ?? true;

  const addSlide = () => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      src: '',
      alt: '',
      caption: '',
      link: '',
    };
    onChange({ ...content, slides: [...slides, newSlide] });
    setExpandedSlide(newSlide.id);
  };

  const updateSlide = (id: string, updates: Partial<SlideItem>) => {
    const newSlides = slides.map(slide =>
      slide.id === id ? { ...slide, ...updates } : slide
    );
    onChange({ ...content, slides: newSlides });
  };

  const removeSlide = (id: string) => {
    onChange({ ...content, slides: slides.filter(slide => slide.id !== id) });
    if (expandedSlide === id) setExpandedSlide(null);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    onChange({ ...content, slides: newSlides });
  };

  return (
    <div className="space-y-4">
      {/* Slider Settings */}
      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Autoplay</Label>
          <Switch
            checked={autoplay}
            onCheckedChange={(checked) => onChange({ ...content, autoplay: checked })}
          />
        </div>

        {autoplay && (
          <div className="space-y-2">
            <Label className="text-xs">Interval (ms)</Label>
            <Input
              type="number"
              value={interval}
              onChange={(e) => onChange({ ...content, interval: parseInt(e.target.value) || 5000 })}
              min={1000}
              step={500}
              className="h-8"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Transition Effect</Label>
          <Select
            value={transition}
            onValueChange={(v) => onChange({ ...content, transition: v as SliderContent['transition'] })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Navigation Dots</Label>
          <Switch
            checked={showDots}
            onCheckedChange={(checked) => onChange({ ...content, showDots: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Arrows</Label>
          <Switch
            checked={showArrows}
            onCheckedChange={(checked) => onChange({ ...content, showArrows: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Pause on Hover</Label>
          <Switch
            checked={pauseOnHover}
            onCheckedChange={(checked) => onChange({ ...content, pauseOnHover: checked })}
          />
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Slides ({slides.length})</Label>
          <Button size="sm" variant="outline" onClick={addSlide} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Slide
          </Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="border rounded-lg bg-background"
            >
              <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedSlide(expandedSlide === slide.id ? null : slide.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                
                {slide.src ? (
                  <img src={slide.src} alt="" className="h-8 w-12 object-cover rounded" />
                ) : (
                  <div className="h-8 w-12 bg-muted rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                
                <span className="flex-1 text-sm truncate">
                  {slide.alt || `Slide ${index + 1}`}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }}
                    disabled={index === slides.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expandedSlide === slide.id && (
                <div className="p-3 border-t space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Image</Label>
                    <ImageUploader
                      value={slide.src}
                      onChange={(url) => updateSlide(slide.id, { src: url })}
                      onRemove={() => updateSlide(slide.id, { src: '' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                      value={slide.alt}
                      onChange={(e) => updateSlide(slide.id, { alt: e.target.value })}
                      placeholder="Describe the image..."
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Caption (optional)</Label>
                    <Input
                      value={slide.caption || ''}
                      onChange={(e) => updateSlide(slide.id, { caption: e.target.value })}
                      placeholder="Slide caption..."
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Link URL (optional)</Label>
                    <Input
                      value={slide.link || ''}
                      onChange={(e) => updateSlide(slide.id, { link: e.target.value })}
                      placeholder="https://..."
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {slides.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              No slides yet. Click "Add Slide" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
