import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../../config';
import './Chats.css'

function Chats() {
  const socket = useRef();
  const inputRef = useRef();
  const allMessagesRef = useRef([]);
  const currentRoomRef = useRef('general');
  const usernameRef = useRef('');
  const isInitializedRef = useRef(false);
  const groupsRef = useRef([
    { id: 'general', name: 'General Chat' }
  ]);
  const messagesAreaRef = useRef(null); // Add ref for messages area
  const modalInputRef = useRef(null); // Add ref for modal input
  
  // Keep these as useState since they affect UI rendering
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [allMessages, setAllMessages] = useState([]); // Keep this for rendering messages

  // Load saved groups from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem('chatGroups');
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups);
      groupsRef.current = [
        { id: 'general', name: 'General Chat' },
        ...parsedGroups.filter(group => group.id !== 'general')
      ];
    }
  }, []);

  // Save groups to localStorage whenever they change
  const saveGroups = () => {
    const groupsToSave = groupsRef.current.filter(group => group.id !== 'general');
    localStorage.setItem('chatGroups', JSON.stringify(groupsToSave));
  };

  // Auto-focus modal input when modal opens
  useEffect(() => {
    if (showGroupModal && modalInputRef.current) {
      modalInputRef.current.focus();
    }
  }, [showGroupModal]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  function sendMessage() {
    if (!inputRef.current.value.trim() || !usernameRef.current) return;
    
    const message = {
      type: 'message',
      payload: {
        roomId: currentRoomRef.current,
        userName: usernameRef.current,
        message: inputRef.current.value,
        time: new Date().toISOString()
      }
    };
    
    socket.current.send(JSON.stringify(message));
    inputRef.current.value = '';
  }

  // asking for username
  // and saving it to localStorage
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedUsername = localStorage.getItem('userName');
      if (savedUsername) {
        usernameRef.current = savedUsername;
        isInitializedRef.current = true;
      } else { //instead of prompt use model. TODO
        alert("please sign in to continue");
        // const name = prompt('Please enter your username:');
        // if (name) {
        //   usernameRef.current = name;
        //   localStorage.setItem('userName', name);
        //   isInitializedRef.current = true;
        // }
      }
    }
  }, []);

  // Connect to WebSocket and handle messages
  useEffect(() => {
    if (!usernameRef.current || !isInitializedRef.current) return;
    //websocket connection port
    const ws = new WebSocket(WS_URL);
    socket.current = ws;

    ws.onopen = () => {
      // Join the current room
      const joinMessage = {
        type: 'join',
        payload: {
          roomId: currentRoomRef.current,
          userName: usernameRef.current,
          message: `${usernameRef.current} joined the room`,
          time: new Date().toISOString()
        }
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history') {
        // Handle chat history
        const historyMessages = JSON.parse(data.payload.message);
        const formattedHistory = historyMessages.map(msg => ({
          type: 'message',
          payload: {
            roomId: msg.roomId,
            userName: msg.userName,
            message: msg.message,
            time: msg.time
          }
        }));
        allMessagesRef.current = formattedHistory;
        setAllMessages(formattedHistory);
      } else {
        // Handle regular messages
        allMessagesRef.current = [...allMessagesRef.current, data];
        setAllMessages([...allMessagesRef.current]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = (roomId) => {
    currentRoomRef.current = roomId;
    allMessagesRef.current = [];
    setAllMessages([]); // Clear messages before loading history
    
    // Send join message to load history
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      const joinMessage = {
        type: 'join',
        payload: {
          roomId: roomId,
          userName: usernameRef.current,
          message: `${usernameRef.current} joined the room`,
          time: new Date().toISOString()
        }
      };
      socket.current.send(JSON.stringify(joinMessage));
    }

    // Focus the chat input after a short delay to ensure room change is complete
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const openGroupModal = () => {
    setShowGroupModal(true);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setRoomIdInput('');
  };

  const handleGroupAction = (action) => {
    if (!roomIdInput.trim()) return;
    
    const roomId = roomIdInput.trim();
    
    if (action === 'create') {
      // Check if group already exists
      if (groupsRef.current.some(group => group.id === roomId)) {
        alert('A group with this ID already exists');
        return;
      }
      
      // Add new group
      const newGroup = { id: roomId, name: roomId };
      groupsRef.current = [...groupsRef.current, newGroup];
      saveGroups(); // Save groups after adding new one
      joinRoom(roomId);
    } 
    
    else if (action === 'join') {
      // Check if group exists
      if (!groupsRef.current.some(group => group.id === roomId)) {
        alert("No such room exists, You can create one.");
        return;
      }

      joinRoom(roomId);
    }
    
    closeGroupModal();
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        {/* <div className="user-profile">
          <div className="user-avatar">👤</div>
          <div className="user-name">{usernameRef.current}</div>
        </div> */}
        <div className="groups-list">
          <div className="groups-header">
            <h3>Groups</h3>
            <button className="add-group-btn" onClick={openGroupModal}>+</button>
          </div>
          {groupsRef.current.map(group => (
            <div 
              key={group.id}
              className={`group-item ${currentRoomRef.current === group.id ? 'active' : ''}`}
              onClick={() => joinRoom(group.id)}
            >
              {group.name}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        <div className="messages-area" ref={messagesAreaRef}>
          {allMessages.map((msg, index) => (
            <div key={index} className={`message ${msg.payload.userName === usernameRef.current ? 'own-message' : ''}`}>
              <div className="message-header">
                <span className="user-id">{msg.payload.userName}</span>
                <span className="time">{new Date(msg.payload.time).toLocaleTimeString()}</span>
              </div>
              <div className="message-content">{msg.payload.message}</div>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input 
            ref={inputRef} 
            placeholder="Type your message..." 
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-form">
              <input
                ref={modalInputRef}
                type="text"
                placeholder="Enter Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) {
                      handleGroupAction('create');
                    } else {
                      handleGroupAction('join');
                    }
                  }
                }}
              />
              <div className="modal-actions">
                <button onClick={() => handleGroupAction('join')}>
                  Join
                </button>
                <button onClick={() => handleGroupAction('create')}>
                  Create
                </button>
                <button onClick={closeGroupModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;