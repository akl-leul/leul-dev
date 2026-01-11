import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageComponent, ComponentStyle } from './types';
import { IconByName } from './IconPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Play, Pause, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);

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
      const {
        fields = [],
        submitText = 'Submit',
        submitAction = 'supabase',
        recipientEmail,
        webhookUrl,
        successMessage = 'Thank you! Your submission has been received.',
        showLabels = true,
        formId = 'form',
        formName = 'Form',
        isProgressive = false,
        stepsConfig = [{ name: 'Step 1' }],
      } = component.content;

      const [currentStep, setCurrentStep] = useState(1);
      const totalSteps = isProgressive ? stepsConfig.length : 1;

      const validateField = (field: any, value: any): string | null => {
        if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
          return `${field.label} is required`;
        }

        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
        }

        if (field.validation) {
          if (field.validation.minLength && value && value.length < field.validation.minLength) {
            return `Minimum ${field.validation.minLength} characters required`;
          }
          if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
            return `Maximum ${field.validation.maxLength} characters allowed`;
          }
          if (field.validation.min !== undefined && parseFloat(value) < field.validation.min) {
            return `Minimum value is ${field.validation.min}`;
          }
          if (field.validation.max !== undefined && parseFloat(value) > field.validation.max) {
            return `Maximum value is ${field.validation.max}`;
          }
        }

        return null;
      };

      const getCurrentStepFields = () => {
        if (!isProgressive) return fields;
        return fields.filter((f: any) => (f.step || 1) === currentStep);
      };

      const validateCurrentStep = () => {
        const stepFields = getCurrentStepFields();
        const errors: Record<string, string> = {};
        stepFields.forEach((field: any) => {
          const error = validateField(field, formData[field.id]);
          if (error) errors[field.id] = error;
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
      };

      const handleNext = () => {
        if (validateCurrentStep() && currentStep < totalSteps) {
          setCurrentStep(prev => prev + 1);
        }
      };

      const handlePrev = () => {
        if (currentStep > 1) {
          setCurrentStep(prev => prev - 1);
        }
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) return;

        // Validate all fields
        const errors: Record<string, string> = {};
        fields.forEach((field: any) => {
          const error = validateField(field, formData[field.id]);
          if (error) errors[field.id] = error;
        });

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          if (isProgressive) {
            // Find which step has the first error
            const errorFieldIds = Object.keys(errors);
            const firstErrorField = fields.find((f: any) => errorFieldIds.includes(f.id));
            if (firstErrorField) {
              setCurrentStep(firstErrorField.step || 1);
            }
          }
          return;
        }

        setFormErrors({});

        try {
          // Prepare data for submission - use labels instead of IDs for better readability
          const submissionData: Record<string, any> = {};
          fields.forEach((field: any) => {
            const value = formData[field.id];
            if (value !== undefined) {
              const label = field.label || field.id;
              submissionData[label] = value;
            }
          });

          // Save to Supabase form_submissions table
          if (submitAction === 'supabase') {
            const { supabase } = await import('@/integrations/supabase/client');
            const { error } = await supabase.from('form_submissions').insert({
              form_id: formId,
              form_name: formName,
              data: submissionData,
              status: 'new',
            });
            if (error) throw error;
          } else if (submitAction === 'webhook' && webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ formId, formName, data: submissionData }),
            });
          }

          setFormSubmitted(true);
          toast({
            title: 'Success!',
            description: successMessage,
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to submit form. Please try again.',
            variant: 'destructive',
          });
        }
      };

      if (formSubmitted && !isEditing) {
        return (
          <div
            className="text-center p-8 border rounded-lg bg-muted/30"
            style={getResponsiveStyles()}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium">{successMessage}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFormSubmitted(false);
                setFormData({});
              }}
            >
              Submit Another Response
            </Button>
          </div>
        );
      }

      const renderField = (field: any) => {
        const error = formErrors[field.id];
        const fieldWidth = field.width === 'half' ? 'w-1/2' : 'w-full';

        switch (field.type) {
          case 'textarea':
            return (
              <div key={field.id} className={`space-y-2 ${fieldWidth}`}>
                {showLabels && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                <Textarea
                  placeholder={field.placeholder || field.label}
                  value={formData[field.id] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  disabled={isEditing}
                  className={error ? 'border-destructive' : ''}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );

          case 'select':
            return (
              <div key={field.id} className={`space-y-2 ${fieldWidth}`}>
                {showLabels && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                <Select
                  value={formData[field.id] || ''}
                  onValueChange={(v) => setFormData({ ...formData, [field.id]: v })}
                  disabled={isEditing}
                >
                  <SelectTrigger className={error ? 'border-destructive' : ''}>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );

          case 'checkbox':
            return (
              <div key={field.id} className={`space-y-2 ${fieldWidth}`}>
                {showLabels && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                <div className="space-y-2">
                  {(field.options || []).map((opt: string) => (
                    <div key={opt} className="flex items-center gap-2">
                      <Checkbox
                        id={`${field.id}-${opt}`}
                        checked={(formData[field.id] || []).includes(opt)}
                        onCheckedChange={(checked) => {
                          const current = formData[field.id] || [];
                          setFormData({
                            ...formData,
                            [field.id]: checked
                              ? [...current, opt]
                              : current.filter((v: string) => v !== opt),
                          });
                        }}
                        disabled={isEditing}
                      />
                      <Label htmlFor={`${field.id}-${opt}`} className="font-normal">{opt}</Label>
                    </div>
                  ))}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );

          case 'radio':
            return (
              <div key={field.id} className={`space-y-2 ${fieldWidth}`}>
                {showLabels && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                <RadioGroup
                  value={formData[field.id] || ''}
                  onValueChange={(v) => setFormData({ ...formData, [field.id]: v })}
                  disabled={isEditing}
                >
                  {(field.options || []).map((opt: string) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                      <Label htmlFor={`${field.id}-${opt}`} className="font-normal">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );

          default:
            return (
              <div key={field.id} className={`space-y-2 ${fieldWidth}`}>
                {showLabels && (
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                <Input
                  type={field.type}
                  placeholder={field.placeholder || field.label}
                  value={formData[field.id] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  disabled={isEditing}
                  className={error ? 'border-destructive' : ''}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );
        }
      };

      const currentFields = getCurrentStepFields();

      return (
        <form
          className="space-y-4"
          style={getResponsiveStyles()}
          onSubmit={handleSubmit}
        >
          {/* Progress indicator for progressive forms */}
          {isProgressive && totalSteps > 1 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {stepsConfig.map((step: { name: string }, idx: number) => (
                  <div
                    key={idx}
                    className={`flex-1 text-center text-xs font-medium ${idx + 1 === currentStep ? 'text-primary' :
                        idx + 1 < currentStep ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                  >
                    {step.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {stepsConfig.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded-full ${idx + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {currentFields.map(renderField)}
          </div>

          <div className="flex gap-2">
            {isProgressive && currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrev} disabled={isEditing}>
                Previous
              </Button>
            )}
            {isProgressive && currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={isEditing} className="flex-1">
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={isEditing}>
                {submitText}
              </Button>
            )}
          </div>
        </form>
      );
    }

    case 'slider': {
      const {
        slides = [],
        autoplay = true,
        interval = 5000,
        transition = 'slide',
        showDots = true,
        showArrows = true,
        pauseOnHover = true,
      } = component.content;

      // Autoplay logic
      useEffect(() => {
        if (autoplay && isPlaying && slides.length > 1 && !(pauseOnHover && isHovering)) {
          sliderRef.current = setInterval(() => {
            setSliderIndex(prev => (prev + 1) % slides.length);
          }, interval);
        }

        return () => {
          if (sliderRef.current) clearInterval(sliderRef.current);
        };
      }, [autoplay, isPlaying, slides.length, interval, pauseOnHover, isHovering]);

      if (slides.length === 0) {
        return (
          <div
            className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg border-2 border-dashed"
            style={getResponsiveStyles()}
          >
            <span className="text-muted-foreground">Add slider images in the settings panel</span>
          </div>
        );
      }

      const getTransitionProps = () => {
        switch (transition) {
          case 'fade':
            return {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.5 },
            };
          case 'zoom':
            return {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 1.1 },
              transition: { duration: 0.5 },
            };
          default:
            return {
              initial: { x: '100%' },
              animate: { x: 0 },
              exit: { x: '-100%' },
              transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
            };
        }
      };

      return (
        <div
          className="relative w-full overflow-hidden rounded-lg"
          style={getResponsiveStyles()}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative aspect-video">
            <AnimatePresence mode="wait">
              <motion.div
                key={sliderIndex}
                {...getTransitionProps()}
                className="absolute inset-0"
              >
                {slides[sliderIndex]?.link && !isEditing ? (
                  <a href={slides[sliderIndex].link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={slides[sliderIndex].src}
                      alt={slides[sliderIndex].alt || ''}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <img
                    src={slides[sliderIndex]?.src}
                    alt={slides[sliderIndex]?.alt || ''}
                    className="w-full h-full object-cover"
                  />
                )}
                {slides[sliderIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-lg font-medium">{slides[sliderIndex].caption}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {showArrows && slides.length > 1 && (
            <>
              <button
                onClick={() => setSliderIndex(prev => prev === 0 ? slides.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSliderIndex(prev => (prev + 1) % slides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {showDots && slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSliderIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === sliderIndex
                      ? 'bg-primary scale-125'
                      : 'bg-white/60 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          )}

          {autoplay && slides.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background shadow-lg"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
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
        <div style={getResponsiveStyles()} className="flex items-center justify-center">
          <IconByName
            name={name || 'Star'}
            size={size}
            color={color}
          />
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
