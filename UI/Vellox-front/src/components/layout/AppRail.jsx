import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function AppRail() {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials = (user?.username || 'ME').substring(0, 2).toUpperCase();

  return (
    <nav className="relative flex w-16 flex-col items-center justify-between border-r border-slate-800/60 bg-[#06090F] py-6 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-white font-bold text-lg cursor-pointer">
          V
        </div>
        
        {/* Active Chat Icon */}
        <div className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-800/50 text-cyan-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>
      </div>
      
      {/* Current User Profile & Popover */}
      <div className="relative">
        <div 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={`Signed in as ${user?.username || 'User'}`}
          className="h-10 w-10 cursor-pointer rounded-full p-0.5 bg-linear-to-tr from-cyan-400 to-blue-500 transition-transform hover:scale-105"
        >
          <div className="h-full w-full rounded-full bg-slate-900 border-2 border-[#06090F] flex items-center justify-center text-xs font-bold text-white uppercase">
            {initials}
          </div>
        </div>

        {/* Profile Menu Popover */}
        {isMenuOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute left-14 bottom-0 w-48 rounded-xl border border-slate-700/60 bg-[#131825] p-3 shadow-2xl z-50 backdrop-blur-md"
          >
            <div className="mb-2.5 pb-2 border-b border-slate-800">
              <div className="text-xs font-bold text-slate-100 truncate">{user?.username || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || ''}</div>
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}