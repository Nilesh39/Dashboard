import React, { useState, useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { formatMetric } from '../utils/formatters';
import { Edit2 } from 'lucide-react';

/**
 * MetricEditor component enables inline click-to-edit capabilities.
 * 
 * @param {string} type - 'profile', 'reel', or 'audience'
 * @param {number} targetId - ID of the record (e.g., Reel ID)
 * @param {string} field - Field to update (e.g., 'views', 'followers_count')
 * @param {any} value - Current value
 * @param {boolean} format - Whether to format output using formatMetric (K, M, B)
 * @param {string} className - Extra classes for display mode
 * @param {string} inputClassName - Extra classes for input mode
 */
export default function MetricEditor({ 
  type, 
  targetId, 
  field, 
  value, 
  format = true, 
  className = "", 
  inputClassName = "" 
}) {
  const { isEditMode, updateMetric } = useEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    if (inputValue !== value) {
      updateMetric(type, targetId, field, inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <span className={className}>{format ? formatMetric(value) : value}</span>;
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-zinc-900 text-white border border-instagram-primary rounded px-2 py-0.5 w-24 outline-none focus:ring-1 focus:ring-instagram-primary text-center inline-block ${inputClassName}`}
        autoFocus
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)}
      title="Click to edit metric"
      className={`group cursor-pointer border-b border-dashed border-zinc-500 hover:border-instagram-primary hover:text-instagram-primary transition-all inline-flex items-center justify-center gap-1 ${className}`}
    >
      {format ? formatMetric(value) : value}
      <Edit2 size={12} className="opacity-40 group-hover:opacity-100 transition-opacity text-instagram-primary ml-1" />
    </span>
  );
}
