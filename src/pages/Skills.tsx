import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

// React Icons (add more as needed)
import { 
  SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiNodedotjs, SiPython, 
  SiTailwindcss, SiHtml5, SiCss3, SiMysql, SiPostgresql, SiSqlite, SiPrisma,
  SiSupabase, SiFigma, SiAdobephotoshop, SiCanva, SiBlender, SiFramer,
  SiWordpress, SiBootstrap, SiReacthookform, SiReactquery, SiVite, SiSass, SiRedux, SiJest, SiCypress, SiGit, SiGithubactions, SiDocker, SiKubernetes, SiVercel, SiPrismic, SiContentful, SiStrapi, SiSanity, SiGraphql 
} from 'react-icons/si';
import { FaLaptopCode, FaDatabase, FaHackerNews } from 'react-icons/fa';
import { BiLogoTypescript, BiLogoPostgresql } from 'react-icons/bi';
import { TbBrandNextjs, TbBrandPrisma } from 'react-icons/tb';
import { PiFileSql } from 'react-icons/pi';  
interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
  years_experience: number | null;
  icon: string | null;
}

// Map skill names to icons
const skillIcons: Record<string, JSX.Element> = {
  // Programming / Language
  JavaScript: <SiJavascript className="text-yellow-400" />,
  TypesScript: <BiLogoTypescript className="text-blue-600" />,
  Python: <SiPython className="text-blue-400" />,
  HTML5: <SiHtml5 className="text-orange-500" />,
  CSS3: <SiCss3 className="text-blue-500" />,
  React: <SiReact className="text-cyan-400" />,
  'React Native': <SiReact className="text-cyan-500" />,
  Next.js: <TbBrandNextjs className="text-black" />,
  Vite: <SiVite className="text-blue-400" />,
  
  Redux: <SiRedux className="text-purple-600" />,
  'React Query': <SiReactquery className="text-blue-500" />,
  'React Hook Form': <SiReacthookform className="text-blue-400" />,
  Jest: <SiJest className="text-red-500" />,
  Cypress: <SiCypress className="text-green-600" />,
  Git: <SiGit className="text-red-500" />,
  'GitHub Actions': <SiGithubactions className="text-purple-700" />,
  Docker: <SiDocker className="text-blue-500" />,
  Kubernetes: <SiKubernetes className="text-blue-600" />,
  
  Vercel: <SiVercel className="text-black" />,
  GraphQL: <SiGraphql className="text-pink-500" />,
  
  Bootstrap: <SiBootstrap className="text-purple-600" />,
  TailwindCSS: <SiTailwindcss className="text-sky-400" />,

  // Databases / Backend
  Nodejs: <SiNodedotjs className="text-green-500" />,
  MySQL: <SiMysql className="text-blue-500" />,
  PostgreSQL: <BiLogoPostgresql className="text-blue-700" />,
  Sqlite: <SiSqlite className="text-gray-400" />,
  Prisma: <SiPrisma className="text-slate-700" />,
  Supabase: <SiSupabase className="text-green-600" />,

  // Design
  Figma: <SiFigma className="text-pink-500" />,
  Canva: <SiCanva className="text-sky-500" />,
  'Adobe Photoshop': <SiAdobephotoshop className="text-blue-400" />,
  Blender: <SiBlender className="text-orange-500" />,
  Framer: <SiFramer className="text-purple-600" />,

  // Technical
  WordPress: <SiWordpress className="text-blue-500" />,
  'Ethical Hacking': <FaHackerNews className="text-red-500" />,

  // Default fallback
  default: <FaDatabase className="text-gray-400" />,
};

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await supabase
          .from('skills')
          .select('*')
          .order('category', { ascending: true });

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
      case 'advanced': return 'bg-blue-500';
      case 'expert': return 'bg-green-500';
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
    return <div>Loading skills...</div>;
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Skills & Technologies
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive overview of my technical skills and experience levels
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
                  {category} Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorySkills.map((skill) => (
                    <Card key={skill.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {skillIcons[skill.name] || skillIcons.default}
                            {skill.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`${getSkillColor(skill.level)} text-white border-none`}
                          >
                            {skill.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Proficiency</span>
                              <span className="text-sm text-muted-foreground">
                                {getSkillLevel(skill.level)}%
                              </span>
                            </div>
                            <Progress value={getSkillLevel(skill.level)} className="h-2" />
                          </div>

                          {skill.years_experience && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="font-medium">
                                {skill.years_experience}{' '}
                                {skill.years_experience === 1 ? 'year' : 'years'}
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
    </div>
  );
};

export default Skills;
