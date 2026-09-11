import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Sidebar({ 
  activeConversation, 
  onSelectConversation, 
  onOpenRoomModal, 
  onOpenAddFriendModal,
  refreshTrigger 
}) {
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Friends, Rooms, and Pending Requests
  const loadSidebarData = async () => {
    setLoadingData(true);
    try {
      const [friendsRes, roomsRes, requestsRes] = await Promise.all([
        api.get('/friends').catch(() => ({ data: [] })),
        api.get('/rooms').catch(() => ({ data: [] })),
        api.get('/friends/requests/pending').catch(() => ({ data: [] }))
      ]);

      setFriends(friendsRes.data || []);
      setRooms(roomsRes.data || []);
      setPendingRequests(requestsRes.data || []);
    } catch (err) {
      console.error("Failed to load sidebar lists", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadSidebarData();
  }, [refreshTrigger]);

  const handleAcceptRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.put(`/friends/requests/${requestId}/accept`);
      loadSidebarData();
    } catch (err) {
      console.error("Failed to accept friend request", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.delete(`/friends/requests/${requestId}/decline`);
      loadSidebarData();
    } catch (err) {
      console.error("Failed to decline friend request", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper avatar gradients
  const getGradient = (name = '') => {
    const gradients = [
      'from-purple-500 to-indigo-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Filter lists
  const filteredFriends = friends.filter((f) => 
    (f.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter((r) => 
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.roomCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCurrentActive = (type, id) => {
    return activeConversation?.type === type && String(activeConversation?.id) === String(id);
  };

  return (
    <aside className="flex w-72 flex-col border-r border-slate-800/60 bg-[#0B0F19] z-10 shrink-0">
      {/* Sidebar Header & Search */}
      <div className="px-4 py-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-base font-bold text-slate-100 tracking-tight">Conversations</span>
          <button
            onClick={loadSidebarData}
            title="Refresh"
            className="p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#131825] border border-slate-700/50 rounded-lg px-3 py-1.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends & rooms..." 
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Lists Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        
        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5 mx-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Friend Requests ({pendingRequests.length})
              </span>
            </div>
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 bg-[#131825] p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {(req.requester?.username || 'U').substring(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-200 font-medium truncate">{req.requester?.username}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleAcceptRequest(req.id)}
                      title="Accept"
                      className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleDeclineRequest(req.id)}
                      title="Decline"
                      className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Category */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Friends ({filteredFriends.length})</span>
            <button 
              onClick={onOpenAddFriendModal}
              title="Add a friend"
              className="text-cyan-400 hover:text-cyan-300 font-normal text-xs flex items-center gap-0.5"
            >
              + Add
            </button>
          </div>
          <div className="space-y-0.5">
            {filteredFriends.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-600 italic">
                {friends.length === 0 ? 'No friends added yet' : 'No matches found'}
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isActive = isCurrentActive('direct', friend.id);
                const initials = (friend.username || 'U').substring(0, 2).toUpperCase();
                const gradient = getGradient(friend.username);
                
                return (
                  <div 
                    key={friend.id}
                    onClick={() => onSelectConversation({ type: 'direct', id: friend.id, name: friend.username })}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-all ${
                      isActive ? 'bg-cyan-500/10 border border-cyan-500/20' : 'border border-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`h-7 w-7 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-[11px] font-bold shadow-md`}>
                          {initials}
                        </div>
                      </div>
                      <span className={`text-xs font-medium truncate transition-colors ${isActive ? 'text-cyan-200 font-semibold' : 'text-slate-300 group-hover:text-slate-100'}`}>
                        {friend.username}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rooms Category */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
            <span>Rooms ({filteredRooms.length})</span>
            <button 
              onClick={onOpenRoomModal}
              title="Join or create room"
              className="text-cyan-400 hover:text-cyan-300 font-normal text-xs flex items-center gap-0.5"
            >
              + Join / Create
            </button>
          </div>
          <div className="space-y-0.5">
            {filteredRooms.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-600 italic">
                {rooms.length === 0 ? 'No rooms joined yet' : 'No matches found'}
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isActive = isCurrentActive('room', room.id);
                
                return (
                  <div 
                    key={room.id}
                    onClick={() => onSelectConversation({ 
                      type: 'room', 
                      id: room.id, 
                      name: room.name, 
                      roomCode: room.roomCode 
                    })}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-all ${
                      isActive ? 'bg-cyan-500/10 border border-cyan-500/20' : 'border border-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isActive ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:border-cyan-500/50'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-xs font-medium truncate transition-colors ${isActive ? 'text-cyan-200 font-semibold' : 'text-slate-300 group-hover:text-slate-100'}`}>
                          {room.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono tracking-tight">{room.roomCode}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-slate-800/60 flex flex-col gap-2 bg-[#06090F]/50">
        <button 
          onClick={onOpenAddFriendModal}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Add Friend
        </button>
        <button 
          onClick={onOpenRoomModal}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600/10 border border-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-600/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Join / Create Room
        </button>
      </div>
    </aside>
  );
}