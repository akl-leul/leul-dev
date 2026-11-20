import { useState, useEffect } from 'react';
import { Link, useLocation } from '@/lib/router-compat';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationItem { id: string; label: string; href: string; is_external: boolean; }

const pad = (n: number) => String(n + 1).padStart(2, '0');

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();

  useEffect(() => {
    supabase.from('navigation_items').select('*').eq('location', 'navbar').eq('is_visible', true).order('display_order')
      .then(({ data }) => data && setNavigation(data));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [isMenuOpen]);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div className={`mx-auto transition-all duration-300 pointer-events-auto ${scrolled ? 'max-w-5xl mt-3 px-3' : 'max-w-7xl mt-0 px-0'}`}>
        <div className={`relative flex h-14 items-center justify-between gap-4 px-4 sm:px-6 border border-border bg-background/75 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'rounded-full shadow-lg' : 'rounded-none border-x-0 border-t-0'}`}>
          {/* Logo */}
          <Link to="/" aria-label={`${settings.site_name} — home`} className="flex items-center gap-2 text-foreground shrink-0">
            <span aria-hidden className="grid place-items-center h-7 w-7 border border-foreground text-[11px] font-bold bp-mono">
              {settings.site_name?.charAt(0) || 'L'}
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.25em] hidden sm:inline" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {settings.site_name}
            </span>
          </Link>

          {/* Desktop navigation: numbered pill with sliding indicator */}
          <nav aria-label="Main" className="hidden md:flex items-center">
            <ul className="flex items-center gap-1">
              {navigation.map((item, i) => {
                const active = !item.is_external && isActive(item.href);
                const inner = (
                  <>
                    {active && (
                      <motion.span layoutId="nav-pill" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-foreground" />
                    )}
                    <span className={`relative flex items-baseline gap-1.5 ${active ? 'text-background' : ''}`}>
                      <span className="bp-mono text-[9px] opacity-60">{pad(i)}</span>
                      <span className="bp-mono text-[11px] uppercase tracking-widest">{item.label}</span>
                    </span>
                  </>
                );
                const cls = 'relative block px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
                return (
                  <li key={item.id}>
                    {item.is_external
                      ? <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                      : <Link to={item.href} className={cls} aria-current={active ? 'page' : undefined}>{inner}</Link>}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu"><User className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/admin"><User className="mr-2 h-4 w-4" />Admin Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile: animated two-line burger */}
            <button
              type="button"
              className="md:hidden relative h-11 w-11 grid place-items-center"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`absolute h-px w-6 bg-foreground transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-px w-6 bg-foreground transition-transform duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 1.75rem)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 2.5rem) 1.75rem)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 1.75rem)' }}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.65, 0, 0.35, 1] }}
            style={{ backgroundColor: "hsl(var(--background))" }}
            className="md:hidden fixed inset-0 top-14 pointer-events-auto flex flex-col"
          >
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 pt-8">
              <ul className="space-y-1">
                {navigation.map((item, i) => {
                  const active = !item.is_external && isActive(item.href);
                  const cls = `group flex items-baseline gap-4 py-3 border-b border-border ${active ? 'text-foreground' : 'text-muted-foreground'}`;
                  const inner = (
                    <>
                      <span className="bp-mono text-xs w-6">{pad(i)}</span>
                      <span className="text-4xl font-light uppercase tracking-tight flex-1" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{item.label}</span>
                      {active ? <span className="h-2 w-2 rounded-full bg-foreground" aria-hidden /> : <ArrowUpRight className="h-5 w-5 opacity-50" aria-hidden />}
                    </>
                  );
                  return (
                    <motion.li key={item.id} initial={reduce ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                      {item.is_external
                        ? <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                        : <Link to={item.href} className={cls} aria-current={active ? 'page' : undefined}>{inner}</Link>}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <div className="px-6 py-5 border-t border-border flex justify-between bp-mono text-[10px] tracking-widest text-muted-foreground">
              <span>{settings.site_name}</span><span>© {new Date().getFullYear()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
