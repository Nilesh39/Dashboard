import React from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import MetricEditor from './MetricEditor';
import { Settings, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function ProfileHeader() {
  const { profile, isEditMode, updateMetric } = useEdit();

  if (!profile) return null;

  return (
    <div className="mb-10 select-none pb-6 border-b border-[#262626] md:border-none">
      
      {/* 1. Desktop Profile Layout (Hidden on Mobile) */}
      <div className="hidden md:flex gap-16 items-center px-12 py-6 max-w-4xl mx-auto">
        {/* Avatar */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-instagram-accent via-instagram-secondary to-instagram-purple opacity-90"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-black">
            <img 
              src={profile.profile_pic_url} 
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-5">
          {/* Row 1: Username & Action buttons */}
          <div className="flex items-center gap-5">
            <h2 className="text-xl font-normal text-white">
              {isEditMode ? (
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => updateMetric('profile', null, 'username', e.target.value)}
                  className="bg-zinc-950 text-white font-bold border border-[#0095F6] rounded px-2 py-0.5 outline-none"
                />
              ) : (
                profile.username
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-1.5 rounded-lg bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold transition-colors"
                onClick={() => alert("Instagram Profile Statistics Editor Active. Toggle Edit Mode in the sidebar to change metrics directly.")}
              >
                Edit profile
              </button>
              <button className="p-2 text-white hover:opacity-80">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Row 2: Stats Counts */}
          <div className="flex gap-10 text-sm text-white">
            <div>
              <MetricEditor
                type="profile"
                targetId={null}
                field="posts_count"
                value={profile.posts_count}
                className="font-semibold"
              />
              <span className="text-zinc-300 ml-1">posts</span>
            </div>
            <div>
              <MetricEditor
                type="profile"
                targetId={null}
                field="followers_count"
                value={profile.followers_count}
                className="font-semibold"
              />
              <span className="text-zinc-300 ml-1">followers</span>
            </div>
            <div>
              <MetricEditor
                type="profile"
                targetId={null}
                field="following_count"
                value={profile.following_count}
                className="font-semibold"
              />
              <span className="text-zinc-300 ml-1">following</span>
            </div>
          </div>

          {/* Row 3: Name & Bio */}
          <div className="text-sm text-white leading-relaxed">
            {isEditMode ? (
              <div className="space-y-2 max-w-md">
                <input
                  type="text"
                  placeholder="Full name"
                  value={profile.full_name}
                  onChange={(e) => updateMetric('profile', null, 'full_name', e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1 outline-none text-xs"
                />
                <textarea
                  placeholder="Biography"
                  value={profile.bio}
                  rows={3}
                  onChange={(e) => updateMetric('profile', null, 'bio', e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1 outline-none text-xs"
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold">{profile.full_name}</h3>
                <p className="text-zinc-400 font-light whitespace-pre-line mt-1">{profile.bio}</p>
                <div className="flex items-center gap-1.5 text-[#E0F1FF] hover:underline cursor-pointer mt-2 text-xs font-semibold">
                  <LinkIcon size={12} />
                  <span>{profile.username}.dev</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Profile Layout (Hidden on Desktop) */}
      <div className="md:hidden flex flex-col px-4 pt-4 pb-2 space-y-4">
        {/* Top block: Avatar + Stats Counts */}
        <div className="flex items-center justify-between gap-6">
          {/* Avatar Circle */}
          <div className="relative w-[77px] h-[77px] flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-instagram-accent via-instagram-secondary to-instagram-purple opacity-90"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-[2.5px] border-black">
              <img 
                src={profile.profile_pic_url} 
                alt={profile.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
                }}
              />
            </div>
          </div>

          {/* Stats counts horizontally */}
          <div className="flex-1 flex justify-around text-center select-none">
            <div className="flex flex-col items-center">
              <MetricEditor
                type="profile"
                targetId={null}
                field="posts_count"
                value={profile.posts_count}
                className="text-md font-bold text-white"
              />
              <span className="text-[11px] text-zinc-400 font-medium">posts</span>
            </div>
            <div className="flex flex-col items-center">
              <MetricEditor
                type="profile"
                targetId={null}
                field="followers_count"
                value={profile.followers_count}
                className="text-md font-bold text-white"
              />
              <span className="text-[11px] text-zinc-400 font-medium">followers</span>
            </div>
            <div className="flex flex-col items-center">
              <MetricEditor
                type="profile"
                targetId={null}
                field="following_count"
                value={profile.following_count}
                className="text-md font-bold text-white"
              />
              <span className="text-[11px] text-zinc-400 font-medium">following</span>
            </div>
          </div>
        </div>

        {/* Bio information block */}
        <div className="text-sm text-white">
          {isEditMode ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full name"
                value={profile.full_name}
                onChange={(e) => updateMetric('profile', null, 'full_name', e.target.value)}
                className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2 py-1 outline-none text-xs"
              />
              <textarea
                placeholder="Biography"
                value={profile.bio}
                rows={2}
                onChange={(e) => updateMetric('profile', null, 'bio', e.target.value)}
                className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2 py-1 outline-none text-xs"
              />
            </div>
          ) : (
            <>
              <h3 className="font-bold text-sm">{profile.full_name}</h3>
              <p className="text-zinc-300 font-light text-xs mt-0.5 whitespace-pre-line leading-relaxed">{profile.bio}</p>
              <div className="flex items-center gap-1 text-[#E0F1FF] mt-1 text-[11px] font-semibold">
                <LinkIcon size={10} />
                <span>{profile.username}.dev</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons Split Row */}
        <div className="flex gap-2 text-xs">
          <button 
            className="flex-1 py-2 bg-[#363636] hover:bg-[#262626] text-white font-bold rounded-lg text-center"
            onClick={() => alert("Direct Metrics Editor. Toggle edit mode in top bar to modify numbers.")}
          >
            Edit profile
          </button>
          <button className="flex-1 py-2 bg-[#363636] hover:bg-[#262626] text-white font-bold rounded-lg text-center">
            Share profile
          </button>
        </div>
      </div>
      
    </div>
  );
}
