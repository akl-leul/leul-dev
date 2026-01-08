import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageSection, PageTemplate, PageVersion } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  LayoutTemplate, 
  Plus, 
  Download, 
  Upload,
  Trash2,
  Star,
  Clock,
  RotateCcw,
  Save,
} from 'lucide-react';

// Pre-built templates
const DEFAULT_TEMPLATES: Partial<PageTemplate>[] = [
  {
    name: 'Landing Page',
    description: 'A modern landing page with hero, features, and CTA sections',
    content: [
      {
        id: 'hero',
        type: 'section',
        name: 'Hero Section',
        components: [
          {
            id: 'h1',
            type: 'heading',
            content: { text: 'Welcome to Our Site', level: 'h1' },
            styles: { fontSize: '48px', fontWeight: '700', textAlign: 'center', padding: '16px' },
          },
          {
            id: 't1',
            type: 'text',
            content: { text: 'Build something amazing with our platform. Get started today and see what you can create.' },
            styles: { fontSize: '18px', textAlign: 'center', padding: '16px', maxWidth: '600px', margin: '0 auto' },
          },
          {
            id: 'b1',
            type: 'button',
            content: { text: 'Get Started', link: '#', variant: 'primary' },
            styles: { textAlign: 'center', padding: '16px' },
          },
        ],
        styles: { padding: '80px 24px', backgroundColor: 'hsl(252 100% 97%)' },
      },
      {
        id: 'features',
        type: 'section',
        name: 'Features',
        components: [
          {
            id: 'h2',
            type: 'heading',
            content: { text: 'Features', level: 'h2' },
            styles: { fontSize: '36px', fontWeight: '600', textAlign: 'center', padding: '16px' },
          },
        ],
        styles: { padding: '48px 24px' },
      },
    ],
    is_public: true,
  },
  {
    name: 'About Page',
    description: 'A clean about page with bio and images',
    content: [
      {
        id: 'intro',
        type: 'section',
        name: 'Introduction',
        components: [
          {
            id: 'h1',
            type: 'heading',
            content: { text: 'About Us', level: 'h1' },
            styles: { fontSize: '48px', fontWeight: '700', padding: '16px' },
          },
          {
            id: 't1',
            type: 'text',
            content: { text: 'Learn more about our story, mission, and the team behind the product.' },
            styles: { fontSize: '18px', padding: '16px' },
          },
        ],
        styles: { padding: '48px 24px' },
      },
    ],
    is_public: true,
  },
  {
    name: 'Contact Page',
    description: 'A contact page with form and information',
    content: [
      {
        id: 'contact',
        type: 'section',
        name: 'Contact Form',
        components: [
          {
            id: 'h1',
            type: 'heading',
            content: { text: 'Get in Touch', level: 'h1' },
            styles: { fontSize: '48px', fontWeight: '700', textAlign: 'center', padding: '16px' },
          },
          {
            id: 'f1',
            type: 'form',
            content: {
              fields: [
                { id: '1', type: 'text', label: 'Name', required: true },
                { id: '2', type: 'email', label: 'Email', required: true },
                { id: '3', type: 'textarea', label: 'Message', required: true },
              ],
              submitText: 'Send Message',
            },
            styles: { padding: '16px', maxWidth: '500px', margin: '0 auto' },
          },
        ],
        styles: { padding: '48px 24px' },
      },
    ],
    is_public: true,
  },
  {
    name: 'Blank',
    description: 'Start from scratch',
    content: [],
    is_public: true,
  },
];

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (sections: PageSection[]) => void;
  currentSections: PageSection[];
}

export function TemplateManager({ 
  isOpen, 
  onClose, 
  onLoadTemplate,
  currentSections 
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templatePublic, setTemplatePublic] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse JSON content
      const parsed = (data || []).map(t => ({
        ...t,
        content: typeof t.content === 'string' ? JSON.parse(t.content) : t.content,
      }));
      
      setTemplates(parsed);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !templateName.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_templates')
        .insert({
          name: templateName,
          description: templateDescription,
          content: currentSections,
          is_public: templatePublic,
          created_by: user.id,
        });

      if (error) throw error;

      toast({ title: 'Template saved successfully' });
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Failed to save template',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('page_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({ title: 'Template deleted' });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Failed to delete template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLoadTemplate = (content: PageSection[]) => {
    onLoadTemplate(content);
    onClose();
    toast({ title: 'Template loaded' });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Templates
            </SheetTitle>
            <SheetDescription>
              Use a template or save your current design
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 flex gap-2">
            <Button 
              onClick={() => setShowSaveDialog(true)}
              disabled={currentSections.length === 0}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {/* Default Templates */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Starter Templates</h4>
                <div className="grid gap-3">
                  {DEFAULT_TEMPLATES.map((template, idx) => (
                    <motion.button
                      key={idx}
                      className="w-full p-4 rounded-lg border bg-card text-left hover:border-primary transition-colors"
                      onClick={() => handleLoadTemplate(template.content as PageSection[])}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{template.name}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* User Templates */}
              {templates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Templates</h4>
                  <div className="grid gap-3">
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        className="p-4 rounded-lg border bg-card"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between">
                          <button
                            className="text-left flex-1"
                            onClick={() => handleLoadTemplate(template.content)}
                          >
                            <h5 className="font-medium">{template.name}</h5>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(template.created_at).toLocaleDateString()}
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current page design as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Custom Template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="A brief description of this template..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="public"
                checked={templatePublic}
                onCheckedChange={setTemplatePublic}
              />
              <Label htmlFor="public">Make template public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim() || saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Version History Component
interface VersionHistoryProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (sections: PageSection[]) => void;
}

export function VersionHistory({ 
  pageId, 
  isOpen, 
  onClose, 
  onRestore 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && pageId) {
      fetchVersions();
    }
  }, [isOpen, pageId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('page_versions')
        .select('*')
        .eq('page_id', pageId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map(v => ({
        ...v,
        content: typeof v.content === 'string' ? JSON.parse(v.content) : v.content,
      }));
      
      setVersions(parsed);
    } catch (error: any) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version: PageVersion) => {
    onRestore(version.content);
    onClose();
    toast({ title: `Restored to version ${version.version_number}` });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </SheetTitle>
          <SheetDescription>
            View and restore previous versions of this page
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No versions saved yet</p>
              <p className="text-sm mt-1">Versions are created when you save</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <motion.div
                  key={version.id}
                  className="p-4 rounded-lg border bg-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </div>
                      {version.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(version)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
