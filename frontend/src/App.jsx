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

function DashboardContent() {
  const { loading, error } = useEdit();

  return (
    <div className="flex min-h-screen bg-instagram-bg text-instagram-text font-custom transition-all">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 pl-64 min-h-screen relative pb-28">
        
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
