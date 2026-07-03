import React, { useState, useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, 
  Palette, 
  Activity, 
  Database, 
  RotateCcw, 
  Save, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { profileApi, automationApi } from '../services/api';

export default function SettingsPage() {
  const { profile, forceUpdateData, refreshData } = useEdit();
  const { theme, setTheme, getCardClass } = useTheme();

  // Theme builder states
  const [themeForm, setThemeForm] = useState({ ...theme });

  // Simulation settings states
  const [simActive, setSimActive] = useState(false);
  const [growthRate, setGrowthRate] = useState(100);
  const [savingSim, setSavingSim] = useState(false);

  // Demo generator states
  const [demoTier, setDemoTier] = useState('100K');
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [resettingDb, setResettingDb] = useState(false);

  // Load current theme & simulation settings on load
  useEffect(() => {
    if (profile && profile.theme_settings) {
      setThemeForm({ ...theme, ...profile.theme_settings });
    }

    const fetchSimSettings = async () => {
      try {
        const res = await automationApi.getSettings();
        setSimActive(res.data.simulation_active);
        setGrowthRate(res.data.growth_rate_followers_per_day);
      } catch (err) {
        console.error("Error loading simulation settings:", err);
      }
    };
    fetchSimSettings();
  }, [profile]);

  // Handle Theme Update
  const handleSaveTheme = async () => {
    try {
      // Save locally in context
      setTheme(themeForm);
      
      // Save to database
      if (profile) {
        await profileApi.updateProfile({
          username: profile.username,
          theme_settings: themeForm
        });
      }
      alert("Theme saved and applied successfully!");
    } catch (err) {
      console.error("Error saving theme settings:", err);
      alert("Failed to save theme in database.");
    }
  };

  // Handle Simulation Settings Save
  const handleSaveSimulation = async () => {
    setSavingSim(true);
    try {
      const res = await automationApi.updateSettings({
        simulation_active: simActive,
        growth_rate_followers_per_day: parseInt(growthRate) || 100
      });
      setSimActive(res.data.simulation_active);
      setGrowthRate(res.data.growth_rate_followers_per_day);
      alert("Live growth simulation configuration saved successfully!");
    } catch (err) {
      console.error("Error updating simulation configurations:", err);
      alert("Failed to save simulation settings.");
    } finally {
      setSavingSim(false);
    }
  };

  // Handle Demo Data Generation
  const handleGenerateDemo = async () => {
    setGeneratingDemo(true);
    try {
      const res = await profileApi.generateDemoData(demoTier);
      // Wait for backend to reload
      setTimeout(async () => {
        // Fetch new state and force update local master states
        const profileRes = await profileApi.getProfile();
        const reelsRes = await reelsApi_getReels_helper();
        const audienceRes = await audienceApi_getAudience_helper();
        
        forceUpdateData(profileRes.data, reelsRes, audienceRes);
        setGeneratingDemo(false);
        alert(`Demo data for ${demoTier} followers generated successfully!`);
      }, 1000);
    } catch (err) {
      console.error("Error generating demo data:", err);
      alert("Failed to generate demo data.");
      setGeneratingDemo(false);
    }
  };

  // Helpers to prevent circular imports or import failures
  const reelsApi_getReels_helper = async () => {
    const isVercel = window.location.hostname.includes('vercel.app') || window.location.port === '';
    const base = isVercel ? '/api' : `http://${window.location.hostname || 'localhost'}:8000/api`;
    const res = await fetch(`${base}/reels/`).then(r => r.json());
    return res;
  };
  const audienceApi_getAudience_helper = async () => {
    const isVercel = window.location.hostname.includes('vercel.app') || window.location.port === '';
    const base = isVercel ? '/api' : `http://${window.location.hostname || 'localhost'}:8000/api`;
    const res = await fetch(`${base}/audience/`).then(r => r.json());
    return res;
  };

  // Handle Reset Database
  const handleResetDatabase = async () => {
    if (!window.confirm("WARNING: This will discard all custom metrics, edits, logs, and historical entries and restore Elena Rostova's default dashboard. Are you sure?")) return;
    setResettingDb(true);
    try {
      const res = await profileApi.resetProfile();
      setTimeout(async () => {
        const profileRes = await profileApi.getProfile();
        const reelsRes = await reelsApi_getReels_helper();
        const audienceRes = await audienceApi_getAudience_helper();
        
        forceUpdateData(profileRes.data, reelsRes, audienceRes);
        setTheme(profileRes.data.theme_settings);
        setThemeForm(profileRes.data.theme_settings);
        setResettingDb(false);
        alert("Database reset to creator defaults successfully.");
      }, 1000);
    } catch (err) {
      console.error("Error resetting database:", err);
      alert("Failed to reset database.");
      setResettingDb(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings size={28} className="text-zinc-400" />
          Settings Panel
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Configure layout themes, run growth simulations, and manage datasets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Theme Builder */}
        <div className={`p-6 rounded-2xl ${getCardClass()} border border-zinc-800 space-y-6`}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Palette size={20} className="text-instagram-primary" />
            Brand Theme Builder
          </h3>

          <div className="space-y-4">
            {/* Theme Hex Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeForm.primaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                    className="w-10 h-9 rounded bg-transparent border border-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeForm.primaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                    className="bg-zinc-900 text-white font-bold text-xs border border-zinc-850 rounded px-2 w-full outline-none focus:border-instagram-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeForm.secondaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                    className="w-10 h-9 rounded bg-transparent border border-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeForm.secondaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                    className="bg-zinc-900 text-white font-bold text-xs border border-zinc-850 rounded px-2 w-full outline-none focus:border-instagram-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeForm.backgroundColor}
                    onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                    className="w-10 h-9 rounded bg-transparent border border-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeForm.backgroundColor}
                    onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                    className="bg-zinc-900 text-white font-bold text-xs border border-zinc-850 rounded px-2 w-full outline-none focus:border-instagram-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeForm.textColor}
                    onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                    className="w-10 h-9 rounded bg-transparent border border-zinc-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeForm.textColor}
                    onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                    className="bg-zinc-900 text-white font-bold text-xs border border-zinc-850 rounded px-2 w-full outline-none focus:border-instagram-primary"
                  />
                </div>
              </div>
            </div>

            {/* Layout Card selection */}
            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1">Card Container Style</label>
              <select
                value={themeForm.cardStyle}
                onChange={(e) => setThemeForm({ ...themeForm, cardStyle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm cursor-pointer"
              >
                <option value="glassmorphism">Glassmorphism (Translucent blur)</option>
                <option value="neon">Neon glow (Glowing border accent)</option>
                <option value="border">Minimal Border (No background)</option>
                <option value="solid">Solid card (Flat charcoal background)</option>
              </select>
            </div>

            {/* Typography fonts */}
            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1">Font Typography</label>
              <select
                value={themeForm.fontFamily}
                onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm cursor-pointer"
              >
                <option value="Inter">Inter (Sleek professional)</option>
                <option value="Outfit">Outfit (Round modern sans)</option>
                <option value="Poppins">Poppins (Geometric structural)</option>
                <option value="Roboto">Roboto (Browser standard)</option>
              </select>
            </div>

            <button
              onClick={handleSaveTheme}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-instagram-primary to-instagram-secondary hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={14} />
              Save & Apply Theme
            </button>
          </div>
        </div>

        {/* Live Simulation Configurator */}
        <div className="space-y-8">
          
          {/* Live Simulation Card */}
          <div className={`p-6 rounded-2xl ${getCardClass()} border border-zinc-800 space-y-6`}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-instagram-accent animate-pulse" />
              Live Simulation Mode
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <div>
                  <span className="text-xs font-bold text-white block">Simulation Engine Status</span>
                  <span className="text-[10px] text-zinc-500">Increments followers, views, likes in real-time.</span>
                </div>
                <button
                  onClick={() => setSimActive(!simActive)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    simActive 
                      ? 'bg-instagram-accent/20 text-instagram-accent border border-instagram-accent/30' 
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {simActive ? 'RUNNING' : 'DISABLED'}
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Simulation Speed (Followers/Day)</label>
                <select
                  value={growthRate}
                  onChange={(e) => setGrowthRate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm cursor-pointer"
                >
                  <option value="100">+100 followers / day</option>
                  <option value="500">+500 followers / day</option>
                  <option value="1000">+1000 followers / day</option>
                  <option value="5000">+5000 followers / day (Fast simulation)</option>
                  <option value="10000">+10000 followers / day (Turbo simulation)</option>
                </select>
              </div>

              <button
                onClick={handleSaveSimulation}
                disabled={savingSim}
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingSim ? 'Updating...' : 'Save Simulation Settings'}
              </button>
            </div>
          </div>

          {/* Database & Demo Management */}
          <div className={`p-6 rounded-2xl ${getCardClass()} border border-zinc-800 space-y-6`}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={20} className="text-instagram-blue" />
              Demo Data Management
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Followers Tier Generator</label>
                <div className="flex gap-2">
                  <select
                    value={demoTier}
                    onChange={(e) => setDemoTier(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm cursor-pointer"
                  >
                    <option value="1K">1K Followers (Micro creator)</option>
                    <option value="10K">10K Followers (Emerging brand)</option>
                    <option value="100K">100K Followers (Established authority)</option>
                    <option value="1M">1M Followers (Macro influencer)</option>
                    <option value="10M">10M Followers (Global celebrity)</option>
                  </select>
                  <button
                    onClick={handleGenerateDemo}
                    disabled={generatingDemo}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-instagram-blue hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <RefreshCw size={14} className={generatingDemo ? 'animate-spin' : ''} />
                    {generatingDemo ? 'Generating...' : 'Generate Demo'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900">
                <button
                  onClick={handleResetDatabase}
                  disabled={resettingDb}
                  className="w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} className={resettingDb ? 'animate-spin' : ''} />
                  {resettingDb ? 'Resetting Database...' : 'Reset Database to Default Creator'}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
