import React, { useState } from 'react';
import api from '../../services/api';

export default function AddFriendModal({ onClose, onRequestSent }) {
  const [targetUsername, setTargetUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.post('/friends/requests', {
        targetUsername: targetUsername.trim(),
      });
      setSuccess(response.data?.message || 'Friend request sent successfully!');
      if (onRequestSent) {
        onRequestSent();
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to send friend request. Check the username and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090F]/80 backdrop-blur-sm transition-all p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-slate-700/60 bg-[#131825]/95 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex flex-col items-center text-center mt-1">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-slate-50">Add a Friend</h3>
          <p className="mt-1 text-xs text-slate-400">
            Enter a user's exact username to send them a friend request.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-center text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center text-xs font-medium text-emerald-400">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Username</label>
            <input 
              type="text" 
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="e.g. john_doe" 
              required
              className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !targetUsername.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? 'Sending Request...' : 'Send Friend Request'}
          </button>
        </form>

      </div>
    </div>
  );
}
