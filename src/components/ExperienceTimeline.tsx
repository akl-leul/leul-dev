import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, MapPin } from 'lucide-react';

interface Experience {
  id: string; role: string; company: string; company_url: string | null; location: string | null;
  start_date: string; end_date: string | null; current: boolean; description: string | null;
  achievements: string[] | null; tech_used: string[] | null;
}

const ExperienceTimeline = ({ experiences, formatDate }: { experiences: Experience[]; formatDate: (d: string) => string }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ol className="relative ml-3 md:ml-4 border-l border-border">
      {experiences.map((exp, i) => {
        const open = openId === exp.id;
        return (
          <motion.li
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="relative pl-8 pb-10 last:pb-0"
          >
            <motion.span
              animate={{ scale: open ? 1.3 : 1 }}
              className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-primary ${open || exp.current ? 'bg-primary' : 'bg-background'}`}
            />
            <button
              type="button"
              onClick={() => setOpenId(open ? null : exp.id)}
              aria-expanded={open}
              className={`w-full text-left border bg-card/60 p-5 transition-colors ${open ? 'border-primary' : 'border-border hover:border-primary/60'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="bp-mono text-[11px] tracking-widest text-primary flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(exp.start_date)} — {exp.current || !exp.end_date ? 'Present' : formatDate(exp.end_date)}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{exp.role}</h3>
                  <p className="text-muted-foreground text-sm mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{exp.company}</span>
                    {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{exp.location}</span>}
                  </p>
                </div>
                <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted-foreground mt-1">
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border border-t-0 border-primary/60 bg-card/40 p-5 space-y-4">
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
                        Visit {exp.company}
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ol>
  );
};

export default ExperienceTimeline;
