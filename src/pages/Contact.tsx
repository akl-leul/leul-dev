import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePageView } from '@/hooks/usePageView';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

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
  const [contactInfo, setContactInfo] = useState({
    email: 'layfokru@gmail.com',
    phone: '+251963889227',
    location: 'Addis Ababa, Ethiopia'
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
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

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16 mt-8">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
            Get In Touch
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Have a project in mind or just want to chat? I'd love to hear from you!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <section>
            <Card className="rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Contact Information</CardTitle>
                <CardDescription>
                  Feel free to reach out through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-0 pb-8">
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground break-words">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Form */}
          <section className="lg:col-span-2">
            <Card className="rounded-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Send Me a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and I'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Your full name"
                        className={`${errors.name ? 'border-red-600 focus:ring-red-600' : 'border-gray-300 focus:ring-indigo-500'} rounded-md shadow-sm w-full`}
                        aria-invalid={!!errors.name}
                        aria-describedby="name-error"
                      />
                      {errors.name && (
                        <p id="name-error" className="text-sm text-red-600 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your.email@example.com"
                        className={`${errors.email ? 'border-red-600 focus:ring-red-600' : 'border-gray-300 focus:ring-indigo-500'} rounded-md shadow-sm w-full`}
                        aria-invalid={!!errors.email}
                        aria-describedby="email-error"
                      />
                      {errors.email && (
                        <p id="email-error" className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      {...register('subject')}
                      placeholder="What's this about?"
                      className={`${errors.subject ? 'border-red-600 focus:ring-red-600' : 'border-gray-300 focus:ring-indigo-500'} rounded-md shadow-sm w-full`}
                      aria-invalid={!!errors.subject}
                      aria-describedby="subject-error"
                    />
                    {errors.subject && (
                      <p id="subject-error" className="text-sm text-red-600 mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Tell me about your project or just say hello..."
                      rows={6}
                      className={`${errors.message ? 'border-red-600 focus:ring-red-600' : 'border-gray-300 focus:ring-indigo-500'} rounded-md shadow-sm w-full resize-y`}
                      aria-invalid={!!errors.message}
                      aria-describedby="message-error"
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-red-600 mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white font-semibold rounded-md shadow-md transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
