import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, Heart, FileText, FolderOpen, Mail, TrendingUp, Globe, Smartphone, Monitor, Tablet, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageView {
  page_path: string;
  created_at: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  user_agent?: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPageViews();
    // Refresh page views every 30 seconds to show real-time updates
    const interval = setInterval(fetchPageViews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPageViews = async () => {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('page_path, created_at, ip_address, device_type, browser, os, country, city, user_agent')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching page views:', error);
      } else {
        setPageViews(data || []);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching page views:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPageViews();
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
    .slice(0, 10);

  // Process device analytics
  const deviceAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const device = view.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const deviceData = Object.entries(deviceAnalytics)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Process browser analytics
  const browserAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const browser = view.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  const browserData = Object.entries(browserAnalytics)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Process country analytics
  const countryAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const country = view.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countryData = Object.entries(countryAnalytics)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#06b6d4', '#84cc16', '#f97316'];

  const stats = [
    { 
      label: 'Total Views', 
      value: analytics.totalViews, 
      icon: Eye, 
    },
    { 
      label: 'Projects', 
      value: analytics.totalProjects, 
      icon: FolderOpen, 
    },
    { 
      label: 'Blog Posts', 
      value: analytics.totalPosts, 
      icon: FileText, 
    },
    { 
      label: 'Total Likes', 
      value: analytics.totalLikes, 
      icon: Heart, 
    },
    { 
      label: 'Messages', 
      value: analytics.totalContacts, 
      icon: Mail, 
    },
    { 
      label: 'Page Views', 
      value: pageViews.length,
      icon: TrendingUp, 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into your website performance</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {format(lastUpdate, 'HH:mm:ss')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views over time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Views Over Time (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsByDate}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No device data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pageViewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageViewsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No page view data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {countryData.length > 0 ? countryData.map((country, index) => (
                <div key={country.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{country.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {country.value} views
                  </Badge>
                </div>
              )) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No country data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browser Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Browser Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {browserData.length > 0 ? browserData.map((browser) => (
              <div key={browser.name} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{browser.value}</div>
                <div className="text-sm text-muted-foreground">{browser.name}</div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No browser data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Page Views Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Page Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Page</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Device</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Browser</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.slice(0, 20).map((view, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{view.page_path}</td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {view.ip_address || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {view.device_type === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {view.device_type === 'desktop' && <Monitor className="h-4 w-4" />}
                        {view.device_type === 'tablet' && <Tablet className="h-4 w-4" />}
                        <span className="text-sm capitalize">{view.device_type || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {view.browser || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <span className="text-sm">
                        {view.city && view.country 
                          ? `${view.city}, ${view.country}` 
                          : view.country || 'Unknown'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(view.created_at), 'MMM dd, HH:mm')}
                    </td>
                  </tr>
                ))}
                {pageViews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No page views recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
