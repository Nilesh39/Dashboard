import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Film, 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  Edit3, 
  Check,
  X 
} from 'lucide-react';
import { useEdit } from '../context/EditContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isEditMode, setIsEditMode, hasChanges } = useEdit();

  const navItems = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'Reels Insights', path: '/reels', icon: Film },
    { name: 'Audience Insights', path: '/audience', icon: Users },
    { name: 'Profile Stats', path: '/profile', icon: TrendingUp },
    { name: 'Automation Logs', path: '/automation', icon: Activity },
    { name: 'Settings & Theme', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Drawer Overlay Backdrop on Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        w-[244px] h-screen border-r border-[#262626] bg-[#000000] flex flex-col fixed left-0 top-0 z-40 select-none
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Instagram Script Wordmark */}
        <div className="p-6 pt-10 pb-6 flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="font-cursive text-3xl text-white tracking-wide block hover:opacity-90">
            Instagram
          </NavLink>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3.5 rounded-lg text-[15px] transition-all duration-200 group
                  ${isActive 
                    ? 'text-white font-bold bg-zinc-900/40' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/20'
                  }
                `}
              >
                <Icon size={22} className="group-hover:scale-105 transition-transform" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Editor Mode control at bottom (Instagram Settings-style) */}
        <div className="p-3 border-t border-[#262626] space-y-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isEditMode 
                ? 'bg-[#0095F6] hover:bg-[#1877F2] text-white' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-[#262626]'
            }`}
          >
            <Edit3 size={14} />
            {isEditMode ? 'Lock Edits (Save Mode)' : 'Edit Metrics Mode'}
          </button>
          
          {hasChanges && (
            <div className="text-[10px] text-instagram-accent text-center font-medium py-1 animate-pulse">
              ⚠️ Unsaved edits in buffer!
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 text-center pb-6">
          <span className="text-[10px] text-zinc-500 block">© 2026 Instatrack Suite</span>
        </div>
      </aside>
    </>
  );
}
