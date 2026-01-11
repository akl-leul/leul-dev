import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FolderOpen, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ComponentTemplate {
  id: string;
  name: string;
  description: string | null;
  component_type: string;
  content: any;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

interface ComponentTemplateManagerProps {
  componentType: 'form' | 'slider' | 'accordion';
  currentContent: any;
  onLoadTemplate: (content: any) => void;
}

export function ComponentTemplateManager({
  componentType,
  currentContent,
  onLoadTemplate,
}: ComponentTemplateManagerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ComponentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('component_templates')
        .select('*')
        .eq('component_type', componentType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadDialogOpen) {
      fetchTemplates();
    }
  }, [loadDialogOpen, componentType]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a template name',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save templates',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('component_templates').insert({
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        component_type: componentType,
        content: currentContent,
        is_public: isPublic,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });
      setSaveDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');
      setIsPublic(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = (template: ComponentTemplate) => {
    onLoadTemplate(template.content);
    setLoadDialogOpen(false);
    toast({
      title: 'Template Loaded',
      description: `"${template.name}" has been applied`,
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('component_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      toast({
        title: 'Deleted',
        description: 'Template has been deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const getTypeLabel = () => {
    switch (componentType) {
      case 'form': return 'Form';
      case 'slider': return 'Slider';
      case 'accordion': return 'Accordion';
      default: return 'Component';
    }
  };

  return (
    <div className="flex gap-1">
      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <Save className="h-3 w-3" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save {getTypeLabel()} Template</DialogTitle>
            <DialogDescription>
              Save this {getTypeLabel().toLowerCase()} configuration as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={`My ${getTypeLabel()} Template`}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Make Public</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <FolderOpen className="h-3 w-3" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Load {getTypeLabel()} Template</DialogTitle>
            <DialogDescription>
              Choose a template to apply to this {getTypeLabel().toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 py-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-xs mt-1">Save your first template to get started</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.is_public && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Public
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {user?.id === template.created_by && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
