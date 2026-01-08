import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageComponent, ComponentStyle } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import DOMPurify from 'dompurify';

interface ComponentRendererProps {
  component: PageComponent;
  isEditing: boolean;
  onContentChange?: (content: any) => void;
  viewMode: 'desktop' | 'tablet' | 'mobile';
}

export function ComponentRenderer({ 
  component, 
  isEditing, 
  onContentChange,
  viewMode 
}: ComponentRendererProps) {
  const [sliderIndex, setSliderIndex] = useState(0);

  const getResponsiveStyles = (): React.CSSProperties => {
    let styles = { ...component.styles } as any;
    
    if (component.responsiveStyles) {
      if (viewMode === 'tablet' && component.responsiveStyles.tablet) {
        styles = { ...styles, ...component.responsiveStyles.tablet };
      } else if (viewMode === 'mobile' && component.responsiveStyles.mobile) {
        styles = { ...styles, ...component.responsiveStyles.mobile };
      }
    }

    // Convert custom props to CSS
    const cssStyles: React.CSSProperties = {};
    
    if (styles.backgroundColor) cssStyles.backgroundColor = styles.backgroundColor;
    if (styles.backgroundImage) cssStyles.backgroundImage = `url(${styles.backgroundImage})`;
    if (styles.backgroundGradient) cssStyles.background = styles.backgroundGradient;
    if (styles.textColor) cssStyles.color = styles.textColor;
    if (styles.fontSize) cssStyles.fontSize = styles.fontSize;
    if (styles.fontWeight) cssStyles.fontWeight = styles.fontWeight;
    if (styles.fontFamily) cssStyles.fontFamily = styles.fontFamily;
    if (styles.textAlign) cssStyles.textAlign = styles.textAlign;
    if (styles.padding) cssStyles.padding = styles.padding;
    if (styles.margin) cssStyles.margin = styles.margin;
    if (styles.borderRadius) cssStyles.borderRadius = styles.borderRadius;
    if (styles.borderWidth) cssStyles.borderWidth = styles.borderWidth;
    if (styles.borderColor) cssStyles.borderColor = styles.borderColor;
    if (styles.borderStyle) cssStyles.borderStyle = styles.borderStyle;
    if (styles.boxShadow) cssStyles.boxShadow = styles.boxShadow;
    if (styles.width) cssStyles.width = styles.width;
    if (styles.height) cssStyles.height = styles.height;
    if (styles.minHeight) cssStyles.minHeight = styles.minHeight;
    if (styles.maxWidth) cssStyles.maxWidth = styles.maxWidth;
    if (styles.opacity !== undefined) cssStyles.opacity = styles.opacity;

    return cssStyles;
  };

  const handleTextChange = (text: string) => {
    onContentChange?.({ ...component.content, text });
  };

  switch (component.type) {
    case 'heading': {
      const Tag = component.content.level || 'h2';
      const baseStyles = getResponsiveStyles();
      
      if (isEditing) {
        return (
          <input
            type="text"
            value={component.content.text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-2"
            style={baseStyles}
          />
        );
      }
      
      return (
        <Tag style={baseStyles}>{component.content.text}</Tag>
      );
    }

    case 'text': {
      if (isEditing) {
        return (
          <Textarea
            value={component.content.text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full min-h-[100px] bg-transparent border-dashed resize-none"
            style={getResponsiveStyles()}
          />
        );
      }
      
      return (
        <p style={getResponsiveStyles()}>{component.content.text}</p>
      );
    }

    case 'image': {
      const styles = getResponsiveStyles();
      return (
        <div style={styles}>
          {component.content.src ? (
            <img
              src={component.content.src}
              alt={component.content.alt || ''}
              className="w-full h-auto object-cover"
              style={{ borderRadius: styles.borderRadius }}
            />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg border-2 border-dashed">
              <span className="text-muted-foreground">Click to add image</span>
            </div>
          )}
        </div>
      );
    }

    case 'gallery': {
      const { images = [], columns = 3, gap = '16px' } = component.content;
      return (
        <div 
          className="grid"
          style={{ 
            ...getResponsiveStyles(),
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
          }}
        >
          {images.length > 0 ? (
            images.map((img: { src: string; alt: string }, idx: number) => (
              <img
                key={idx}
                src={img.src}
                alt={img.alt || ''}
                className="w-full h-auto object-cover rounded-lg"
              />
            ))
          ) : (
            Array.from({ length: columns }).map((_, idx) => (
              <div 
                key={idx}
                className="aspect-square bg-muted flex items-center justify-center rounded-lg border-2 border-dashed"
              >
                <span className="text-muted-foreground text-sm">Image {idx + 1}</span>
              </div>
            ))
          )}
        </div>
      );
    }

    case 'button': {
      const { text, link, variant = 'primary' } = component.content;
      return (
        <div style={{ textAlign: component.styles.textAlign || 'left' }}>
          <Button
            variant={variant === 'primary' ? 'default' : variant === 'secondary' ? 'secondary' : 'outline'}
            style={getResponsiveStyles()}
            onClick={() => !isEditing && link && window.open(link, '_blank')}
          >
            {isEditing ? (
              <input
                type="text"
                value={text}
                onChange={(e) => onContentChange?.({ ...component.content, text: e.target.value })}
                className="bg-transparent border-none outline-none text-center w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              text
            )}
          </Button>
        </div>
      );
    }

    case 'video': {
      const { url, type } = component.content;
      
      if (!url) {
        return (
          <div 
            className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg border-2 border-dashed"
            style={getResponsiveStyles()}
          >
            <span className="text-muted-foreground">Add video URL</span>
          </div>
        );
      }

      // Extract video ID for YouTube
      const getYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
      };

      if (type === 'youtube' || url.includes('youtube') || url.includes('youtu.be')) {
        const videoId = getYouTubeId(url);
        return (
          <div className="w-full aspect-video" style={getResponsiveStyles()}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }

      return (
        <video 
          src={url} 
          controls 
          className="w-full rounded-lg"
          style={getResponsiveStyles()}
        />
      );
    }

    case 'form': {
      const { fields = [], submitText = 'Submit' } = component.content;
      return (
        <form 
          className="space-y-4"
          style={getResponsiveStyles()}
          onSubmit={(e) => e.preventDefault()}
        >
          {fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <Textarea placeholder={field.label} disabled={!isEditing} />
              ) : (
                <Input type={field.type} placeholder={field.label} disabled={!isEditing} />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">{submitText}</Button>
        </form>
      );
    }

    case 'slider': {
      const { slides = [] } = component.content;
      
      if (slides.length === 0) {
        return (
          <div 
            className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg border-2 border-dashed"
            style={getResponsiveStyles()}
          >
            <span className="text-muted-foreground">Add slider images</span>
          </div>
        );
      }

      return (
        <div className="relative w-full" style={getResponsiveStyles()}>
          <div className="overflow-hidden rounded-lg">
            <motion.div
              className="flex"
              animate={{ x: `-${sliderIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {slides.map((slide: { src: string; alt: string }, idx: number) => (
                <img
                  key={idx}
                  src={slide.src}
                  alt={slide.alt || ''}
                  className="w-full h-auto flex-shrink-0"
                />
              ))}
            </motion.div>
          </div>
          <button
            onClick={() => setSliderIndex(prev => Math.max(0, prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background"
            disabled={sliderIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSliderIndex(prev => Math.min(slides.length - 1, prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background"
            disabled={sliderIndex === slides.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSliderIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === sliderIndex ? 'bg-primary' : 'bg-background/50'
                }`}
              />
            ))}
          </div>
        </div>
      );
    }

    case 'accordion': {
      const { items = [], allowMultiple } = component.content;
      return (
        <Accordion 
          type={allowMultiple ? 'multiple' : 'single'} 
          collapsible
          style={getResponsiveStyles()}
        >
          {items.map((item: { id: string; title: string; content: string }) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    case 'html': {
      const { code = '' } = component.content;
      if (isEditing) {
        return (
          <Textarea
            value={code}
            onChange={(e) => onContentChange?.({ ...component.content, code: e.target.value })}
            className="w-full min-h-[200px] font-mono text-sm"
            placeholder="Enter custom HTML..."
          />
        );
      }
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(code) }}
          style={getResponsiveStyles()}
        />
      );
    }

    case 'divider': {
      const { style = 'solid', color = 'hsl(220 13% 91%)' } = component.content;
      return (
        <hr 
          style={{ 
            ...getResponsiveStyles(),
            borderStyle: style,
            borderColor: color,
            borderWidth: '0 0 1px 0',
          }} 
        />
      );
    }

    case 'spacer': {
      const { height = '48px' } = component.content;
      return <div style={{ ...getResponsiveStyles(), height }} />;
    }

    case 'icon': {
      const { name, size = 24, color = 'currentColor' } = component.content;
      return (
        <div style={getResponsiveStyles()}>
          <span 
            className="inline-flex items-center justify-center"
            style={{ width: size, height: size, color }}
          >
            ★
          </span>
        </div>
      );
    }

    case 'columns': {
      const { columns = 2, gap = '24px' } = component.content;
      return (
        <div 
          className="grid"
          style={{ 
            ...getResponsiveStyles(),
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
          }}
        >
          {component.children?.map((child, idx) => (
            <ComponentRenderer
              key={child.id || idx}
              component={child}
              isEditing={isEditing}
              onContentChange={(content) => {
                const newChildren = [...(component.children || [])];
                newChildren[idx] = { ...newChildren[idx], content };
                onContentChange?.({ ...component.content, children: newChildren });
              }}
              viewMode={viewMode}
            />
          ))}
          {(!component.children || component.children.length < columns) && (
            Array.from({ length: columns - (component.children?.length || 0) }).map((_, idx) => (
              <div 
                key={`empty-${idx}`}
                className="min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground"
              >
                Drop component here
              </div>
            ))
          )}
        </div>
      );
    }

    case 'container': {
      return (
        <div style={getResponsiveStyles()}>
          {component.children?.map((child, idx) => (
            <ComponentRenderer
              key={child.id || idx}
              component={child}
              isEditing={isEditing}
              onContentChange={(content) => {
                const newChildren = [...(component.children || [])];
                newChildren[idx] = { ...newChildren[idx], content };
                onContentChange?.({ ...component.content, children: newChildren });
              }}
              viewMode={viewMode}
            />
          ))}
          {(!component.children || component.children.length === 0) && (
            <div className="min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              Drop components here
            </div>
          )}
        </div>
      );
    }

    default:
      return <div>Unknown component type: {component.type}</div>;
  }
}
