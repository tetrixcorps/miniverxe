import React, { useState, useEffect } from 'react';
import { useApi } from '../services/api';
import RingLightRoom from './RingLightRoom';
import './RingLightManager.css';

interface Room {
  room_id: string;
  name: string;
  owner_id: string;
  participant_count: number;
  is_active: boolean;
  created_at: number;
}

const RingLightManager: React.FC = () => {
  const api = useApi();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/ringlight/rooms');
      setRooms(response.data.rooms);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      return;
    }
    
    try {
      const response = await api.post('/api/ringlight/rooms', {
        room_name: newRoomName.trim(),
        is_public: true
      });
      
      if (response.status === 200) {
        // Join the newly created room
        setSelectedRoom(response.data.room_id);
        setIsCreatingRoom(false);
        setNewRoomName('');
        // Refresh the room list
        fetchRooms();
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleCloseRoom = () => {
    setSelectedRoom(null);
    // Refresh the room list when leaving a room
    fetchRooms();
  };

  if (selectedRoom) {
    return <RingLightRoom roomId={selectedRoom} onClose={handleCloseRoom} />;
  }

  return (
    <div className="ring-light-manager">
      <div className="manager-header">
        <h1>RingLight Rooms</h1>
        <button 
          className="create-room-button"
          onClick={() => setIsCreatingRoom(!isCreatingRoom)}
        >
          {isCreatingRoom ? 'Cancel' : 'Create Room'}
        </button>
      </div>
      
      {isCreatingRoom && (
        <form className="create-room-form" onSubmit={handleCreateRoom}>
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name"
            required
          />
          <button type="submit">Create</button>
        </form>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      ) : (
        <div className="room-list">
          {rooms.length === 0 ? (
            <p className="no-rooms">No rooms available. Create one to get started!</p>
          ) : (
            rooms.map(room => (
              <div 
                key={room.room_id} 
                className="room-card"
                onClick={() => handleJoinRoom(room.room_id)}
              >
                <h3>{room.name}</h3>
                <div className="room-details">
                  <span className="participant-count">
                    {room.participant_count} participants
                  </span>
                  {room.is_active && (
                    <span className="live-badge">LIVE</span>
                  )}
                </div>
                <div className="room-footer">
                  <span className="creation-time">
                    Created {new Date(room.created_at * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RingLightManager; 