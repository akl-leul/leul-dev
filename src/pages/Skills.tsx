import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { usePageView } from '@/hooks/usePageView';

import {
  SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiNodedotjs, SiPython,
  SiTailwindcss, SiHtml5, SiCss3, SiMysql, SiPostgresql, SiSqlite, SiPrisma,
  SiSupabase, SiFigma, SiAdobephotoshop, SiCanva, SiBlender, SiFramer,
  SiWordpress, SiBootstrap, SiReacthookform, SiReactquery, SiVite, SiSass, SiRedux, SiJest, SiCypress, SiGit, SiGithubactions, SiDocker, SiKubernetes, SiVercel, SiPrismic, SiContentful, SiStrapi, SiSanity, SiGraphql
} from 'react-icons/si';
import { FaDatabase, FaHackerNews } from 'react-icons/fa';
import { BiLogoTypescript, BiLogoPostgresql } from 'react-icons/bi';
import { TbBrandNextjs, TbBrandPrisma } from 'react-icons/tb';

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
  years_experience: number | null;
  icon: string | null;
}

const skillIcons: Record<string, JSX.Element> = {
  // Programming / Language
  JavaScript: <SiJavascript className="text-yellow-400 w-7 h-7" />,
  TypeScript: <BiLogoTypescript className="text-blue-600 w-7 h-7" />,
  Python: <SiPython className="text-blue-400 w-7 h-7" />,
  HTML5: <SiHtml5 className="text-orange-500 w-7 h-7" />,
  CSS3: <SiCss3 className="text-blue-500 w-7 h-7" />,
  React: <SiReact className="text-cyan-400 w-7 h-7" />,
  'React Native': <SiReact className="text-cyan-500 w-7 h-7" />,
  Nextjs: <TbBrandNextjs className="text-black w-7 h-7" />,
  Vite: <SiVite className="text-blue-400 w-7 h-7" />,

  Redux: <SiRedux className="text-purple-600 w-7 h-7" />,
  'React Query': <SiReactquery className="text-blue-500 w-7 h-7" />,
  'React Hook Form': <SiReacthookform className="text-blue-400 w-7 h-7" />,
  Jest: <SiJest className="text-red-500 w-7 h-7" />,
  Cypress: <SiCypress className="text-green-600 w-7 h-7" />,
  Git: <SiGit className="text-red-500 w-7 h-7" />,
  'GitHub Actions': <SiGithubactions className="text-purple-700 w-7 h-7" />,
  Docker: <SiDocker className="text-blue-500 w-7 h-7" />,
  Kubernetes: <SiKubernetes className="text-blue-600 w-7 h-7" />,

  Vercel: <SiVercel className="text-black w-7 h-7" />,
  GraphQL: <SiGraphql className="text-pink-500 w-7 h-7" />,

  Bootstrap: <SiBootstrap className="text-purple-600 w-7 h-7" />,
  TailwindCSS: <SiTailwindcss className="text-sky-400 w-7 h-7" />,

  // Databases / Backend
  Nodejs: <SiNodedotjs className="text-green-500 w-7 h-7" />,
  MySQL: <SiMysql className="text-blue-500 w-7 h-7" />,
  PostgreSQL: <BiLogoPostgresql className="text-blue-700 w-7 h-7" />,
  Sqlite: <SiSqlite className="text-gray-400 w-7 h-7" />,
  Prisma: <SiPrisma className="text-slate-700 w-7 h-7" />,
  Supabase: <SiSupabase className="text-green-600 w-7 h-7" />,

  // Design
  Figma: <SiFigma className="text-pink-500 w-7 h-7" />,
  Canva: <SiCanva className="text-sky-500 w-7 h-7" />,
  'Adobe Photoshop': <SiAdobephotoshop className="text-blue-400 w-7 h-7" />,
  Blender: <SiBlender className="text-orange-500 w-7 h-7" />,
  Framer: <SiFramer className="text-purple-600 w-7 h-7" />,

  // Technical
  WordPress: <SiWordpress className="text-blue-500 w-7 h-7" />,
  'Ethical Hacking': <FaHackerNews className="text-red-500 w-7 h-7" />,

  // Default fallback
  default: <FaDatabase className="text-gray-400 w-7 h-7" />,
};

const Skills = () => {
  usePageView('Skills & Technologies');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await supabase.from('skills').select('*').order('category', { ascending: true });
        setSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const getSkillLevel = (level: string) => {
    switch (level) {
      case 'beginner': return 25;
      case 'intermediate': return 50;
      case 'advanced': return 75;
      case 'expert': return 100;
      default: return 50;
    }
  };

  const getSkillColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-blue-600';
      case 'expert': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16 mt-8">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Skills & Technologies</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A comprehensive overview of my technical skills and experience levels
          </p>
        </header>

        <div className="space-y-20">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <section key={category}>
              <h2 className="text-2xl font-bold text-foreground mb-8 border-b border-border pb-2 capitalize">
                {category} Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categorySkills.map((skill) => (
                  <Card
                    key={skill.id}
                    className="transform transition-transform hover:scale-[1.03] hover:shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                          <span className="flex-shrink-0">{skillIcons[skill.name] || skillIcons.default}</span>
                          <span>{skill.name}</span>
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={`${getSkillColor(skill.level)} text-white border-none px-3 py-1 text-sm font-semibold`}
                        >
                          {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-muted-foreground">Proficiency</span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {getSkillLevel(skill.level)}%
                            </span>
                          </div>
                          <Progress value={getSkillLevel(skill.level)} className="h-2 rounded-lg" />
                        </div>
                        {skill.years_experience !== null && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground font-medium">
                            <span>Experience:</span>
                            <span>
                              {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
