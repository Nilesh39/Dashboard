import React from 'react';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Users, 
  MapPin, 
  Activity, 
  Baby, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';

export default function Audience() {
  const { audience, isEditMode, updateMetric } = useEdit();
  const { getCardClass, theme } = useTheme();

  if (!audience) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-instagram-primary"></div>
        <p className="text-zinc-400 text-sm">Loading audience metrics...</p>
      </div>
    );
  }

  // 1. Followers vs Non-Followers Data
  const fVsNfData = Object.entries(audience.followers_vs_non_followers || {}).map(([key, val]) => ({
    name: key === 'followers' ? 'Followers' : 'Non-Followers',
    value: val
  }));

  // 2. Gender Data
  const genderData = [
    { name: 'Female', value: audience.female_percentage },
    { name: 'Male', value: audience.male_percentage }
  ];

  // 3. Age Distribution Data
  const ageData = Object.entries(audience.age_distribution || {}).map(([key, val]) => ({
    group: key,
    Percentage: val
  }));

  // 4. Country Distribution Data
  const countryData = Object.entries(audience.country_distribution || {})
    .map(([key, val]) => ({ name: key, percentage: val }))
    .sort((a, b) => b.percentage - a.percentage);

  // Palette colors for chart segments
  const COLORS = [theme.primaryColor, theme.blueColor, theme.accentColor, theme.purpleColor, theme.secondaryColor, '#A78BFA', '#F472B6'];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users size={28} className="text-instagram-blue" />
            Audience Insights
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Demographics analysis, age groupings, and geographic distributions.</p>
        </div>
      </div>

      {/* Grid of Demographics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Followers vs Non-Followers Donut */}
        <div className={`p-6 rounded-2xl ${getCardClass()}`}>
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-instagram-primary" />
            Followers vs Non-Followers
          </h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fVsNfData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={theme.primaryColor} />
                  <Cell fill={theme.blueColor} />
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Balance Donut */}
        <div className={`p-6 rounded-2xl ${getCardClass()}`}>
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Users size={16} className="text-instagram-purple" />
            Gender Distribution
          </h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  <Cell fill={theme.primaryColor} />
                  <Cell fill={theme.blueColor} />
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Groups Histogram */}
        <div className={`p-6 rounded-2xl ${getCardClass()}`}>
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Baby size={16} className="text-instagram-accent" />
            Age Distribution (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="group" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                <Bar dataKey="Percentage" fill={theme.primaryColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geography Distribution Bar Chart */}
        <div className={`p-6 rounded-2xl ${getCardClass()}`}>
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-instagram-secondary" />
            Top Countries (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                <Bar dataKey="percentage" fill={theme.blueColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Demographic Customizer Panel */}
      {isEditMode && (
        <div className={`p-6 rounded-2xl ${getCardClass()} border border-instagram-primary/20`}>
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Sliders size={18} className="text-instagram-primary animate-pulse" />
            Demographics Customizer Panel
          </h3>
          <p className="text-zinc-500 text-xs mb-6">Modify audience splits directly. Charts update instantly.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gender Split Slider */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Gender Split</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Female: {audience.female_percentage}%</span>
                  <span>Male: {audience.male_percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={audience.female_percentage}
                  onChange={(e) => updateMetric('audience', null, 'female_percentage', e.target.value)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-instagram-primary"
                />
              </div>
            </div>

            {/* Age Brackets Editor */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Age Groups (%)</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(audience.age_distribution || {}).map(([group, val]) => (
                  <div key={group} className="flex items-center justify-between gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                    <span className="text-xs text-zinc-400">{group}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => updateMetric('audience', null, `age.${group}`, e.target.value)}
                      className="bg-transparent text-white font-bold text-xs w-12 outline-none text-right"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Country Distribution Editor */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Geographic Weights (%)</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(audience.country_distribution || {}).map(([country, val]) => (
                  <div key={country} className="flex items-center justify-between gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                    <span className="text-xs text-zinc-400">{country}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => updateMetric('audience', null, `country.${country}`, e.target.value)}
                      className="bg-transparent text-white font-bold text-xs w-12 outline-none text-right"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
