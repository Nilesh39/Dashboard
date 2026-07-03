import React from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import MetricEditor from './MetricEditor';
import { Award, ShieldAlert, Sparkles } from 'lucide-react';

export default function ProfileHeader() {
  const { profile, isEditMode, updateMetric } = useEdit();
  const { getCardClass } = useTheme();

  if (!profile) return null;

  return (
    <div className={`p-8 rounded-3xl ${getCardClass()} mb-8 relative overflow-hidden`}>
      {/* Visual background gradient decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-tr from-instagram-primary/10 via-instagram-purple/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Profile Picture */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-instagram-accent via-instagram-primary to-instagram-purple opacity-75 blur-sm group-hover:opacity-100 transition duration-500"></div>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-black">
            <img 
              src={profile.profile_pic_url} 
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
              }}
            />
          </div>
          <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-instagram-primary text-white border-2 border-black">
            <Sparkles size={12} className="animate-spin-slow" />
          </span>
        </div>

        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            {isEditMode ? (
              <input
                type="text"
                value={profile.username}
                onChange={(e) => updateMetric('profile', null, 'username', e.target.value)}
                className="bg-zinc-950 text-white font-bold text-2xl border border-instagram-primary rounded px-3 py-1 outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white tracking-wide">@{profile.username}</h2>
            )}
            
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-zinc-700">
                <Award size={12} className="text-instagram-accent" />
                Verified Creator
              </span>
            </div>
          </div>

          {/* Followers Counts Row */}
          <div className="flex justify-center md:justify-start gap-8 mb-6 border-y border-zinc-800/50 py-3">
            <div className="text-center md:text-left">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Posts</span>
              <MetricEditor
                type="profile"
                targetId={null}
                field="posts_count"
                value={profile.posts_count}
                className="text-lg font-bold text-white"
              />
            </div>
            <div className="text-center md:text-left">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Followers</span>
              <MetricEditor
                type="profile"
                targetId={null}
                field="followers_count"
                value={profile.followers_count}
                className="text-lg font-bold text-white"
              />
            </div>
            <div className="text-center md:text-left">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Following</span>
              <MetricEditor
                type="profile"
                targetId={null}
                field="following_count"
                value={profile.following_count}
                className="text-lg font-bold text-white"
              />
            </div>
            <div className="text-center md:text-left">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Reels</span>
              <MetricEditor
                type="profile"
                targetId={null}
                field="reels_count"
                value={profile.reels_count}
                className="text-lg font-bold text-white"
              />
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2 text-sm text-zinc-300">
            {isEditMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full name"
                  value={profile.full_name}
                  onChange={(e) => updateMetric('profile', null, 'full_name', e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-3 py-1.5 outline-none focus:border-instagram-primary"
                />
                <textarea
                  placeholder="Biography"
                  value={profile.bio}
                  rows={3}
                  onChange={(e) => updateMetric('profile', null, 'bio', e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-3 py-1.5 outline-none focus:border-instagram-primary"
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-white">{profile.full_name}</h3>
                <p className="whitespace-pre-line text-zinc-400 leading-relaxed font-light">{profile.bio}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
