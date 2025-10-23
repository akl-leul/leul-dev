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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPageViews();
    // Refresh page views every 30 seconds to show real-time updates
    const interval = setInterval(fetchPageViews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPageViews = async () => {
    try {
      const { data } = await supabase
        .from('page_views')
        .select('page_path, created_at, ip_address, device_type, browser, os, country, city, user_agent')
        .order('created_at', { ascending: false });

      setPageViews(data || []);
      setLastUpdate(new Date()); // Update the last update time
    } catch (error) {
      console.error('Error fetching page views:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process page views by date (last 7 days) - REAL DATA ONLY
  const viewsByDate = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const count = pageViews.filter(v => {
      const viewDate = startOfDay(new Date(v.created_at));
      return viewDate.getTime() === date.getTime();
    }).length;
    return {
      date: format(date, 'MMM dd'),
      views: count, // REAL DATA ONLY
    };
  });

  // Process views by page
  const viewsByPage = pageViews.reduce((acc: Record<string, number>, view) => {
    const path = view.page_path || 'Unknown';
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {});

  const pageViewsData = Object.entries(viewsByPage)
    .map(([name, value]) => ({ name, value })) // REAL DATA ONLY
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Show top 10 pages

  // Process device analytics
  const deviceAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const device = view.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const deviceData = Object.entries(deviceAnalytics)
    .map(([name, value]) => ({ name, value })) // REAL DATA ONLY
    .sort((a, b) => b.value - a.value);

  // Process country analytics
  const countryAnalytics = pageViews.reduce((acc: Record<string, number>, view) => {
    const country = view.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countryData = Object.entries(countryAnalytics)
    .map(([name, value]) => ({ name, value })) // REAL DATA ONLY
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Show top 10 countries

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
      value: pageViews.length, // REAL PAGE VIEWS COUNT FROM DATABASE
      icon: TrendingUp, 
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          📊 Analytics Dashboard
        </h2>
        <p className="text-gray-600 text-lg">Comprehensive insights into your website performance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`${stat.bgColor} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.label}</CardTitle>
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {stat.label === 'Page Views' ? pageViews.length.toLocaleString() : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                {stat.label === 'Page Views' 
                  ? `Live count • Updated every 30s • Last updated: ${format(lastUpdate, 'HH:mm:ss')}`
                  : `Last updated: ${format(new Date(), 'MMM dd, yyyy')}`
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views over time */}
        <Card className="shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
            <CardTitle className="text-blue-800 text-xl font-bold flex items-center gap-2">
              📈 Views Over Time (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={viewsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 10, stroke: '#3b82f6', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card className="shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 text-xl font-bold flex items-center gap-2">
              📱 Device Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
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
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <Card className="shadow-xl border-2 border-green-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
            <CardTitle className="text-green-800 text-xl font-bold flex items-center gap-2">
              🌐 Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Country Analytics */}
        <Card className="shadow-xl border-2 border-orange-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
            <CardTitle className="text-orange-800 text-xl font-bold flex items-center gap-2">
              🌍 Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {countryData.slice(0, 10).map((country, index) => ( // Show top 10 countries
                <div key={country.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <Globe className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-gray-800">{country.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800 px-3 py-1 text-sm font-semibold">
                    {country.value} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Page Views Table */}
      <Card className="shadow-xl border-2 border-indigo-100 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-indigo-200">
          <CardTitle className="text-indigo-800 text-xl font-bold flex items-center gap-2">
            🔍 Recent Page Views with IP Addresses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-indigo-200">
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">Page</th>
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">IP Address</th>
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">Device</th>
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">Browser</th>
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">Location</th>
                  <th className="text-left py-4 px-4 text-indigo-700 font-bold text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.slice(0, 10).map((view, index) => ( // Show top 10 latest views
                  <tr key={index} className="border-b border-indigo-100 hover:bg-indigo-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-800">{view.page_path}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        {view.ip_address || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {view.device_type === 'mobile' && <Smartphone className="h-5 w-5 text-green-600" />}
                        {view.device_type === 'desktop' && <Monitor className="h-5 w-5 text-blue-600" />}
                        {view.device_type === 'tablet' && <Tablet className="h-5 w-5 text-purple-600" />}
                        <span className="text-sm font-semibold capitalize">{view.device_type || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                        {view.browser || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">
                          {view.city && view.country 
                            ? `${view.city}, ${view.country}` 
                            : view.country || 'Unknown'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium">
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
