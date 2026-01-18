import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setAccessDenied(true);
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Authenticated",
        description: "Welcome back to your command center.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-[#030712] dark:via-[#0a0f1c] dark:to-[#111827] selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 dark:bg-indigo-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/10 dark:bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Fullscreen Access Denied Overlay */}
      <AnimatePresence>
        {accessDenied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 dark:bg-black/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-500/50">
                  <AlertTriangle className="h-14 w-14 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white dark:text-gray-100">Access Denied</h1>
              <p className="text-slate-300 dark:text-gray-300 text-lg max-w-md mx-auto">
                Unauthorized attempt detected. Please verify your credentials or contact system administrator.
              </p>
              <Button
                onClick={() => setAccessDenied(false)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all"
              >
                Try Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="border border-gray-200/20 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] backdrop-blur-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/50 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pt-10 pb-6">
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/40 ring-4 ring-indigo-500/20 dark:ring-indigo-500/30"
            >
              <ShieldCheck className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400 text-base mt-2">
              Secure entry for Leul's Command Center
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500 dark:text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 bg-gray-50/80 dark:bg-white/10 border-gray-200/30 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/30 transition-all rounded-xl shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500 dark:text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Security Token"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-11 h-12 bg-gray-50/80 dark:bg-white/10 border-gray-200/30 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/30 transition-all rounded-xl shadow-inner"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 text-white font-semibold text-lg rounded-xl border-none shadow-lg shadow-indigo-500/30 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Initialize Session
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-10 text-center pt-6 border-t border-gray-200/30 dark:border-white/10">
              <p className="text-gray-600 dark:text-slate-500 text-sm tracking-wide">
                Proprietary Access. Authorized Personnel Only.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-gray-600 dark:text-slate-500 text-sm"
        >
          &copy; {new Date().getFullYear()} Leul Ayfokru. All Rights Reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;