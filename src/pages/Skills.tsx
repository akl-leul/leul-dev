import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePageView } from '@/hooks/usePageView';
import { SITE_OWNER_ID } from '@/config/owner';
import { getSkillIcon } from '@/lib/skill-icons';

interface Skill { id: string; name: string; category: string; }

const Skills = () => {
  usePageView('Skills & Technologies');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('skills').select('id, name, category').eq('user_id', SITE_OWNER_ID)
      .order('category').order('name')
      .then(({ data }) => { setSkills(data || []); setLoading(false); });
  }, []);

  const groups = skills.reduce((acc, s) => {
    const c = s.category || 'Other';
    (acc[c] ||= []).push(s);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-border pb-8">
          <p className="bp-mono text-[12px] text-muted-foreground mb-3">SPEC.03 — TOOLKIT</p>
          <h1 className="text-4xl md:text-5xl font-light text-foreground">Skills & Technologies</h1>
          <p className="mt-3 text-[12px] text-muted-foreground">{skills.length} tools across {Object.keys(groups).length} areas</p>
        </header>

        {loading ? (
          <p className="text-[12px] text-muted-foreground">Loading skills…</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {Object.entries(groups).map(([category, list], i) => (
              <section key={category} className="grid md:grid-cols-[220px_1fr] gap-4 py-6" aria-labelledby={`cat-${i}`}>
                <div className="flex md:flex-col gap-2 items-baseline">
                  <span className="bp-mono text-[12px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <h2 id={`cat-${i}`} className="text-[12px] font-semibold uppercase tracking-wider text-foreground">{category}</h2>
                  <span className="text-[12px] text-muted-foreground">{list.length}</span>
                </div>
                <ul className="flex flex-wrap content-start items-start gap-2">
                  {list.map((s) => { const Icon = getSkillIcon(s.name); return (
                    <li key={s.id} className="inline-flex items-center gap-2 text-[12px] text-foreground border border-border px-3 py-1.5"><Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{s.name}</li>
                  ); })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Skills;
