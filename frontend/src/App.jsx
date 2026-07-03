import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { EditProvider, useEdit } from './context/EditContext';
import Sidebar from './components/Sidebar';
import FloatingSaveBar from './components/FloatingSaveBar';

// Pages
import Overview from './pages/Overview';
import Reels from './pages/Reels';
import Audience from './pages/Audience';
import ProfileStats from './pages/ProfileStats';
import Automation from './pages/Automation';
import SettingsPage from './pages/Settings';

import { Menu } from 'lucide-react';

function DashboardContent() {
  const { loading, error } = useEdit();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-instagram-bg text-instagram-text font-custom transition-all">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-black border-b border-zinc-900 fixed top-0 left-0 right-0 z-30 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-instagram-purple via-instagram-primary to-instagram-accent text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </div>
          <span className="text-xs font-bold tracking-wider text-white">INSTATRACK</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Menu size={16} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pl-0 pt-16 md:pt-0 min-h-screen relative pb-28">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-instagram-primary"></div>
              <span className="text-zinc-400 text-xs font-semibold">Syncing database...</span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 mx-8 mt-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()} className="underline hover:text-white font-semibold">Refresh</button>
          </div>
        )}

        {/* Page Routing */}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/profile" element={<ProfileStats />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

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
