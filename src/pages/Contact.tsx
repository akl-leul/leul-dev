import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle, Card3DDescription } from '@/components/ui/card-3d';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePageView } from '@/hooks/usePageView';
import { Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  usePageView('Contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [pageContent, setPageContent] = useState({
    title: 'Get In Touch',
    description: "Have a project in mind or just want to chat? I'd love to hear from you!"
  });
  const [contactInfo, setContactInfo] = useState({
    email: 'layfokru@gmail.com',
    phone: '+251963889227',
    location: 'Addis Ababa, Ethiopia'
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data: content } = await supabase
        .from('contact_content')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (content) {
        setPageContent({
          title: content.title || 'Get In Touch',
          description: content.description || "Have a project in mind or just want to chat? I'd love to hear from you!"
        });
        setContactInfo({
          email: content.email || contactInfo.email,
          phone: content.phone || contactInfo.phone,
          location: content.location || contactInfo.location
        });
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, location')
          .limit(1)
          .maybeSingle();
        
        if (profile) {
          setContactInfo(prev => ({
            ...prev,
            email: profile.email || prev.email,
            location: profile.location || prev.location
          }));
        }
      }
    };
    fetchContactInfo();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert([data]);
      if (error) throw error;
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: contactInfo.email },
    { icon: Phone, label: 'Phone', value: contactInfo.phone },
    { icon: MapPin, label: 'Location', value: contactInfo.location },
  ];

  return (
    <main className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <motion.header 
          className="text-center mb-12 sm:mb-16 mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-4">
            {pageContent.title}
          </h1>
          <p className="max-w-xl mx-auto text-lg sm:text-xl text-muted-foreground">
            {pageContent.description}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <motion.section 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {contactItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card3D className="h-full">
                  <Card3DContent className="p-6 flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.value}</p>
                    </div>
                  </Card3DContent>
                </Card3D>
              </motion.div>
            ))}
          </motion.section>

          {/* Contact Form */}
          <motion.section 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card3D>
              <Card3DHeader>
                <Card3DTitle className="text-2xl">Send Me a Message</Card3DTitle>
                <Card3DDescription>
                  Fill out the form below and I'll get back to you as soon as possible
                </Card3DDescription>
              </Card3DHeader>
              <Card3DContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-foreground">
                        Name *
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Your full name"
                        className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-foreground">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your.email@example.com"
                        className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      {...register('subject')}
                      placeholder="What's this about?"
                      className={errors.subject ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-foreground">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Tell me about your project or just say hello..."
                      rows={6}
                      className={errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card3DContent>
            </Card3D>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
