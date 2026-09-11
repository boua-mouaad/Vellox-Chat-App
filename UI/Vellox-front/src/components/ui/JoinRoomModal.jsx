import React, { useState } from 'react';
import api from '../../services/api';

export default function JoinRoomModal({ onClose, onRoomActionSuccess }) {
  const [mode, setMode] = useState('join'); // 'join' | 'create'
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/rooms/join', { roomCode: roomCode.trim().toUpperCase() });
      setSuccess('Successfully joined room!');
      if (onRoomActionSuccess) {
        onRoomActionSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join room. Check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.post('/rooms', { roomName: roomName.trim() });
      const { roomId, roomCode: newCode, message } = response.data;
      setCreatedRoom({ id: roomId, name: roomName.trim(), roomCode: newCode });
      setSuccess(message || 'Room created successfully!');
      if (onRoomActionSuccess) {
        onRoomActionSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdRoom?.roomCode) {
      navigator.clipboard.writeText(createdRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-slate-50">
            {mode === 'join' ? 'Join a Room' : 'Create a Room'}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'join' 
              ? 'Enter an existing Room Code to join your team.' 
              : 'Create a new room and share the code with others.'}
          </p>
        </div>

        {/* Mode Switcher */}
        {!createdRoom && (
          <div className="mb-5 flex rounded-lg bg-[#06090F] p-1 border border-slate-800/60">
            <button 
              type="button"
              onClick={() => { setMode('join'); setError(''); setSuccess(''); }} 
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${mode === 'join' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Join by Code
            </button>
            <button 
              type="button"
              onClick={() => { setMode('create'); setError(''); setSuccess(''); }} 
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${mode === 'create' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Create New
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-center text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        {success && !createdRoom && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center text-xs font-medium text-emerald-400">
            {success}
          </div>
        )}

        {/* Created Room Success State */}
        {createdRoom ? (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-cyan-500/30 bg-[#06090F] p-4">
              <span className="text-[11px] text-slate-400 block mb-1">Room Created: <strong className="text-slate-200">{createdRoom.name}</strong></span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-mono text-xl font-bold tracking-widest text-cyan-400">{createdRoom.roomCode}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">Share this code with your friends so they can join!</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-[1.01] transition-transform"
            >
              Done
            </button>
          </div>
        ) : mode === 'join' ? (
          /* Join Form */
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Room Code</label>
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. 7F3K-92AX" 
                required
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 font-mono text-sm uppercase text-cyan-400 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || !roomCode.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Room Name</label>
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Project Alpha" 
                required
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || !roomName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}