import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ExternalLink, Award } from 'lucide-react';
import { format } from 'date-fns';
import { usePageView } from '@/hooks/usePageView';

type Achievement = {
  id: string; title: string; type: string; issuer: string | null; description: string | null;
  issued_date: string | null; credential_url: string | null; images: string[];
};

const Achievements = () => {
  usePageView('Achievements');
  const reduce = useReducedMotion();
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<Achievement | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    (supabase as any).from('achievements').select('*').eq('published', true)
      .order('display_order').order('issued_date', { ascending: false })
      .then(({ data }: any) => { setItems(data || []); setLoading(false); });
  }, []);

  const types = ['all', ...Array.from(new Set(items.map((i) => i.type)))];
  const shown = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const imgs = active?.images || [];

  return (
    <main className="pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-10">
          <p className="bp-label mb-3">SPEC.07 — RECOGNITION</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Certificates & Achievements</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">Credentials, awards and milestones along the way.</p>
        </div>

        {types.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter by type">
            {types.map((t) => (
              <Button key={t} role="tab" aria-selected={filter === t} size="sm" variant={filter === t ? 'default' : 'outline'} className="capitalize" onClick={() => setFilter(t)}>{t}</Button>
            ))}
          </div>
        )}

        {loading ? <p className="text-muted-foreground">Loading…</p> : !shown.length ? (
          <p className="text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a, i) => (
              <motion.div key={a.id} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <button type="button" onClick={() => { setActive(a); setIdx(0); }} className="bp-card text-left w-full bg-card border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`View ${a.title}`}>
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden relative">
                    {a.images?.[0] ? <img src={a.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Award className="h-10 w-10 text-muted-foreground" aria-hidden />}
                    {a.images?.length > 1 && <span className="absolute bottom-2 right-2 bp-mono text-[10px] bg-background/80 px-2 py-1 border border-border">+{a.images.length - 1}</span>}
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="capitalize bp-mono text-[10px]">{a.type}</Badge>
                      {a.issued_date && <span className="bp-mono text-[10px] text-muted-foreground">{format(new Date(a.issued_date), 'MMM yyyy')}</span>}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{a.title}</h2>
                    {a.issuer && <p className="text-sm text-muted-foreground">{a.issuer}</p>}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          {active && (
            <div className="space-y-4">
              {imgs.length > 0 && (
                <div className="relative bg-muted">
                  <AnimatePresence mode="wait">
                    <motion.img key={imgs[idx]} src={imgs[idx]} alt={`${active.title} — image ${idx + 1} of ${imgs.length}`}
                      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }}
                      className="w-full max-h-[60vh] object-contain" />
                  </AnimatePresence>
                  {imgs.length > 1 && (
                    <>
                      <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2" aria-label="Previous image" onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Next image" onClick={() => setIdx((idx + 1) % imgs.length)}><ChevronRight className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              )}
              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {imgs.map((u, i) => (
                    <button key={u} onClick={() => setIdx(i)} aria-label={`Show image ${i + 1}`} className={`shrink-0 border-2 ${i === idx ? 'border-primary' : 'border-transparent opacity-60'}`}>
                      <img src={u} alt="" className="h-14 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div>
                <Badge variant="outline" className="capitalize mb-2">{active.type}</Badge>
                <DialogTitle className="text-2xl">{active.title}</DialogTitle>
                <DialogDescription>
                  {[active.issuer, active.issued_date && format(new Date(active.issued_date), 'MMMM yyyy')].filter(Boolean).join(' · ')}
                </DialogDescription>
              </div>
              {active.description && <p className="text-muted-foreground whitespace-pre-line">{active.description}</p>}
              {active.credential_url && (
                <Button asChild variant="outline"><a href={active.credential_url} target="_blank" rel="noopener noreferrer">View credential <ExternalLink className="h-4 w-4 ml-2" /></a></Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Achievements;
