import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileApi, reelsApi, audienceApi } from '../services/api';
import { parseMetric } from '../utils/formatters';

const EditContext = createContext();

export const useEdit = () => useContext(EditContext);

export const EditProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Master states loaded from the database
  const [profile, setProfile] = useState(null);
  const [reels, setReels] = useState([]);
  const [audience, setAudience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unsaved temporary edits state
  const [tempProfile, setTempProfile] = useState(null);
  const [tempReels, setTempReels] = useState([]);
  const [tempAudience, setTempAudience] = useState(null);

  // Undo/Redo History Stacks
  // Stores array of objects: { profileState, reelsState, audienceState }
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, reelsRes, audienceRes] = await Promise.all([
        profileApi.getProfile(),
        reelsApi.getReels(),
        audienceApi.getAudience(),
      ]);

      setProfile(profileRes.data);
      setReels(reelsRes.data);
      setAudience(audienceRes.data);

      setTempProfile(profileRes.data);
      setTempReels(reelsRes.data);
      setTempAudience(audienceRes.data);

      // Initialize history stack with first state
      const initialState = {
        profileState: JSON.parse(JSON.stringify(profileRes.data)),
        reelsState: JSON.parse(JSON.stringify(reelsRes.data)),
        audienceState: JSON.parse(JSON.stringify(audienceRes.data)),
      };
      setHistory([initialState]);
      setHistoryIndex(0);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to fetch dashboard data. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check if there are unsaved changes
  const hasChanges = () => {
    if (historyIndex <= 0 || history.length === 0) return false;
    // Compare current history state to initial history state (index 0)
    const initial = history[0];
    const current = history[historyIndex];
    return JSON.stringify(initial) !== JSON.stringify(current);
  };

  // Push new state onto history stack
  const pushHistory = (newProfile, newReels, newAudience) => {
    const newState = {
      profileState: JSON.parse(JSON.stringify(newProfile)),
      reelsState: JSON.parse(JSON.stringify(newReels)),
      audienceState: JSON.parse(JSON.stringify(newAudience)),
    };

    // Slice history up to current index (removes any redos if we make a new edit)
    const cleanHistory = history.slice(0, historyIndex + 1);
    const updatedHistory = [...cleanHistory, newState];
    
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Metric edit operation
  const updateMetric = (type, targetId, field, rawValue) => {
    let updatedProfile = tempProfile ? { ...tempProfile } : null;
    let updatedReels = [...tempReels];
    let updatedAudience = tempAudience ? { ...tempAudience } : null;

    if (type === 'profile') {
      if (['followers_count', 'following_count', 'posts_count', 'reels_count', 'total_reach', 'total_engagement'].includes(field)) {
        updatedProfile[field] = parseMetric(rawValue);
      } else {
        updatedProfile[field] = rawValue;
      }
    } else if (type === 'reel') {
      updatedReels = updatedReels.map(reel => {
        if (reel.id === targetId) {
          const updatedReel = { ...reel };
          if (['views', 'likes', 'comments', 'shares', 'saves', 'reach'].includes(field)) {
            updatedReel[field] = parseMetric(rawValue);
            // Dynamic update of engagement rate
            const eng = (updatedReel.likes || 0) + (updatedReel.comments || 0) + (updatedReel.shares || 0) + (updatedReel.saves || 0);
            updatedReel.engagement_rate = updatedReel.views > 0 ? parseFloat(((eng / updatedReel.views) * 100).toFixed(2)) : 0.0;
          } else if (field === 'watch_time_hours') {
            updatedReel[field] = parseFloat(rawValue) || 0.0;
          } else {
            updatedReel[field] = rawValue;
          }
          return updatedReel;
        }
        return reel;
      });
    } else if (type === 'audience') {
      if (field === 'male_percentage') {
        const maleVal = parseFloat(rawValue) || 0.0;
        updatedAudience.male_percentage = maleVal;
        updatedAudience.female_percentage = Math.max(0, 100 - maleVal);
      } else if (field === 'female_percentage') {
        const femaleVal = parseFloat(rawValue) || 0.0;
        updatedAudience.female_percentage = femaleVal;
        updatedAudience.male_percentage = Math.max(0, 100 - femaleVal);
      } else if (field.startsWith('age.')) {
        const ageGroup = field.split('.')[1];
        updatedAudience.age_distribution = {
          ...updatedAudience.age_distribution,
          [ageGroup]: parseFloat(rawValue) || 0.0
        };
      } else if (field.startsWith('country.')) {
        const country = field.split('.')[1];
        updatedAudience.country_distribution = {
          ...updatedAudience.country_distribution,
          [country]: parseFloat(rawValue) || 0.0
        };
      } else if (field.startsWith('f_vs_nf.')) {
        const key = field.split('.')[1];
        updatedAudience.followers_vs_non_followers = {
          ...updatedAudience.followers_vs_non_followers,
          [key]: parseFloat(rawValue) || 0.0
        };
      }
    }

    setTempProfile(updatedProfile);
    setTempReels(updatedReels);
    setTempAudience(updatedAudience);
    
    pushHistory(updatedProfile, updatedReels, updatedAudience);
  };

  // Undo operation
  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      
      setTempProfile(JSON.parse(JSON.stringify(state.profileState)));
      setTempReels(JSON.parse(JSON.stringify(state.reelsState)));
      setTempAudience(JSON.parse(JSON.stringify(state.audienceState)));
      
      setHistoryIndex(prevIndex);
    }
  };

  // Redo operation
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      
      setTempProfile(JSON.parse(JSON.stringify(state.profileState)));
      setTempReels(JSON.parse(JSON.stringify(state.reelsState)));
      setTempAudience(JSON.parse(JSON.stringify(state.audienceState)));
      
      setHistoryIndex(nextIndex);
    }
  };

  // Reset temp edits
  const resetEdits = () => {
    const initialState = history[0];
    setTempProfile(JSON.parse(JSON.stringify(initialState.profileState)));
    setTempReels(JSON.parse(JSON.stringify(initialState.reelsState)));
    setTempAudience(JSON.parse(JSON.stringify(initialState.audienceState)));
    
    setHistoryIndex(0);
    setHistory([initialState]);
  };

  // Save changes to database
  const saveChanges = async () => {
    setLoading(true);
    try {
      // 1. Profile update
      const profilePromise = profileApi.updateProfile(tempProfile);
      
      // 2. Audience update
      const audiencePromise = audienceApi.updateAudience(tempAudience);

      // 3. Reels bulk update
      const reelsFormatted = tempReels.map(r => ({
        id: r.id,
        title: r.title,
        views: r.views,
        likes: r.likes,
        comments: r.comments,
        shares: r.shares,
        saves: r.saves,
        reach: r.reach,
        watch_time_hours: r.watch_time_hours,
      }));
      const reelsPromise = reelsApi.bulkUpdateReels(reelsFormatted);

      await Promise.all([profilePromise, audiencePromise, reelsPromise]);
      
      // Commit changes to actual master state
      setProfile(JSON.parse(JSON.stringify(tempProfile)));
      setReels(JSON.parse(JSON.stringify(tempReels)));
      setAudience(JSON.parse(JSON.stringify(tempAudience)));

      // Re-initialize history stack
      const newState = {
        profileState: JSON.parse(JSON.stringify(tempProfile)),
        reelsState: JSON.parse(JSON.stringify(tempReels)),
        audienceState: JSON.parse(JSON.stringify(tempAudience)),
      };
      setHistory([newState]);
      setHistoryIndex(0);
    } catch (err) {
      console.error("Error saving edits:", err);
      setError("Failed to save metrics updates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Force local state overrides (used by generator and settings reset)
  const forceUpdateData = (newProfile, newReels, newAudience) => {
    setProfile(newProfile);
    setReels(newReels);
    setAudience(newAudience);

    setTempProfile(newProfile);
    setTempReels(newReels);
    setTempAudience(newAudience);

    const initialState = {
      profileState: JSON.parse(JSON.stringify(newProfile)),
      reelsState: JSON.parse(JSON.stringify(newReels)),
      audienceState: JSON.parse(JSON.stringify(newAudience)),
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  };

  const isUndoAvailable = historyIndex > 0;
  const isRedoAvailable = historyIndex < history.length - 1;

  return (
    <EditContext.Provider value={{
      isEditMode,
      setIsEditMode,
      profile: tempProfile,
      reels: tempReels,
      audience: tempAudience,
      loading,
      error,
      updateMetric,
      hasChanges: hasChanges(),
      undo,
      redo,
      resetEdits,
      saveChanges,
      isUndoAvailable,
      isRedoAvailable,
      forceUpdateData,
      refreshData: fetchData
    }}>
      {children}
    </EditContext.Provider>
  );
};
