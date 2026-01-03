import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, User, Lock, Globe, Palette, Moon, Sun, Monitor, Upload, X, Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeProvider";

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-3">
      <Label>Theme Mode</Label>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-5 w-5" />
          <span className="text-xs">Light</span>
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-5 w-5" />
          <span className="text-xs">Dark</span>
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-5 w-5" />
          <span className="text-xs">System</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {theme === "system" 
          ? "Theme will match your system preference" 
          : `Currently using ${theme} mode`}
      </p>
    </div>
  );
}

interface SettingsManagerProps {
  onSettingsUpdate?: () => void;
}

export function SettingsManager({ onSettingsUpdate }: SettingsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  // Account settings
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Website settings
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_name', 'site_description', 'site_url', 'meta_keywords', 'favicon_url', 'og_image_url']);

      if (data) {
        data.forEach((item) => {
          switch (item.setting_key) {
            case 'site_name': setSiteName(item.setting_value); break;
            case 'site_description': setSiteDescription(item.setting_value); break;
            case 'site_url': setSiteUrl(item.setting_value); break;
            case 'meta_keywords': setMetaKeywords(item.setting_value); break;
            case 'favicon_url': setFaviconUrl(item.setting_value); break;
            case 'og_image_url': setOgImageUrl(item.setting_value); break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'favicon' | 'og_image') => {
    if (!user) return;
    
    const setUploading = type === 'favicon' ? setUploadingFavicon : setUploadingOgImage;
    const setUrl = type === 'favicon' ? setFaviconUrl : setOgImageUrl;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('home-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('home-images')
        .getPublicUrl(fileName);

      setUrl(publicUrl.publicUrl);
      
      // Save to app_settings
      await saveSetting(`${type}_url`, publicUrl.publicUrl);
      
      toast({ title: `${type === 'favicon' ? 'Favicon' : 'OG Image'} uploaded successfully` });
      
      // Trigger settings update callback if provided
      if (onSettingsUpdate) {
        onSettingsUpdate();
      }
    } catch (error: any) {
      toast({
        title: `Error uploading ${type === 'favicon' ? 'favicon' : 'OG image'}`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('setting_key', key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('app_settings')
        .update({ setting_value: value })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('app_settings')
        .insert([{ setting_key: key, setting_value: value, category: 'seo' }]);
    }
  };

  const handleRemoveImage = async (type: 'favicon' | 'og_image') => {
    const setUrl = type === 'favicon' ? setFaviconUrl : setOgImageUrl;
    setUrl('');
    await saveSetting(`${type}_url`, '');
    toast({ title: `${type === 'favicon' ? 'Favicon' : 'OG Image'} removed` });
    
    // Trigger settings update callback if provided
    if (onSettingsUpdate) {
      onSettingsUpdate();
    }
  };

  const handleEmailUpdate = async () => {
    if (!email) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast({
        title: "Email update initiated",
        description: "Please check your new email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSiteSettingsSave = async () => {
    setSaving(true);
    try {
      // Save site settings to app_settings table
      const settings = [
        { setting_key: 'site_name', setting_value: siteName, category: 'general' },
        { setting_key: 'site_description', setting_value: siteDescription, category: 'general' },
        { setting_key: 'site_url', setting_value: siteUrl, category: 'general' },
        { setting_key: 'meta_keywords', setting_value: metaKeywords, category: 'seo' },
      ];

      for (const setting of settings) {
        if (!setting.setting_value) continue;
        
        const { data: existing } = await supabase
          .from('app_settings')
          .select('id')
          .eq('setting_key', setting.setting_key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('app_settings')
            .update({ setting_value: setting.setting_value })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('app_settings')
            .insert([setting]);
        }
      }

      toast({ title: "Site settings saved successfully" });
      
      // Trigger settings update callback if provided
      if (onSettingsUpdate) {
        onSettingsUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold">Settings</h2>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account email and profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user?.id || ""} disabled className="text-xs" />
              </div>
              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input 
                  value={user?.created_at ? new Date(user.created_at).toLocaleString() : ""} 
                  disabled 
                />
              </div>
              <Button onClick={handleEmailUpdate} disabled={saving}>
                {saving ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Update Email</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handlePasswordUpdate} disabled={saving}>
                {saving ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Update Password</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Configure your website details and SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My Portfolio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="A brief description of your website..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords (comma separated)</Label>
                <Input
                  id="metaKeywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="portfolio, developer, web design"
                />
              </div>

              {/* Favicon Upload */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Favicon
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 32x32 or 64x64 pixels. PNG, ICO, or SVG format.
                </p>
                <div className="flex items-center gap-4">
                  {faviconUrl ? (
                    <div className="relative group">
                      <img 
                        src={faviconUrl} 
                        alt="Favicon" 
                        className="w-12 h-12 rounded border bg-muted object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage('favicon')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center text-muted-foreground">
                      <Image className="h-5 w-5" />
                    </div>
                  )}
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploadingFavicon}
                  >
                    {uploadingFavicon ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Upload Favicon</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Open Graph Image Upload */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Open Graph / Social Share Image
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630 pixels. This image appears when your site is shared on social media.
                </p>
                <div className="flex flex-col gap-4">
                  {ogImageUrl ? (
                    <div className="relative group w-fit">
                      <img 
                        src={ogImageUrl} 
                        alt="OG Image" 
                        className="max-w-xs h-auto rounded border bg-muted object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage('og_image')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-48 h-24 rounded border border-dashed flex items-center justify-center text-muted-foreground">
                      <Image className="h-8 w-8" />
                    </div>
                  )}
                  <input
                    ref={ogImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'og_image')}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => ogImageInputRef.current?.click()}
                    disabled={uploadingOgImage}
                  >
                    {uploadingOgImage ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Upload OG Image</>
                    )}
                  </Button>
                </div>
              </div>

              <Button onClick={handleSiteSettingsSave} disabled={saving} className="mt-4">
                {saving ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Settings</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>Customize the look of your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSelector />
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  For more customization options like colors, gradients, and hero images, 
                  visit the Home Content section.
                </p>
                <Button variant="outline" onClick={() => window.location.hash = '#home'}>
                  Go to Home Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
