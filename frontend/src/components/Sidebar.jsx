import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Film, 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  Edit3, 
  Check,
  X 
} from 'lucide-react';

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isEditMode, setIsEditMode, hasChanges } = useEdit();
  const { theme } = useTheme();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutGrid },
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
        w-64 h-screen border-r border-zinc-800 bg-black flex flex-col fixed left-0 top-0 z-40 select-none
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center justify-between border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-instagram-purple via-instagram-primary to-instagram-accent text-white shadow-lg animate-float">
              <InstagramIcon size={24} />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wider text-white">INSTATRACK</h1>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Analytics Suite</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Edit Mode Toggle Card */}
        <div className="px-4 py-6 border-b border-zinc-900">
          <div className={`p-4 rounded-xl bg-zinc-900/60 border ${isEditMode ? 'border-instagram-primary' : 'border-zinc-800'} transition-all`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-400">Editor Engine</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isEditMode ? 'bg-instagram-primary/20 text-instagram-primary' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {isEditMode ? 'ACTIVE' : 'LOCKED'}
              </span>
            </div>
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isEditMode 
                  ? 'bg-instagram-primary hover:bg-instagram-primary/90 text-white' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check size={14} />
                  Disable Edit Mode
                </>
              ) : (
                <>
                  <Edit3 size={14} />
                  Enable Edit Mode
                </>
              )}
            </button>
            
            {hasChanges && (
              <div className="mt-2 text-[10px] text-instagram-accent text-center font-medium animate-pulse">
                ⚠️ You have unsaved changes!
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-instagram-primary/15 to-transparent text-instagram-primary border-l-2 border-instagram-primary font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }
                `}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Branding info */}
        <div className="p-4 border-t border-zinc-900 text-center">
          <span className="text-[10px] text-zinc-600 block">SaaS Analytics v1.2.0</span>
          <span className="text-[9px] text-zinc-700 block mt-0.5">Powered by Python & React</span>
        </div>
      </aside>
    </>
  );
}
