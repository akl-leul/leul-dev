import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageCropUpload } from "./ImageCropUpload";
import { Save, RefreshCw } from "lucide-react";

interface HomeContent {
  id: string;
  name: string;
  tagline: string;
  hero_image: string | null;
  background_gradient: string | null;
  text_color: string | null;
}

interface HomeContentEditorProps {
  content: HomeContent | null;
  onUpdate: () => void;
}

export function HomeContentEditor({ content, onUpdate }: HomeContentEditorProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: content?.name || "Leul Ayfokru",
    tagline: content?.tagline || "Build Scalable Efficient Applications",
    hero_image: content?.hero_image || "",
    background_gradient: content?.background_gradient || "linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))",
    text_color: content?.text_color || "#ffffff",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content?.id) {
        const { error } = await supabase
          .from("home_content")
          .update(formData)
          .eq("id", content.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("home_content")
          .insert([formData]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Home content updated successfully",
      });
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Manage your home page hero content</CardDescription>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => {
              setEditing(!editing);
              if (editing) {
                // Reset form if canceling
                setFormData({
                  name: content?.name || "Leul Ayfokru",
                  tagline: content?.tagline || "Build Scalable Efficient Applications",
                  hero_image: content?.hero_image || "",
                  background_gradient: content?.background_gradient || "linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))",
                  text_color: content?.text_color || "#ffffff",
                });
              }
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
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tagline</Label>
              <p className="font-medium">{formData.tagline}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Hero Image</Label>
              {formData.hero_image ? (
                <img 
                  src={formData.hero_image} 
                  alt="Hero" 
                  className="mt-2 w-32 h-32 object-cover rounded-lg border"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No image set</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Background Gradient</Label>
              <div 
                className="mt-2 h-12 rounded-lg border" 
                style={{ background: formData.background_gradient }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Your tagline"
              />
            </div>

            <div className="space-y-2">
              <Label>Hero Image</Label>
              <ImageCropUpload
                bucketName="home-images"
                label="Hero Image"
                currentImageUrl={formData.hero_image || undefined}
                onImageUpdate={(url) => setFormData({ ...formData, hero_image: url || "" })}
                aspectRatio={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_gradient">Background Gradient</Label>
              <Input
                id="background_gradient"
                value={formData.background_gradient}
                onChange={(e) => setFormData({ ...formData, background_gradient: e.target.value })}
                placeholder="linear-gradient(...)"
              />
              <div 
                className="h-12 rounded-lg border" 
                style={{ background: formData.background_gradient }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
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