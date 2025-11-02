import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageCropUpload } from "./ImageCropUpload";
import { Save, RefreshCw } from "lucide-react";

interface Profile {
  id?: string;
  name?: string;
  bio?: string;
  location?: string;
  email?: string;
  website?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  resume_url?: string;
  avatar_url?: string;
}

interface AboutContentEditorProps {
  profile: Profile | null;
  onUpdate: () => void;
}

export function AboutContentEditor({ profile, onUpdate }: AboutContentEditorProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    email: profile?.email || "",
    website: profile?.website || "",
    github_url: profile?.github_url || "",
    linkedin_url: profile?.linkedin_url || "",
    twitter_url: profile?.twitter_url || "",
    resume_url: profile?.resume_url || "",
    avatar_url: profile?.avatar_url || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update(formData)
          .eq("id", profile.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert([formData]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
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
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your about page content</CardDescription>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => {
              setEditing(!editing);
              if (editing && profile) {
                setFormData({
                  name: profile.name || "",
                  bio: profile.bio || "",
                  location: profile.location || "",
                  email: profile.email || "",
                  website: profile.website || "",
                  github_url: profile.github_url || "",
                  linkedin_url: profile.linkedin_url || "",
                  twitter_url: profile.twitter_url || "",
                  resume_url: profile.resume_url || "",
                  avatar_url: profile.avatar_url || "",
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
            {formData.avatar_url && (
              <div>
                <Label className="text-muted-foreground">Avatar</Label>
                <img 
                  src={formData.avatar_url} 
                  alt="Avatar" 
                  className="mt-2 w-24 h-24 rounded-full object-cover border"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{formData.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{formData.location || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{formData.email || "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <p className="font-medium truncate">{formData.website || "Not set"}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Bio</Label>
              <p className="mt-1 text-sm">{formData.bio || "Not set"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Avatar</Label>
              <ImageCropUpload
                bucketName="home-images"
                label="Avatar"
                currentImageUrl={formData.avatar_url || undefined}
                onImageUpdate={(url) => setFormData({ ...formData, avatar_url: url || "" })}
                aspectRatio={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input
                id="resume_url"
                type="url"
                value={formData.resume_url}
                onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Social Links</Label>
              <div className="space-y-3">
                <Input
                  placeholder="GitHub URL"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
                <Input
                  placeholder="Twitter/X URL"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
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