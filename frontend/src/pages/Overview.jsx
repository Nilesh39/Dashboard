import React, { useState, useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';
import StatCard from '../components/StatCard';
import { 
  Users, 
  TrendingUp, 
  Tv, 
  BarChart3,
  Calendar,
  Sparkles,
  Grid,
  Bookmark,
  Film
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { analyticsApi, automationApi } from '../services/api';
import { formatMetric } from '../utils/formatters';

export default function Overview() {
  const { profile, reels } = useEdit();
  const { getCardClass, theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [liveGrowth, setLiveGrowth] = useState(0);

  // Load history data for charts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await analyticsApi.getHistory();
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [profile]); // Refetch when profile updates to reflect demo data generations

  // Live simulation tick on-screen representation
  useEffect(() => {
    let interval;
    const checkSimulation = async () => {
      try {
        const settingsRes = await automationApi.getSettings();
        if (settingsRes.data.simulation_active) {
          // Simulate dynamic UI counter increment every 2 seconds
          interval = setInterval(() => {
            const growthRate = settingsRes.data.growth_rate_followers_per_day || 100;
            const incPerTick = Math.max(1, Math.round(growthRate / 43200)); // ~2-second share of day
            setLiveGrowth(prev => prev + (Math.random() < 0.3 ? incPerTick : 0));
          }, 2000);
        }
      } catch (err) {
        console.error("Error initializing simulation tick:", err);
      }
    };

    checkSimulation();
    return () => clearInterval(interval);
  }, []);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-instagram-primary"></div>
        <p className="text-zinc-400 text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  // Compute stats
  const totalViews = reels.reduce((sum, reel) => sum + (reel.views || 0), 0);
  const engagementRate = profile.total_reach > 0 
    ? ((profile.total_engagement / profile.total_reach) * 100).toFixed(2)
    : '0.00';

  // Format history data for Recharts
  const chartData = history.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Followers: item.followers,
    Reach: item.reach,
    Engagement: item.engagement
  }));

  // If local edit state changed, overlay it on the last point of history to preview charts in real-time!
  if (chartData.length > 0) {
    chartData[chartData.length - 1].Followers = profile.followers_count + liveGrowth;
    chartData[chartData.length - 1].Reach = profile.total_reach;
    chartData[chartData.length - 1].Engagement = profile.total_engagement;
  }


  return (
    <div className="p-4 md:p-8">
      {/* Profile Info Row at the top */}
      <ProfileHeader />

      {/* Instagram Profile Tabs Row */}
      <div className="flex justify-center border-t border-[#262626] gap-12 md:gap-16 text-[11px] md:text-xs uppercase tracking-widest text-zinc-400 font-bold mb-8 select-none">
        <span className="flex items-center gap-1.5 py-4 border-t border-white text-white cursor-pointer">
          <Grid size={13} />
          <span>Posts</span>
        </span>
        <span className="flex items-center gap-1.5 py-4 cursor-pointer hover:text-white">
          <Film size={13} />
          <span>Reels</span>
        </span>
        <span className="flex items-center gap-1.5 py-4 cursor-pointer hover:text-white">
          <Bookmark size={13} />
          <span>Saved</span>
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Followers"
          value={profile.followers_count + liveGrowth}
          type="profile"
          field="followers_count"
          icon={Users}
          change={2.4}
          description="vs last 7 days"
        />
        <StatCard
          title="Total Reach"
          value={profile.total_reach}
          type="profile"
          field="total_reach"
          icon={TrendingUp}
          change={12.8}
          description="vs last 7 days"
        />
        <StatCard
          title="Total Engagement"
          value={profile.total_engagement}
          type="profile"
          field="total_engagement"
          icon={BarChart3}
          change={8.5}
          description="vs last 7 days"
        />
        <StatCard
          title="Reel Views"
          value={totalViews}
          type="profile"
          field="total_views"
          format={true}
          icon={Tv}
          change={15.2}
          description="accumulated across reels"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Followers Growth Chart */}
        <div className={`p-6 rounded-2xl ${getCardClass()} col-span-1 lg:col-span-2`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-md font-bold text-white">Followers Growth</h3>
              <p className="text-zinc-500 text-xs mt-1">Cumulative follower count history over 30 days.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-instagram-primary/10 text-instagram-primary font-semibold border border-instagram-primary/20">
              Live updates
            </span>
          </div>

          <div className="h-72 w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">Loading chart data...</div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No growth history available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.primaryColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={theme.primaryColor} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(tick) => formatMetric(tick)} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    itemStyle={{ color: theme.primaryColor }}
                    formatter={(value) => [formatMetric(value), "Followers"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Followers" 
                    stroke={theme.primaryColor} 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorFollowers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Reach and Impressions Trend */}
        <div className={`p-6 rounded-2xl ${getCardClass()}`}>
          <div className="mb-6">
            <h3 className="text-md font-bold text-white">Views & Reach Trend</h3>
            <p className="text-zinc-500 text-xs mt-1">Impressions logged across profile activity.</p>
          </div>

          <div className="h-72 w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">Loading chart data...</div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No reach statistics available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.blueColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.blueColor} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(tick) => formatMetric(tick)} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    formatter={(value) => [formatMetric(value), "Reach"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Reach" 
                    stroke={theme.blueColor} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorReach)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Engagement Trend */}
        <div className={`p-6 rounded-2xl ${getCardClass()} col-span-1 lg:col-span-3`}>
          <div className="mb-6">
            <h3 className="text-md font-bold text-white">Engagement Trend</h3>
            <p className="text-zinc-500 text-xs mt-1">Interactions distribution history over the month.</p>
          </div>

          <div className="h-64 w-full">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">Loading chart data...</div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No engagement history available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.secondaryColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.secondaryColor} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(tick) => formatMetric(tick)} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    formatter={(value) => [formatMetric(value), "Engagement"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Engagement" 
                    stroke={theme.secondaryColor} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorEngagement)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
