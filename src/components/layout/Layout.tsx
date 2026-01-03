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
    <div className="min-h-screen flex flex-col">
      <MetaTags />
      <Header />
      <main className="flex-1 ">
        {children}
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};

export default Layout;