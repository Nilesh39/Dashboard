import React from 'react';
import { useTheme } from '../context/ThemeContext';
import MetricEditor from './MetricEditor';

export default function StatCard({ 
  title, 
  value, 
  type, 
  field, 
  targetId = null, 
  format = true, 
  icon: Icon, 
  change = null, 
  changeType = 'positive', // 'positive' or 'negative'
  description = "" 
}) {
  const { getCardClass } = useTheme();
  
  return (
    <div className={`p-6 rounded-2xl ${getCardClass()} relative overflow-hidden transition-all duration-300`}>
      {/* Background glow decorator */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-instagram-primary/5 blur-xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4">
        <span className="text-zinc-400 text-sm font-medium tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-instagram-primary/10 text-instagram-primary">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <MetricEditor
          type={type}
          targetId={targetId}
          field={field}
          value={value}
          format={format}
          className="text-3xl font-bold tracking-tight text-white"
        />
      </div>

      <div className="flex items-center gap-2 text-xs">
        {change !== null && (
          <span className={`font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'positive' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            {changeType === 'positive' ? '+' : ''}{change}%
          </span>
        )}
        <span className="text-zinc-500">{description}</span>
      </div>
    </div>
  );
}
