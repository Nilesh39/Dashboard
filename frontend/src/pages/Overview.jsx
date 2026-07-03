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
  Film,
  Heart,
  MessageCircle,
  Copy,
  Trash2,
  Plus
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
import { analyticsApi, automationApi, reelsApi } from '../services/api';
import { formatMetric } from '../utils/formatters';

export default function Overview() {
  const { profile, reels, refreshData } = useEdit();
  const { getCardClass, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('posts');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [liveGrowth, setLiveGrowth] = useState(0);

  const handleDuplicate = async (id) => {
    try {
      await reelsApi.duplicateReel(id);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Error duplicating reel:", err);
      alert("Failed to duplicate reel.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    try {
      await reelsApi.deleteReel(id);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Error deleting reel:", err);
      alert("Failed to delete reel.");
    }
  };

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
      <div className="flex justify-center border-t border-[#262626] gap-12 md:gap-16 text-[11px] md:text-xs uppercase tracking-widest font-bold mb-8 select-none">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 py-4 border-t transition-all cursor-pointer outline-none ${
            activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Grid size={13} />
          <span>Posts</span>
        </button>
        <button 
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-1.5 py-4 border-t transition-all cursor-pointer outline-none ${
            activeTab === 'reels' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Film size={13} />
          <span>Reels</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1.5 py-4 border-t transition-all cursor-pointer outline-none ${
            activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark size={13} />
          <span>Saved</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <>
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
                          <stop offset="5%" stopColor={theme.primaryColor} stopOpacity={0.3}/>
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
                        formatter={(value) => [formatMetric(value), "Followers"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Followers" 
                        stroke={theme.primaryColor} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorFollowers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Reach Summary Panel */}
            <div className={`p-6 rounded-2xl ${getCardClass()} flex flex-col justify-between`}>
              <div>
                <h3 className="text-md font-bold text-white mb-1">Reach Analytics</h3>
                <p className="text-zinc-500 text-xs">Overview of content distributions and view limits.</p>
              </div>

              <div className="h-48 w-full mt-4">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">Loading chart data...</div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No reach data.</div>
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
        </>
      )}

      {/* REELS Tab View */}
      {activeTab === 'reels' && (
        <div>
          {reels.length === 0 ? (
            <div className="text-center py-20 border border-[#262626] rounded-xl select-none">
              <Film size={40} className="mx-auto text-zinc-600 mb-3" />
              <h4 className="text-white font-semibold text-sm">No Reels Found</h4>
              <p className="text-zinc-500 text-xs mt-1">Add reels to track performance metrics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-6 mb-8">
              {reels.map((reel) => (
                <div key={reel.id} className="group relative aspect-[9/16] bg-zinc-950 border border-[#262626] overflow-hidden hover:border-[#363636] transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-0"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-instagram-blue/20 via-instagram-purple/10 to-instagram-primary/20 opacity-60 z-0 group-hover:scale-105 transition-transform duration-500"></div>

                  {/* Top Info */}
                  <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start pointer-events-none">
                    <h3 className="text-white font-bold text-[9px] md:text-xs line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2">{reel.title}</h3>
                    <span className="text-[8px] md:text-[10px] bg-black/60 border border-[#262626] px-1.5 py-0.5 rounded text-instagram-primary font-bold">
                      {reel.engagement_rate}%
                    </span>
                  </div>

                  {/* Bottom Left Views */}
                  <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white font-bold text-[9px] md:text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>{formatMetric(reel.views)}</span>
                  </div>

                  {/* Hover Details */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 md:gap-5 z-10">
                    <div className="flex items-center gap-1 text-white font-bold text-xs md:text-sm">
                      <Heart size={16} fill="currentColor" className="text-white" />
                      <span>{formatMetric(reel.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-bold text-xs md:text-sm">
                      <MessageCircle size={16} fill="currentColor" className="text-white" />
                      <span>{formatMetric(reel.comments)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-25">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(reel.id); }}
                      title="Duplicate Reel"
                      className="p-1 rounded bg-black/85 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(reel.id); }}
                      title="Delete Reel"
                      className="p-1 rounded bg-black/85 border border-zinc-800 text-rose-400 hover:text-rose-350 transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED Tab View */}
      {activeTab === 'saved' && (
        <div>
          {reels.filter(r => (r.saves || 0) > 0).length === 0 ? (
            <div className="text-center py-20 border border-[#262626] rounded-xl select-none">
              <Bookmark size={40} className="mx-auto text-zinc-600 mb-3" />
              <h4 className="text-white font-semibold text-sm">No Saved Reels Yet</h4>
              <p className="text-zinc-500 text-xs mt-1">Reels you save or bookmark will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-6 mb-8">
              {reels.filter(r => (r.saves || 0) > 0).map((reel) => (
                <div key={reel.id} className="group relative aspect-[9/16] bg-zinc-950 border border-[#262626] overflow-hidden hover:border-[#363636] transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-0"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-instagram-blue/20 via-instagram-purple/10 to-instagram-primary/20 opacity-60 z-0 group-hover:scale-105 transition-transform duration-500"></div>

                  <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start pointer-events-none">
                    <h3 className="text-white font-bold text-[9px] md:text-xs line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2">{reel.title}</h3>
                    <span className="text-[8px] md:text-[10px] bg-black/60 border border-[#262626] px-1.5 py-0.5 rounded text-instagram-primary font-bold">
                      {reel.engagement_rate}%
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white font-bold text-[9px] md:text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>{formatMetric(reel.views)}</span>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 md:gap-5 z-10">
                    <div className="flex items-center gap-1 text-white font-bold text-xs md:text-sm">
                      <Heart size={16} fill="currentColor" className="text-white" />
                      <span>{formatMetric(reel.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-bold text-xs md:text-sm">
                      <MessageCircle size={16} fill="currentColor" className="text-white" />
                      <span>{formatMetric(reel.comments)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
