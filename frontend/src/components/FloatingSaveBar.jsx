import React from 'react';
import { useEdit } from '../context/EditContext';
import { Undo2, Redo2, RotateCcw, Save } from 'lucide-react';

export default function FloatingSaveBar() {
  const { 
    hasChanges, 
    saveChanges, 
    undo, 
    redo, 
    resetEdits, 
    isUndoAvailable, 
    isRedoAvailable, 
    loading 
  } = useEdit();

  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 md:left-64 left-0 right-0 px-4 md:px-8 z-50 flex justify-center pointer-events-none">
      <div className="bg-zinc-950/95 border border-instagram-primary/30 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-8 shadow-2xl pointer-events-auto max-w-2xl w-full animate-float">
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-sm font-semibold text-white">Unsaved edits detected</span>
          <span className="text-xs text-zinc-500">Save changes to commit them permanently.</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!isUndoAvailable || loading}
            title="Undo last change"
            className={`p-2 rounded-xl border border-zinc-800 text-white transition-colors ${
              isUndoAvailable 
                ? 'hover:bg-zinc-800 hover:border-zinc-700 bg-zinc-900 cursor-pointer' 
                : 'opacity-40 cursor-not-allowed bg-zinc-950'
            }`}
          >
            <Undo2 size={16} />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!isRedoAvailable || loading}
            title="Redo change"
            className={`p-2 rounded-xl border border-zinc-800 text-white transition-colors ${
              isRedoAvailable 
                ? 'hover:bg-zinc-800 hover:border-zinc-700 bg-zinc-900 cursor-pointer' 
                : 'opacity-40 cursor-not-allowed bg-zinc-950'
            }`}
          >
            <Redo2 size={16} />
          </button>

          {/* Reset */}
          <button
            onClick={resetEdits}
            disabled={loading}
            title="Discard all changes"
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>

          {/* Save */}
          <button
            onClick={saveChanges}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-instagram-primary to-instagram-secondary hover:opacity-90 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
