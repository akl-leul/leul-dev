import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingChatButton from '@/components/FloatingChatButton';
import { MetaTags } from '@/components/MetaTags';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <MetaTags />
      
      <div className="relative flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      
      <FloatingChatButton />
    </div>
  );
};

export default Layout;
