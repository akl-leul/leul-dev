import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ComponentRenderer } from '@/components/admin/page-builder/ComponentRenderer';
import { PageSection } from '@/components/admin/page-builder/types';
import { Json } from '@/integrations/supabase/types';

interface DynamicPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  password: string | null;
  meta_description: string | null;
  use_builder: boolean | null;
  builder_content: Json | null;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<DynamicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      
      setPage(data);
      
      // Check if page needs password
      if (!data.password) {
        setIsUnlocked(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Page not found',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (page && passwordInput === page.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      toast({
        title: 'Error',
        description: 'Incorrect password',
        variant: 'destructive',
      });
    }
  };

  // Render builder content with theme-aware styling
  const renderBuilderContent = (sections: PageSection[]) => {
    return (
      <div className="space-y-0 bg-background text-foreground">
        {sections.map((section) => {
          // Determine if backgroundColor uses CSS variables or is transparent
          const bgColor = section.styles?.backgroundColor;
          const hasBgColor = bgColor && bgColor !== 'transparent';
          
          return (
            <div
              key={section.id}
              className="transition-colors duration-200"
              style={{
                backgroundColor: hasBgColor ? bgColor : undefined,
                backgroundImage: section.styles?.backgroundImage 
                  ? `url(${section.styles.backgroundImage})` 
                  : section.styles?.backgroundGradient || undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: section.styles?.padding || '48px 24px',
                margin: section.styles?.margin,
                minHeight: section.styles?.minHeight,
              }}
            >
              <div 
                className="container mx-auto px-4"
                style={{ maxWidth: section.styles?.maxWidth }}
              >
                <div className="grid gap-4 grid-cols-1">
                  {section.components.map((component) => (
                    <ComponentRenderer
                      key={component.id}
                      component={component}
                      isEditing={false}
                      viewMode="desktop"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return <Navigate to="/404" replace />;
  }

  // Password protection gate
  if (page.password && !isUnlocked) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-center">{page.title}</CardTitle>
              <CardDescription className="text-center">
                This page is password protected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Enter Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="Enter password to access"
                    className={passwordError ? 'border-destructive' : ''}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">
                      Incorrect password. Please try again.
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Unlock Page
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render page based on builder mode
  if (page.use_builder && page.builder_content) {
    const sections = Array.isArray(page.builder_content) 
      ? (page.builder_content as unknown as PageSection[])
      : [];
    
    return (
      <div className="min-h-screen mt-16">
        {renderBuilderContent(sections)}
      </div>
    );
  }

  // Render HTML content (legacy mode)
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 mt-16">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
          {page.meta_description && (
            <p className="text-lg text-muted-foreground">
              {page.meta_description}
            </p>
          )}
        </header>
        
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(page.content),
          }}
        />
      </article>
    </div>
  );
}
