import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Mail, MapPin, Phone, Globe } from "lucide-react";

interface ContactContent {
  id?: string;
  title: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  social_links: Record<string, string> | null;
}

interface ContactContentEditorProps {
  contactInfo: any;
  onUpdate: (info: any) => void;
}

export function ContactContentEditor({ contactInfo, onUpdate }: ContactContentEditorProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ContactContent | null>(null);
  
  const [formData, setFormData] = useState({
    title: "Get In Touch",
    description: "Have a project in mind or just want to chat? I'd love to hear from you!",
    email: contactInfo?.email || "",
    phone: contactInfo?.phone || "",
    location: contactInfo?.location || "",
    social_github: "",
    social_linkedin: "",
    social_twitter: "",
    social_website: "",
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('contact_content')
      .select('*')
      .maybeSingle();
    
    if (data) {
      setContent(data);
      const socialLinks = (data.social_links as Record<string, string>) || {};
      setFormData({
        title: data.title || "Get In Touch",
        description: data.description || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        social_github: socialLinks.github || "",
        social_linkedin: socialLinks.linkedin || "",
        social_twitter: socialLinks.twitter || "",
        social_website: socialLinks.website || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        title: formData.title,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        social_links: {
          github: formData.social_github,
          linkedin: formData.social_linkedin,
          twitter: formData.social_twitter,
          website: formData.social_website,
        },
      };

      if (content?.id) {
        const { error } = await supabase
          .from('contact_content')
          .update(saveData)
          .eq('id', content.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_content')
          .insert([saveData]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Contact information updated",
      });
      setEditing(false);
      onUpdate({ email: formData.email, phone: formData.phone, location: formData.location });
      loadContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Manage contact page details</CardDescription>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => {
              if (editing) {
                loadContent();
              }
              setEditing(!editing);
            }}
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!editing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm">{formData.description || "Not set"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium truncate">{formData.email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium">{formData.phone || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <Label className="text-muted-foreground text-xs">Location</Label>
                  <p className="font-medium">{formData.location || "Not set"}</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Social Links</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.social_github && (
                  <a href={formData.social_github} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">GitHub</a>
                )}
                {formData.social_linkedin && (
                  <a href={formData.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">LinkedIn</a>
                )}
                {formData.social_twitter && (
                  <a href={formData.social_twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Twitter</a>
                )}
                {formData.social_website && (
                  <a href={formData.social_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Website</a>
                )}
                {!formData.social_github && !formData.social_linkedin && !formData.social_twitter && !formData.social_website && (
                  <span className="text-sm text-muted-foreground">No social links set</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Get In Touch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Page description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Social Links
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="GitHub URL"
                  value={formData.social_github}
                  onChange={(e) => setFormData({ ...formData, social_github: e.target.value })}
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={formData.social_linkedin}
                  onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                />
                <Input
                  placeholder="Twitter/X URL"
                  value={formData.social_twitter}
                  onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                />
                <Input
                  placeholder="Website URL"
                  value={formData.social_website}
                  onChange={(e) => setFormData({ ...formData, social_website: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
