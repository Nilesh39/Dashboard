import React, { useState, useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  Activity, 
  Tv 
} from 'lucide-react';
import { analyticsApi } from '../services/api';
import { formatMetric } from '../utils/formatters';

export default function ProfileStats() {
  const { profile, refreshData } = useEdit();
  const { getCardClass } = useTheme();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    followers: '',
    following: '',
    posts: '',
    reach: '',
    engagement: '',
    timestamp: new Date().toISOString().substring(0, 10)
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error("Error loading historical records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [profile]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await analyticsApi.addHistoryRecord({
        followers: newRecord.followers || '0',
        following: newRecord.following || '0',
        posts: newRecord.posts || '0',
        reach: newRecord.reach || '0',
        engagement: newRecord.engagement || '0',
        timestamp: new Date(newRecord.timestamp).toISOString()
      });
      setNewRecord({
        followers: '',
        following: '',
        posts: '',
        reach: '',
        engagement: '',
        timestamp: new Date().toISOString().substring(0, 10)
      });
      fetchHistory();
      refreshData();
    } catch (err) {
      console.error("Error adding historical record:", err);
      alert("Failed to append historical record.");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this historical record?")) return;
    try {
      await analyticsApi.deleteHistoryRecord(id);
      fetchHistory();
      refreshData();
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <TrendingUp size={28} className="text-instagram-purple" />
          Profile Statistics
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Audit trail of daily snapshots and account metrics logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Record Form Panel */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-2xl ${getCardClass()} border border-zinc-800`}>
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-instagram-primary" />
              Append Daily Snapshot
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Followers Count</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100K or 105000"
                  value={newRecord.followers}
                  onChange={(e) => setNewRecord({ ...newRecord, followers: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Following Count</label>
                <input
                  type="text"
                  placeholder="e.g. 500"
                  value={newRecord.following}
                  onChange={(e) => setNewRecord({ ...newRecord, following: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Posts Count</label>
                <input
                  type="text"
                  placeholder="e.g. 142"
                  value={newRecord.posts}
                  onChange={(e) => setNewRecord({ ...newRecord, posts: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Estimated Reach</label>
                <input
                  type="text"
                  placeholder="e.g. 800K"
                  value={newRecord.reach}
                  onChange={(e) => setNewRecord({ ...newRecord, reach: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Estimated Engagement</label>
                <input
                  type="text"
                  placeholder="e.g. 50K"
                  value={newRecord.engagement}
                  onChange={(e) => setNewRecord({ ...newRecord, engagement: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newRecord.timestamp}
                  onChange={(e) => setNewRecord({ ...newRecord, timestamp: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-instagram-primary text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-instagram-primary hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add Record
              </button>
            </form>
          </div>
        </div>

        {/* History Database Table */}
        <div className="lg:col-span-2">
          <div className={`rounded-2xl ${getCardClass()} border border-zinc-800 overflow-hidden`}>
            <div className="p-6 border-b border-zinc-900 bg-black/10 flex items-center justify-between">
              <h3 className="text-md font-bold text-white">Historical Logs Table</h3>
              <span className="text-xs text-zinc-500 font-medium">Lists snapshots in chronological order</span>
            </div>

            <div className="overflow-x-auto w-full max-h-[580px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/10 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6"><span className="flex items-center gap-1"><Calendar size={12} /> Date</span></th>
                    <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Users size={12} /> Followers</span></th>
                    <th className="py-4 px-3 text-center">Posts</th>
                    <th className="py-4 px-3 text-center">Reach</th>
                    <th className="py-4 px-3 text-center"><span className="flex items-center justify-center gap-1"><Activity size={12} /> Engagement</span></th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-500 text-xs">Loading history data...</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-500 text-xs">No records available.</td>
                    </tr>
                  ) : (
                    history.map((row) => (
                      <tr key={row.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 px-6 text-white font-medium">
                          {new Date(row.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-instagram-primary">
                          {formatMetric(row.followers)}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {formatMetric(row.posts)}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {formatMetric(row.reach)}
                        </td>
                        <td className="py-4 px-3 text-center text-instagram-blue">
                          {formatMetric(row.engagement)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeleteRecord(row.id)}
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
