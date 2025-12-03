import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageCropUpload } from "./ImageCropUpload";
import { Save, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HomeContent {
  id: string;
  name: string;
  tagline: string;
  hero_image: string | null;
  background_image: string | null;
  background_gradient: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  text_color: string | null;
  accent_color: string | null;
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
    background_image: content?.background_image || "",
    background_gradient: content?.background_gradient || "linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))",
    primary_color: content?.primary_color || "hsl(262, 83%, 58%)",
    secondary_color: content?.secondary_color || "hsl(180, 100%, 50%)",
    text_color: content?.text_color || "hsl(0, 0%, 100%)",
    accent_color: content?.accent_color || "hsl(262, 90%, 65%)",
  });

  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name || "Leul Ayfokru",
        tagline: content.tagline || "Build Scalable Efficient Applications",
        hero_image: content.hero_image || "",
        background_image: content.background_image || "",
        background_gradient: content.background_gradient || "linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))",
        primary_color: content.primary_color || "hsl(262, 83%, 58%)",
        secondary_color: content.secondary_color || "hsl(180, 100%, 50%)",
        text_color: content.text_color || "hsl(0, 0%, 100%)",
        accent_color: content.accent_color || "hsl(262, 90%, 65%)",
      });
    }
  }, [content]);

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

  const handleCancel = () => {
    setEditing(false);
    if (content) {
      setFormData({
        name: content.name || "Leul Ayfokru",
        tagline: content.tagline || "Build Scalable Efficient Applications",
        hero_image: content.hero_image || "",
        background_image: content.background_image || "",
        background_gradient: content.background_gradient || "linear-gradient(135deg, hsl(15, 100%, 60%), hsl(0, 85%, 50%))",
        primary_color: content.primary_color || "hsl(262, 83%, 58%)",
        secondary_color: content.secondary_color || "hsl(180, 100%, 50%)",
        text_color: content.text_color || "hsl(0, 0%, 100%)",
        accent_color: content.accent_color || "hsl(262, 90%, 65%)",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Manage your home page hero content</CardDescription>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => editing ? handleCancel() : setEditing(true)}
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{formData.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tagline</Label>
                <p className="font-medium">{formData.tagline}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label className="text-muted-foreground">Background Image</Label>
                {formData.background_image ? (
                  <img 
                    src={formData.background_image} 
                    alt="Background" 
                    className="mt-2 w-32 h-20 object-cover rounded-lg border"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No image set</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Background Gradient</Label>
              <div 
                className="mt-2 h-12 rounded-lg border" 
                style={{ background: formData.background_gradient }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">Primary</Label>
                <div 
                  className="mt-2 h-8 rounded border" 
                  style={{ background: formData.primary_color }}
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Secondary</Label>
                <div 
                  className="mt-2 h-8 rounded border" 
                  style={{ background: formData.secondary_color }}
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Text</Label>
                <div 
                  className="mt-2 h-8 rounded border" 
                  style={{ background: formData.text_color }}
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Accent</Label>
                <div 
                  className="mt-2 h-8 rounded border" 
                  style={{ background: formData.accent_color }}
                />
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 space-y-4">
              <TabsContent value="basic" className="space-y-4">
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
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
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
                  <Label>Background Image</Label>
                  <ImageCropUpload
                    bucketName="home-images"
                    label="Background Image"
                    currentImageUrl={formData.background_image || undefined}
                    onImageUpdate={(url) => setFormData({ ...formData, background_image: url || "" })}
                    aspectRatio={16/9}
                  />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <Input
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      placeholder="hsl(262, 83%, 58%)"
                    />
                    <div className="h-8 rounded border" style={{ background: formData.primary_color }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <Input
                      id="secondary_color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      placeholder="hsl(180, 100%, 50%)"
                    />
                    <div className="h-8 rounded border" style={{ background: formData.secondary_color }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Text Color</Label>
                    <Input
                      id="text_color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      placeholder="hsl(0, 0%, 100%)"
                    />
                    <div className="h-8 rounded border" style={{ background: formData.text_color }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <Input
                      id="accent_color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      placeholder="hsl(262, 90%, 65%)"
                    />
                    <div className="h-8 rounded border" style={{ background: formData.accent_color }} />
                  </div>
                </div>
              </TabsContent>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full mt-6"
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
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
