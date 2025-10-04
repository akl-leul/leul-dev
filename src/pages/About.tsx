import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Download, MapPin, Mail, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { FaXTwitter } from "react-icons/fa6";

interface Profile {
  name: string;
  bio: string;
  location: string;
  email: string;
  website: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  resume_url: string;
  avatar_url: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  company_url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string | null;
  achievements: string[] | null;
  tech_used: string[] | null;
}

const defaultProfile: Profile = {
  name: 'Leul Ayfokru',
  bio: 'Full-stack Website and Application Developer',
  location: 'Addis Ababa, Ethiopia',
  email: 'layfokru@gmail.com',
  website: 'https://leul-dev.vercel.app',
  github_url: 'https://github.com/akl-leul',
  linkedin_url: 'https://linkedin.com/in/leul-ayfokru',
  twitter_url: 'https://x.com/LAyfokru44401?t=5FkoLuXg7Z_1KaUzneFbGQ&s=09',
  resume_url: 'https://leul-dev.vercel.app/about',
  avatar_url: 'https://gcxqcxrshrfzuhyhfciv.supabase.co/storage/v1/object/public/project-images/avatars/0282d3df-966e-4c01-afcf-a7d3e88642ca-1757474473335.jpg',
};

const About = () => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').single();
        if (profileData) setProfile({ ...defaultProfile, ...profileData });

        const { data: experiencesData } = await supabase.from('experiences').select('*').order('start_date', { ascending: false });
        setExperiences(experiencesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">About Me</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get to know more about my journey, experience, and passion for development
          </p>
        </div>

        {/* Profile and socials */}
        <div className="grid lg:grid-cols-3 gap-10 mb-20">
          <Card className="rounded-lg shadow-md">
            <div className="p-6 text-center">
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h2>
              
              <div className="space-y-3 text-muted-foreground text-sm mt-3">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <a href={`mailto:${profile.email}`} className="hover:text-indigo-700 transition-colors">{profile.email}</a>
                </div>
              </div>

              <Button className="mt-6 w-full" asChild>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Download Resume</span>
                </a>
              </Button>

              <div className="flex justify-center gap-5 mt-8">
                <SocialButton url={profile.website} icon={<ExternalLink className="h-5 w-5" />} />
                <SocialButton url={profile.github_url} icon={<GithubIcon />} />
                <SocialButton url={profile.linkedin_url} icon={<LinkedinIcon />} />
                <SocialButton url={profile.twitter_url} icon={<FaXTwitter className="h-5 w-5" />} />
              </div>
            </div>
          </Card>

          {/* Story */}
          <div className="lg:col-span-2">
            <Card className="rounded-lg shadow-md">
              <CardHeader>
                <CardTitle>My Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Full stack website and application developer
                </p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  I'm a passionate full-stack developer with a love for creating elegant solutions to complex problems. With several years of experience in web development, I enjoy working with modern technologies and frameworks to build scalable, user-friendly applications.
                  
                  {"\n\n"}
                  When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing my knowledge through blog posts and tutorials. I believe in continuous learning and staying up-to-date with the latest trends in web development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Experience Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Work Experience</h2>
          {experiences.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">No work experience added yet.</CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {experiences.map((exp) => (
                <Card key={exp.id} className="rounded-lg shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">{exp.role}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          {exp.company_url ? (
                            <a
                              href={exp.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-indigo-600 transition-colors"
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <span className="font-medium">{exp.company}</span>
                          )}
                          {exp.location && (
                            <>
                              <span>•</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 md:mt-0">
                        <Calendar className="h-5 w-5" />
                        <span>
                          {formatDate(exp.start_date)} - {exp.current || !exp.end_date ? 'Present' : formatDate(exp.end_date)}
                        </span>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-muted-foreground mb-4">{exp.description}</p>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-foreground mb-2">Key Achievements:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {exp.achievements.map((ach, idx) => (
                            <li key={idx}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exp.tech_used && exp.tech_used.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Technologies Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.tech_used.map((tech) => (
                            <Badge key={tech} variant="secondary" className="bg-indigo-100 text-indigo-700 border-none">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const SocialButton = ({ url, icon }: { url: string; icon: JSX.Element }) => (
  <Button variant="outline" size="icon" asChild>
    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
      {icon}
    </a>
  </Button>
);

const GithubIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.207 11.388.599.112.793-.262.793-.58v-2.164C6.144 20.09 5.473 18.63 5.473 18.63c-.546-1.38-1.333-1.75-1.333-1.75-1.09-.744.083-.73.083-.73 1.205.086 1.838 1.238 1.838 1.238 1.07 1.832 2.807 1.304 3.492 1 .107-.78.42-1.306.763-1.607-2.664-.307-5.467-1.336-5.467-5.933 0-1.31.467-2.38 1.236-3.22-.125-.303-.535-1.526.118-3.178 0 0 1.008-.322 3.3 1.23a11.485 11.485 0 013.003-.404c1.02.005 2.047.14 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.243 2.875.118 3.178.77.84 1.235 1.91 1.235 3.22 0 4.6-2.807 5.625-5.48 5.932.43.372.823 1.106.823 2.235v3.313c0 .32.192.695.8.58C20.565 21.8 24 17.303 24 12c0-6.63-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.028-3.037-1.853-3.037-1.85 0-2.136 1.444-2.136 2.939v5.667h-3.563V9h3.561v1.561h.045c.478-.9 1.637-1.85 3.37-1.85 3.6 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.064-.926-2.064-2.065 0-1.138.92-2.063 2.064-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.018H3.557V9H7.12v11.451zM22.225 0H1.77C.79 0 0 .774 0 1.729v20.542C0 23.228.79 24 1.77 24h20.453C23.206 24 24 23.228 24 22.271V1.729C24 .774 23.206 0 22.225 0z" />
  </svg>
);

export default About;
