import React, { useState, useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Activity, 
  RefreshCw, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { automationApi } from '../services/api';

export default function Automation() {
  const { profile, refreshData } = useEdit();
  const { getCardClass } = useTheme();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await automationApi.getLogs();
      setLogs(res.data);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [profile]);

  const handleTriggerSync = async () => {
    setTriggering(true);
    try {
      await automationApi.triggerSync();
      // Wait slightly to let the database writes clear
      setTimeout(() => {
        fetchLogs();
        refreshData();
        setTriggering(false);
      }, 800);
    } catch (err) {
      console.error("Error triggering sync:", err);
      alert("Failed to execute sync job.");
      setTriggering(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all automation logs?")) return;
    try {
      await automationApi.clearLogs();
      fetchLogs();
    } catch (err) {
      console.error("Error clearing logs:", err);
      alert("Failed to clear logs.");
    }
  };

  // Helper to resolve status colors and icons
  const getLogDetails = (status, type) => {
    if (status === 'FAILED') {
      return { 
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', 
        icon: XCircle,
        label: 'FAILURE'
      };
    }
    if (type === 'ALERT') {
      return { 
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
        icon: AlertTriangle,
        label: 'ALERT'
      };
    }
    if (type === 'SIMULATION') {
      return { 
        bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', 
        icon: Terminal,
        label: 'SIMULATE'
      };
    }
    return { 
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
      icon: CheckCircle2,
      label: 'SUCCESS'
    };
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity size={28} className="text-instagram-accent animate-pulse" />
            Automation Logs
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Status logs for the background scheduler running every 30 minutes.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${
              logs.length > 0
                ? 'border-zinc-800 bg-zinc-900 text-rose-400 hover:bg-zinc-800 cursor-pointer'
                : 'border-zinc-900 bg-zinc-950 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Trash2 size={14} />
            Clear Console
          </button>
          
          <button
            onClick={handleTriggerSync}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-instagram-primary hover:opacity-90 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer"
          >
            <RefreshCw size={14} className={triggering ? 'animate-spin' : ''} />
            {triggering ? 'Executing Sync...' : 'Trigger Sync Manually'}
          </button>
        </div>
      </div>

      {/* Scheduler Status Banner */}
      <div className={`p-6 rounded-2xl ${getCardClass()} mb-8 border border-zinc-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex gap-4 items-center">
          <div className="p-3 rounded-2xl bg-instagram-accent/15 text-instagram-accent animate-float">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-md">Scheduler Engine: Active</h3>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              FastAPI background process (APScheduler) runs every <span className="text-instagram-accent font-semibold">30 minutes</span>. It performs database synchronizations, detects growth spurts, and executes simulated ticks.
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 text-center min-w-28">
            <span className="text-zinc-500 uppercase font-semibold block text-[9px] mb-1">Logs Logged</span>
            <span className="font-bold text-white text-sm">{logs.length}</span>
          </div>
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 text-center min-w-28">
            <span className="text-zinc-500 uppercase font-semibold block text-[9px] mb-1">Last Cron Run</span>
            <span className="font-bold text-instagram-accent text-sm">
              {logs.length > 0 
                ? new Date(logs[0].timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Terminal logs console */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-300 font-mono tracking-wider">SYSTEM_LOGS_CONSOLE@INSTATRACK</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
        </div>

        {/* Terminal logs stream */}
        <div className="p-6 font-mono text-xs overflow-y-auto flex-1 space-y-3 scrollbar-thin bg-black/40">
          {loading ? (
            <div className="text-zinc-500 animate-pulse text-center py-12">Booting console interfaces and fetching terminal streams...</div>
          ) : logs.length === 0 ? (
            <div className="text-zinc-600 text-center py-12">
              Console output is empty.<br />
              <span className="text-[10px] mt-2 block">Trigger a manual sync or enable Live Simulation in settings to feed logs.</span>
            </div>
          ) : (
            logs.map((log) => {
              const details = getLogDetails(log.status, log.event_type);
              const LogIcon = details.icon;
              return (
                <div key={log.id} className="p-3 rounded-lg border bg-zinc-950 flex items-start gap-3 transition-colors border-zinc-900 hover:border-zinc-850">
                  <span className="text-zinc-600 whitespace-nowrap pt-0.5">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${details.bg} select-none`}>
                    {details.label}
                  </span>

                  <span className="text-zinc-400 flex-1 leading-relaxed">
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
