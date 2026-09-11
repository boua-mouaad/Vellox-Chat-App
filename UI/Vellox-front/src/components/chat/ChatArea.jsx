import React, { useState, useContext, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { AuthContext } from '../../contexts/AuthContext';
import { WebSocketContext } from '../../contexts/WebSocketContext';

export default function ChatArea({ activeConversation, currentRoomId }) {
  const { user } = useContext(AuthContext);
  const { isConnected } = useContext(WebSocketContext);

  // Fallback if older prop currentRoomId was passed
  const conversation = activeConversation || (currentRoomId ? { type: 'room', id: currentRoomId, name: 'Room' } : null);
  
  const { messages, sendMessage, isLoading } = useChat(conversation);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Auto-scroll to the bottom when new messages arrive
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue(''); // Clear the input field immediately
    }
  };

  const handleCopyCode = () => {
    if (conversation?.roomCode) {
      navigator.clipboard.writeText(conversation.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!conversation || !conversation.id) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-[#06090F] relative overflow-hidden p-6 text-center">
        <div className="h-16 w-16 mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">No conversation selected</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Select a friend or join a room from the sidebar to begin messaging in real time.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-[#06090F] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800/60 px-6 z-10 bg-[#0B0F19]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
            conversation.type === 'room' 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          }`}>
            {conversation.type === 'room' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">{conversation.name || 'Chat'}</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] text-slate-500">
                {conversation.type === 'room' ? 'Room' : 'Direct Message'} &bull; {isConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {conversation.roomCode && (
          <div className="flex items-center gap-2 bg-[#131825] border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-500 text-[11px]">Room Code:</span>
            <span className="font-mono font-bold text-cyan-400 tracking-wider">{conversation.roomCode}</span>
            <button 
              onClick={handleCopyCode}
              title="Copy code to share"
              className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded"
            >
              {copied ? (
                <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 space-y-5 z-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-cyan-400 text-xs font-medium animate-pulse">Loading message history...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs">
            <p>No messages here yet.</p>
            <p className="mt-1 text-slate-600">Say hello to kick things off!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Compare senderId to current authenticated user id
            const isMine = Boolean(user?.id && msg.senderId && String(msg.senderId) === String(user.id));
            const senderDisplayName = isMine ? 'You' : (msg.senderUsername || 'Member');
            const initials = (msg.senderUsername || 'U').substring(0, 2).toUpperCase();

            let formattedTime = '';
            if (msg.createdAt) {
              try {
                formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                formattedTime = '';
              }
            }

            return (
              <div key={msg.id || index} className={`group flex items-start space-x-3 ${isMine ? 'justify-end' : ''}`}>
                
                {/* Avatar for received messages */}
                {!isMine && (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mt-1 shadow-md">
                    {initials}
                  </div>
                )}

                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className={`text-xs font-semibold ${isMine ? 'text-cyan-300' : 'text-fuchsia-300'}`}>
                      {senderDisplayName}
                    </span>
                    {formattedTime && (
                      <span className="text-[10px] text-slate-500">
                        {formattedTime}
                      </span>
                    )}
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine 
                      ? 'rounded-tr-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_4px_15px_rgba(34,211,238,0.15)] border border-cyan-400/20' 
                      : 'rounded-tl-sm bg-[#131825] border-l-2 border-l-purple-500 border-y border-r border-slate-800/80 text-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                  }`}>
                    {msg.content}
                  </div>
                </div>

                {/* Avatar for my own messages */}
                {isMine && (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold mt-1 shadow-md">
                    {(user?.username || 'ME').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* Invisible div to force auto-scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 px-6 z-10 border-t border-slate-800/40 bg-[#0B0F19]/50 backdrop-blur-sm">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-[#131825]/90 backdrop-blur-md px-3 py-1.5 shadow-lg focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${conversation.name || ''}...`} 
            className="flex-1 bg-transparent px-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </div>

    </main>
  );
}