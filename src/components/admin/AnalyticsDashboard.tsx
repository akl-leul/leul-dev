import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Eye, Heart, FileText, FolderOpen, Mail, TrendingUp, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => {
    fetchPageViews();
  }, []);

  const fetchPageViews = async () => {
    try {
      const { data } = await supabase
        .from('page_views')
        .select('page_path, created_at, ip_address, device_type, browser, os, country, city, user_agent')
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

  // Process device analytics
  const deviceAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const device = view.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const deviceData = Object.entries(deviceAnalytics)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

  const stats = [
    { 
      label: 'Total Views', 
      value: analytics.totalViews, 
      icon: Eye, 
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    { 
      label: 'Projects', 
      value: analytics.totalProjects, 
      icon: FolderOpen, 
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    { 
      label: 'Blog Posts', 
      value: analytics.totalPosts, 
      icon: FileText, 
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    { 
      label: 'Total Likes', 
      value: analytics.totalLikes, 
      icon: Heart, 
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    { 
      label: 'Messages', 
      value: analytics.totalContacts, 
      icon: Mail, 
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200'
    },
    { 
      label: 'Page Views', 
      value: pageViews.length, 
      icon: TrendingUp, 
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Last updated: {format(new Date(), 'MMM dd, yyyy')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views over time */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-blue-800">Views Over Time (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card className="shadow-lg border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardTitle className="text-purple-800">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-green-800">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Country Analytics */}
        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardTitle className="text-orange-800">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {countryData.slice(0, 5).map((country, index) => (
                <div key={country.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-700">{country.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                    {country.value} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Page Views Table */}
      <Card className="shadow-lg border-2 border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="text-indigo-800">Recent Page Views with IP Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-indigo-200">
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">Page</th>
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">IP Address</th>
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">Device</th>
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">Browser</th>
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">Location</th>
                  <th className="text-left py-3 px-4 text-indigo-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.slice(0, 15).map((view, index) => (
                  <tr key={index} className="border-b border-indigo-100 hover:bg-indigo-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{view.page_path}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {view.ip_address || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {view.device_type === 'mobile' && <Smartphone className="h-4 w-4 text-green-600" />}
                        {view.device_type === 'desktop' && <Monitor className="h-4 w-4 text-blue-600" />}
                        {view.device_type === 'tablet' && <Tablet className="h-4 w-4 text-purple-600" />}
                        <span className="text-sm font-medium capitalize">{view.device_type || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {view.browser || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">
                          {view.city && view.country 
                            ? `${view.city}, ${view.country}` 
                            : view.country || 'Unknown'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(view.created_at), 'MMM dd, HH:mm')}
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
