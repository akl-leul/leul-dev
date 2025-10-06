import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Eye, Heart, FileText, FolderOpen, Mail, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

interface PageView {
  page_path: string;
  created_at: string;
}

interface Analytics {
  totalProjects: number;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalContacts: number;
  totalComments: number;
}

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageViews();
  }, []);

  const fetchPageViews = async () => {
    try {
      const { data } = await supabase
        .from('page_views')
        .select('page_path, created_at')
        .order('created_at', { ascending: false });

      setPageViews(data || []);
    } catch (error) {
      console.error('Error fetching page views:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process page views by date (last 7 days)
  const viewsByDate = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const count = pageViews.filter(v => {
      const viewDate = startOfDay(new Date(v.created_at));
      return viewDate.getTime() === date.getTime();
    }).length;
    return {
      date: format(date, 'MMM dd'),
      views: count,
    };
  });

  // Process views by page
  const viewsByPage = pageViews.reduce((acc: Record<string, number>, view) => {
    const path = view.page_path || 'Unknown';
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {});

  const pageViewsData = Object.entries(viewsByPage)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

  const stats = [
    { label: 'Total Views', value: analytics.totalViews, icon: Eye, color: 'text-blue-600' },
    { label: 'Projects', value: analytics.totalProjects, icon: FolderOpen, color: 'text-purple-600' },
    { label: 'Blog Posts', value: analytics.totalPosts, icon: FileText, color: 'text-green-600' },
    { label: 'Total Likes', value: analytics.totalLikes, icon: Heart, color: 'text-red-600' },
    { label: 'Messages', value: analytics.totalContacts, icon: Mail, color: 'text-orange-600' },
    { label: 'Page Views', value: pageViews.length, icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views over time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pageViewsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pageViewsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Page Views Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Page Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-muted-foreground">Page</th>
                  <th className="text-left py-2 px-4 text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.slice(0, 10).map((view, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 px-4">{view.page_path}</td>
                    <td className="py-2 px-4 text-muted-foreground">
                      {format(new Date(view.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
