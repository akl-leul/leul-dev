import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Plus, Minus, MapPin } from 'lucide-react';

interface Experience {
  id: string; role: string; company: string; company_url: string | null; location: string | null;
  start_date: string; end_date: string | null; current: boolean; description: string | null;
  achievements: string[] | null; tech_used: string[] | null;
}

const ExperienceTimeline = ({ experiences, formatDate }: { experiences: Experience[]; formatDate: (d: string) => string }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <ol className="relative border-t border-border">
      {experiences.map((exp, i) => {
        const open = openId === exp.id;
        return (
          <motion.li
            key={exp.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
            className="relative grid md:grid-cols-[180px_1fr] border-b border-border"
          >
            <div className="relative pt-6 md:py-8 md:pr-8 md:border-r border-border">
              <span aria-hidden="true" className="bp-mono text-xs text-muted-foreground">CHAPTER / {String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-xl text-foreground tabular-nums">{new Date(exp.start_date).getFullYear()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(exp.start_date)} — {exp.current || !exp.end_date ? 'Present' : formatDate(exp.end_date)}</p>
              {exp.current && <span className="inline-flex mt-3 gap-2 items-center bp-mono text-[10px] text-primary"><span className="w-1.5 h-1.5 bg-primary" />Current</span>}
              <span aria-hidden="true" className={`hidden md:block absolute -right-[5px] top-10 w-[9px] h-[9px] rotate-45 ${open ? 'bg-primary' : 'bg-muted-foreground'}`} />
            </div>
            <div className="min-w-0 md:pl-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenId(open ? null : exp.id)}
              aria-expanded={open}
              aria-controls={`experience-${exp.id}`}
              className="w-full h-auto whitespace-normal justify-between text-left rounded-none px-0 py-6 md:py-8 hover:bg-transparent gap-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-medium text-foreground">{exp.role}</h3>
                  <p className="text-muted-foreground text-sm mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{exp.company}</span>
                    {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{exp.location}</span>}
                  </p>
                </div>
                <span aria-hidden="true" className="border border-border w-9 h-9 flex items-center justify-center shrink-0 text-primary">{open ? <Minus /> : <Plus />}</span>
              </div>
            </Button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`experience-${exp.id}`}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 space-y-5 max-w-2xl">
                    {exp.description && <p className="text-muted-foreground">{exp.description}</p>}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Key Achievements</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {exp.achievements.map((a, idx) => <li key={idx}>{a}</li>)}
                        </ul>
                      </div>
                    )}
                    {exp.tech_used && exp.tech_used.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.tech_used.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                      </div>
                    )}
                    {exp.company_url && (
                      <a href={exp.company_url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-primary border-b border-primary">
                        Visit {exp.company} <ArrowUpRight aria-hidden="true" className="inline h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
};

export default ExperienceTimeline;
