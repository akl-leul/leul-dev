import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';

export const ACHIEVEMENT_TYPES = ['certificate', 'award', 'achievement', 'publication', 'other'];

type Achievement = {
  id: string; title: string; type: string; issuer: string | null; description: string | null;
  issued_date: string | null; credential_url: string | null; images: string[];
  display_order: number; published: boolean;
};

const empty = { title: '', type: 'certificate', issuer: '', description: '', issued_date: '', credential_url: '', images: [] as string[], display_order: 0, published: true };

const db = () => (supabase as any).from('achievements');

export const AchievementsManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Achievement[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await db().select('*').order('display_order').order('issued_date', { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditId(null); setForm({ ...empty }); setOpen(true); };
  const startEdit = (a: Achievement) => {
    setEditId(a.id);
    setForm({ title: a.title, type: a.type, issuer: a.issuer || '', description: a.description || '', issued_date: a.issued_date || '', credential_url: a.credential_url || '', images: a.images || [], display_order: a.display_order, published: a.published });
    setOpen(true);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const path = `achievements/${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name.replace(/[^\w.-]/g, '_')}`;
      const { error } = await supabase.storage.from('project-images').upload(path, f);
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
      urls.push(supabase.storage.from('project-images').getPublicUrl(path).data.publicUrl);
    }
    setForm((p) => ({ ...p, images: [...p.images, ...urls] }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { ...form, issuer: form.issuer || null, description: form.description || null, issued_date: form.issued_date || null, credential_url: form.credential_url || null };
    const { error } = editId ? await db().update(payload).eq('id', editId) : await db().insert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved' });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const { error } = await db().delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Certificates & Achievements</h1>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-2" />Add new</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            {a.images?.[0] && <img src={a.images[0]} alt={a.title} className="aspect-video w-full object-cover" />}
            <CardContent className="p-4 space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="capitalize">{a.type}</Badge>
                {!a.published && <Badge variant="outline">Hidden</Badge>}
                {a.images?.length > 1 && <Badge variant="outline">{a.images.length} images</Badge>}
              </div>
              <h3 className="font-semibold">{a.title}</h3>
              {a.issuer && <p className="text-sm text-muted-foreground">{a.issuer}</p>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(a)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                <Button size="sm" variant="outline" onClick={() => remove(a.id)} aria-label={`Delete ${a.title}`}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && <p className="text-muted-foreground">Nothing yet — add your first certificate.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit item' : 'New item'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label htmlFor="ach-title">Title</Label><Input id="ach-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACHIEVEMENT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="ach-issuer">Issuer / Organization</Label><Input id="ach-issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></div>
              <div><Label htmlFor="ach-date">Date</Label><Input id="ach-date" type="date" value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} /></div>
              <div><Label htmlFor="ach-url">Credential link</Label><Input id="ach-url" value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="https://" /></div>
              <div><Label htmlFor="ach-order">Display order</Label><Input id="ach-order" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            </div>
            <div><Label htmlFor="ach-desc">Description</Label><Textarea id="ach-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <Label>Images</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {form.images.map((url, i) => (
                  <div key={url} className="relative group">
                    <img src={url} alt={`Image ${i + 1}`} className="aspect-square w-full object-cover rounded border" />
                    <button type="button" aria-label="Remove image" onClick={() => setForm({ ...form, images: form.images.filter((u) => u !== url) })}
                      className="absolute top-1 right-1 rounded-full bg-background/90 p-1 border"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer text-xs text-muted-foreground hover:bg-muted">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5 mb-1" />Add images</>}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch id="ach-pub" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label htmlFor="ach-pub">Visible on site</Label></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
