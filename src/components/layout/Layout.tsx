import { ReactNode, Suspense, lazy } from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingChatButton from '@/components/FloatingChatButton';
import { MetaTags } from '@/components/MetaTags';
import { PerformanceProvider, usePerformance } from '@/contexts/PerformanceContext';

// Lazy load Three.js scene for better performance
const ThreeScene = lazy(() => import('@/components/ThreeScene'));

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { settings, isEnabled } = usePerformance();
  
  return (
    <div className="min-h-screen flex flex-col relative">
      <MetaTags />
      
      {/* Global 3D Scene Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Suspense fallback={null}>
          <ThreeScene performanceSettings={settings} enabled={isEnabled} />
        </Suspense>
      </div>
      
      {/* Content layer */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      
      <FloatingChatButton />
    </div>
  );
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <PerformanceProvider>
      <LayoutContent>{children}</LayoutContent>
    </PerformanceProvider>
  );
};

export default Layout;
