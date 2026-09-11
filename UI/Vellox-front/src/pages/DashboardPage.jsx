import React, { useState } from 'react';
import AppRail from '../components/layout/AppRail';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import JoinRoomModal from '../components/ui/JoinRoomModal';
import AddFriendModal from '../components/ui/AddFriendModal';

export default function DashboardPage() {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active conversation state: { type: 'room' | 'direct', id: string, name: string, roomCode?: string }
  const [activeConversation, setActiveConversation] = useState(null);

  const handleRefreshLists = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] font-sans text-slate-300 overflow-hidden selection:bg-cyan-500/30">
      <AppRail />
      
      {/* Sidebar with friends, rooms, and pending requests */}
      <Sidebar 
        activeConversation={activeConversation}
        onSelectConversation={(conv) => setActiveConversation(conv)}
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
        onOpenAddFriendModal={() => setIsAddFriendModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />
      
      {/* Real-time chat area for rooms and direct messaging */}
      <ChatArea activeConversation={activeConversation} />

      {/* Room Modal for Joining or Creating rooms */}
      {isRoomModalOpen && (
        <JoinRoomModal 
          onClose={() => setIsRoomModalOpen(false)} 
          onRoomActionSuccess={handleRefreshLists}
        />
      )}

      {/* Add Friend Modal */}
      {isAddFriendModalOpen && (
        <AddFriendModal 
          onClose={() => setIsAddFriendModalOpen(false)} 
          onRequestSent={handleRefreshLists}
        />
      )}
    </div>
  );
}