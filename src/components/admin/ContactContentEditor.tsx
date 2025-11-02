import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, MapPin, Phone } from "lucide-react";

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

interface ContactContentEditorProps {
  contactInfo: ContactInfo;
  onUpdate: (info: ContactInfo) => void;
}

export function ContactContentEditor({ contactInfo, onUpdate }: ContactContentEditorProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(contactInfo);

  const handleSave = () => {
    onUpdate(formData);
    toast({
      title: "Success",
      description: "Contact information updated",
    });
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Manage contact page details</CardDescription>
          </div>
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => {
              setEditing(!editing);
              if (editing) {
                setFormData(contactInfo);
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
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-muted-foreground text-xs">Phone</Label>
                <p className="font-medium">{formData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-muted-foreground text-xs">Location</Label>
                <p className="font-medium">{formData.location}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}