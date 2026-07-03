import React, { useState } from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Film, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { reelsApi } from '../services/api';
import MetricEditor from '../components/MetricEditor';
import { formatMetric } from '../utils/formatters';

export default function Reels() {
  const { reels, isEditMode, refreshData, forceUpdateData, updateMetric } = useEdit();
  const { getCardClass } = useTheme();

  // Add Reel Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReel, setNewReel] = useState({
    title: '',
    views: '10K',
    likes: '800',
    comments: '50',
    shares: '120',
    saves: '200',
    reach: '12K',
    watch_time_hours: '50.5'
  });

  const handleAddReel = async (e) => {
    e.preventDefault();
    try {
      await reelsApi.createReel({
        title: newReel.title || "Untitled Reel",
        views: newReel.views,
        likes: newReel.likes,
        comments: newReel.comments,
        shares: newReel.shares,
        saves: newReel.saves,
        reach: newReel.reach,
        watch_time_hours: parseFloat(newReel.watch_time_hours) || 0.0
      });
      setShowAddModal(false);
      setNewReel({
        title: '',
        views: '10K',
        likes: '800',
        comments: '50',
        shares: '120',
        saves: '200',
        reach: '12K',
        watch_time_hours: '50.5'
      });
      refreshData();
    } catch (err) {
      console.error("Error creating reel:", err);
      alert("Failed to add new reel. Please check values.");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await reelsApi.duplicateReel(id);
      refreshData();
    } catch (err) {
      console.error("Error duplicating reel:", err);
      alert("Failed to duplicate reel.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    try {
      await reelsApi.deleteReel(id);
      refreshData();
    } catch (err) {
      console.error("Error deleting reel:", err);
      alert("Failed to delete reel.");
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Film size={28} className="text-instagram-primary" />
            Reel Insights
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Detailed statistics, interaction multipliers, and engagement indicators.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-instagram-primary hover:bg-instagram-primary/95 text-white font-semibold text-sm transition-all shadow-lg"
        >
          <Plus size={16} />
          Add New Reel
        </button>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-6 mb-8">
        {reels.map((reel) => (
          <div key={reel.id} className="group relative aspect-[9/16] bg-zinc-950 border border-[#262626] overflow-hidden select-none hover:border-[#363636] transition-all">
            {/* Visual Cover art background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-instagram-blue/20 via-instagram-purple/10 to-instagram-primary/20 opacity-60 z-0 group-hover:scale-105 transition-transform duration-500"></div>

            {/* Top Bar: Title & ER (Always Visible) */}
            <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start pointer-events-none">
              <h3 className="text-white font-bold text-2xs md:text-xs line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2">{reel.title}</h3>
              <span className="text-[8px] md:text-[10px] bg-black/60 border border-[#262626] px-1.5 py-0.5 rounded text-instagram-primary font-bold">
                {reel.engagement_rate}%
              </span>
            </div>

            {/* Bottom Left: Play Icon + Views (Instagram default) */}
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white font-bold text-2xs md:text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>{formatMetric(reel.views)}</span>
            </div>

            {/* Central Hover Overlay (Likes & Comments - Desktop only) */}
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

            {/* Action buttons (Appear on hover) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-25">
              <button
                onClick={(e) => { e.stopPropagation(); handleDuplicate(reel.id); }}
                title="Duplicate Reel"
                className="p-1 rounded bg-black/80 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Copy size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(reel.id); }}
                title="Delete Reel"
                className="p-1 rounded bg-black/80 border border-zinc-800 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reels Table */}
      <div className={`rounded-2xl ${getCardClass()} overflow-hidden border border-zinc-800`}>
        <div className="p-6 border-b border-zinc-850 flex justify-between items-center bg-black/10">
          <h3 className="text-md font-bold text-white">Metrics Database</h3>
          <span className="text-xs text-zinc-500 font-medium">Click any metric in Edit Mode to modify it.</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6 min-w-[200px]">Reel Topic</th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Eye size={12} /> Views</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Heart size={12} /> Likes</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><MessageCircle size={12} /> Comments</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Share2 size={12} /> Shares</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Bookmark size={12} /> Saves</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><TrendingUp size={12} /> Reach</span></th>
                <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Clock size={12} /> Watch Time</span></th>
                <th className="py-4 px-3 text-center">ER %</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300 text-sm">
              {reels.map((reel) => (
                <tr key={reel.id} className="hover:bg-zinc-900/35 transition-colors">
                  {/* Title */}
                  <td className="py-4 px-6 font-medium text-white max-w-[250px] truncate">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={reel.title}
                        onChange={(e) => updateMetric('reel', reel.id, 'title', e.target.value)}
                        className="bg-zinc-950 text-white border border-zinc-800 rounded px-2 py-1 w-full outline-none focus:border-instagram-primary text-xs"
                      />
                    ) : (
                      reel.title
                    )}
                  </td>
                  {/* Views */}
                  <td className="py-4 px-3 text-center font-semibold">
                    <MetricEditor type="reel" targetId={reel.id} field="views" value={reel.views} />
                  </td>
                  {/* Likes */}
                  <td className="py-4 px-3 text-center">
                    <MetricEditor type="reel" targetId={reel.id} field="likes" value={reel.likes} />
                  </td>
                  {/* Comments */}
                  <td className="py-4 px-3 text-center">
                    <MetricEditor type="reel" targetId={reel.id} field="comments" value={reel.comments} />
                  </td>
                  {/* Shares */}
                  <td className="py-4 px-3 text-center">
                    <MetricEditor type="reel" targetId={reel.id} field="shares" value={reel.shares} />
                  </td>
                  {/* Saves */}
                  <td className="py-4 px-3 text-center">
                    <MetricEditor type="reel" targetId={reel.id} field="saves" value={reel.saves} />
                  </td>
                  {/* Reach */}
                  <td className="py-4 px-3 text-center">
                    <MetricEditor type="reel" targetId={reel.id} field="reach" value={reel.reach} />
                  </td>
                  {/* Watch Time */}
                  <td className="py-4 px-3 text-center font-medium">
                    <MetricEditor type="reel" targetId={reel.id} field="watch_time_hours" value={reel.watch_time_hours} format={false} /> h
                  </td>
                  {/* ER */}
                  <td className="py-4 px-3 text-center text-instagram-primary font-bold">
                    {reel.engagement_rate}%
                  </td>
                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDuplicate(reel.id)}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Duplicate record"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Film size={20} className="text-instagram-primary" />
              Add Reel Record
            </h3>
            <form onSubmit={handleAddReel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Reel Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clean architecture code walk"
                  value={newReel.title}
                  onChange={(e) => setNewReel({...newReel, title: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Views</label>
                  <input
                    type="text"
                    required
                    value={newReel.views}
                    onChange={(e) => setNewReel({...newReel, views: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Reach</label>
                  <input
                    type="text"
                    required
                    value={newReel.reach}
                    onChange={(e) => setNewReel({...newReel, reach: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Likes</label>
                  <input
                    type="text"
                    required
                    value={newReel.likes}
                    onChange={(e) => setNewReel({...newReel, likes: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Comments</label>
                  <input
                    type="text"
                    required
                    value={newReel.comments}
                    onChange={(e) => setNewReel({...newReel, comments: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Shares</label>
                  <input
                    type="text"
                    required
                    value={newReel.shares}
                    onChange={(e) => setNewReel({...newReel, shares: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Saves</label>
                  <input
                    type="text"
                    required
                    value={newReel.saves}
                    onChange={(e) => setNewReel({...newReel, saves: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Watch Time (Hours)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newReel.watch_time_hours}
                  onChange={(e) => setNewReel({...newReel, watch_time_hours: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-instagram-primary hover:opacity-90 text-white text-xs font-semibold transition-all"
                >
                  Save Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
