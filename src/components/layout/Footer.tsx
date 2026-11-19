import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from 'framer-motion';
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
  const reduceMotion = useReducedMotion();
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
    <footer className="border-t border-border relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16 border-b border-border">
          <div className="flex items-center justify-between gap-4 mb-8"><span className="bp-mono text-[10px] text-muted-foreground">NEXT CHAPTER / LET’S CONNECT</span><span aria-hidden="true" className="bp-mono text-[10px] text-muted-foreground">© {currentYear}</span></div>
          <Button asChild variant="link" className="h-auto p-0 text-4xl sm:text-6xl lg:text-8xl font-light text-foreground whitespace-normal no-underline hover:no-underline text-left justify-start gap-5">
            <Link to="/contact">Let’s build<br className="sm:hidden" /> something.<ArrowUpRight aria-hidden="true" className="!w-10 !h-10 md:!w-16 md:!h-16 shrink-0" /></Link>
          </Button>
        </div>
        <div className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
                   <Link 
  to="/" 
  className="flex items-center gap-2 text-2xl font-semibold uppercase text-foreground"
>
  Leul Dev
</Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                Code with intent. Engineering with curiosity.
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-2 mt-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Button asChild variant="outline" size="icon" key={social.name} className="rounded-none" title={social.name}><a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a></Button>
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
              © {currentYear} Leul Ayfokru
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0"><span className="bp-mono text-[10px] text-muted-foreground">END OF PAGE / NOT THE STORY</span><Button variant="outline" size="icon" title="Back to top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })}><ArrowUp aria-hidden="true" /></Button></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;