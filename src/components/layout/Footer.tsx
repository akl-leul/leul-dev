import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  is_external: boolean;
  section: string | null;
}

interface FooterSection {
  title: string;
  links: NavigationItem[];
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerLinks, setFooterLinks] = useState<FooterSection[]>([]);

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  const fetchFooterLinks = async () => {
    try {
      const { data } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('location', 'footer')
        .eq('is_visible', true)
        .order('display_order');

      if (data) {
        // Group by section
        const sections: { [key: string]: NavigationItem[] } = {};
        data.forEach((item) => {
          const section = item.section || 'Links';
          if (!sections[section]) {
            sections[section] = [];
          }
          sections[section].push(item);
        });

        const formattedSections = Object.entries(sections).map(([title, links]) => ({
          title,
          links,
        }));

        setFooterLinks(formattedSections);
      }
    } catch (error) {
      console.error('Error fetching footer links:', error);
    }
  };

  const socialLinks = [
    { 
      name: 'GitHub', 
      href: 'https://github.com/akl-leul', 
      icon: Github 
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com/in/leul-ayfokru', 
      icon: Linkedin 
    },
    { 
      name: 'Twitter', 
      href: 'https://x.com/LAyfokru44401?t=5FkoLuXg7Z_1KaUzneFbGQ&s=09', 
      icon: FaXTwitter
    },
    { 
      name: 'Email', 
      href: 'mailto:layfokru@gmail.com', 
      icon: Mail 
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
                   <Link 
  to="/" 
  className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-logo tracking-wide hover:opacity-80 transition duration-300"
>
  Leul Dev
</Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                A passionate developer creating digital experiences and sharing knowledge 
                through code, design, and writing.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      {link.is_external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Portfolio. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center mt-4 md:mt-0">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by Leul
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;