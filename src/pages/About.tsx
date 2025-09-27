import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Download, MapPin, Mail, ExternalLink, Calendar, Twitter } from 'lucide-react';
import { format } from 'date-fns';
import { FaXTwitter} from "react-icons/fa6";
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
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .single();

        if (profileData) {
          setProfile({ ...defaultProfile, ...profileData });
        }

        // Fetch experiences
        const { data: experiencesData } = await supabase
          .from('experiences')
          .select('*')
          .order('start_date', { ascending: false });

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
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Me
            </h1>
            <p className="text-xl text-muted-foreground">
              Get to know more about my journey, experience, and passion for development
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {profile.name}
                  </h2>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${profile.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  <Button className="mt-4" asChild>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  </Button>

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 mt-6">
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                       <FaXTwitter className="h-4 w-4" />  
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className='text-muted-foreground leading-relaxed'>
                      Full stack website and application developer 
                    </p> <br />
                    <p className="text-muted-foreground leading-relaxed">
                      I'm a passionate full-stack developer with a love for creating elegant solutions 
to complex problems. With several years of experience in web development, I enjoy 
working with modern technologies and frameworks to build scalable, user-friendly applications.
<br /><br />
When I'm not coding, you can find me exploring new technologies, contributing to 
open-source projects, or sharing my knowledge through blog posts and tutorials. 
I believe in continuous learning and staying up-to-date with the latest trends 
in web development.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Experience Section */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Work Experience</h2>
            
            {experiences.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No work experience added yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className=" grid md:grid-cols-2 gap-4 ms:grid-cols-1">
                {experiences.map((experience) => (
                  <Card key={experience.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {experience.role}
                          </h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {experience.company_url ? (
                              <a
                                href={experience.company_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {experience.company}
                              </a>
                            ) : (
                              <span className="font-medium">{experience.company}</span>
                            )}
                            {experience.location && (
                              <>
                                <span>•</span>
                                <span>{experience.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 md:mt-0">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(experience.start_date)} - {' '}
                            {experience.current || !experience.end_date 
                              ? 'Present' 
                              : formatDate(experience.end_date)
                            }
                          </span>
                        </div>
                      </div>

                      {experience.description && (
                        <p className="text-muted-foreground mb-4">
                          {experience.description}
                        </p>
                      )}

                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-foreground mb-2">Key Achievements:</h4>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {experience.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {experience.tech_used && experience.tech_used.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Technologies Used:</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.tech_used.map((tech) => (
                              <Badge key={tech} variant="secondary">
                                {tech}
                              </Badge>
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
    </div>
  );
};

export default About;
