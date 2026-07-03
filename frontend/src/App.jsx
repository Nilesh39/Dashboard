import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { EditProvider, useEdit } from './context/EditContext';
import Sidebar from './components/Sidebar';
import FloatingSaveBar from './components/FloatingSaveBar';
import { 
  Home, 
  Film, 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  Menu,
  Sparkles
} from 'lucide-react';

// Pages
import Overview from './pages/Overview';
import Reels from './pages/Reels';
import Audience from './pages/Audience';
import ProfileStats from './pages/ProfileStats';
import Automation from './pages/Automation';
import SettingsPage from './pages/Settings';

function DashboardContent() {
  const { loading, error, isEditMode, setIsEditMode } = useEdit();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'Reels', path: '/reels', icon: Film },
    { name: 'Audience', path: '/audience', icon: Users },
    { name: 'History', path: '/profile', icon: TrendingUp },
    { name: 'Logs', path: '/automation', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#000000] text-[#FFFFFF] font-custom transition-all">
      
      {/* 1. Desktop Left Sidebar (Hidden on Mobile) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Mobile Top Navigation Sticky Bar (Hidden on Desktop) */}
      <header className="md:hidden flex items-center justify-between px-4 h-11 bg-black border-b border-[#262626] fixed top-0 left-0 right-0 z-30 select-none">
        <span className="font-bold text-white text-sm">pixels_and_code</span>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-[#0095F6] animate-pulse' : 'bg-zinc-700'}`}></span>
          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#363636] hover:bg-[#262626] text-white"
          >
            {isEditMode ? 'Locked' : 'Edit Mode'}
          </button>
        </div>
      </header>

      {/* 3. Mobile Bottom Navigation Sticky Bar (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-black border-t border-[#262626] flex items-center justify-around z-30 px-2 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center text-zinc-400 py-1 transition-colors
                ${isActive ? 'text-white scale-110' : 'hover:text-white'}
              `}
            >
              <Icon size={20} />
            </NavLink>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-[244px] pl-0 pt-11 md:pt-0 pb-16 md:pb-24 min-h-screen relative">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-[#121212] border border-[#262626] p-4 rounded-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#0095F6]"></div>
              <span className="text-zinc-400 text-xs font-semibold">Updating database...</span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 mx-4 md:mx-8 mt-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()} className="underline hover:text-white font-semibold">Refresh</button>
          </div>
        )}

        {/* Page Routing */}
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/profile" element={<ProfileStats />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>

        {/* Save/Undo Floating Control Bar */}
        <FloatingSaveBar />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <EditProvider>
        <Router>
          <DashboardContent />
        </Router>
      </EditProvider>
    </ThemeProvider>
  );
}
