import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Chatbot from "./Chatbot";
import "../App.css";

const ChatContainer = forwardRef(({ selectedModels }, ref) => {
  const [chatInstances, setChatInstances] = useState([{ id: 1, name: "Chat 1", assignedModels: [] }]);
  const [inputs, setInputs] = useState({ 1: "" });
  const [sendMessages, setSendMessages] = useState({});

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    sendToAllChats: (message, omitMemory = false) => {
      const timestamp = Date.now();
      const newSendMessages = {};
      
      chatInstances.forEach(chat => {
        if (chat.assignedModels.length > 0) {
          newSendMessages[chat.id] = { message, timestamp: timestamp + chat.id, omitMemory };
        }
      });
      
      setSendMessages(prev => ({ ...prev, ...newSendMessages }));
    }
  }));

  // Distribute selected models across chat instances
  useEffect(() => {
    if (selectedModels.length === 0) {
      // Clear all model assignments when no models are selected
      setChatInstances(prev => prev.map(chat => ({ ...chat, assignedModels: [] })));
      return;
    }

    setChatInstances(prev => {
      const updatedChats = [...prev];
      
      // Clear all assignments first
      updatedChats.forEach(chat => {
        chat.assignedModels = [];
      });

      // Distribute models across chats
      selectedModels.forEach((model, index) => {
        const chatIndex = index % updatedChats.length;
        updatedChats[chatIndex].assignedModels.push(model);
      });

      return updatedChats;
    });
  }, [selectedModels]);

  const addNewChat = () => {
    if (chatInstances.length >= 3) {
      alert("You can only have up to 3 chats at a time.");
      return;
    }
    const newId = chatInstances.length + 1;
    setChatInstances([...chatInstances, { id: newId, name: `Chat ${newId}`, assignedModels: [] }]);
    setInputs(prev => ({ ...prev, [newId]: "" }));
  };

  const removeChat = (chatId) => {
    if (chatInstances.length > 1) {
      setChatInstances(chatInstances.filter(chat => chat.id !== chatId));
      setInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[chatId];
        return newInputs;
      });
    }
  };

  const handleInputChange = (chatId, value) => {
    setInputs(prev => ({ ...prev, [chatId]: value }));
  };

  const handleSendMessage = (chatId) => {
    const message = inputs[chatId];
    if (message.trim()) {
      setSendMessages(prev => ({ ...prev, [chatId]: { message, timestamp: Date.now() } }));
      setInputs(prev => ({ ...prev, [chatId]: "" }));
    }
  };

  const handleMessageSent = (chatId) => {
    setSendMessages(prev => {
      const newSendMessages = { ...prev };
      delete newSendMessages[chatId];
      return newSendMessages;
    });
  };

  const handleKeyPress = (chatId, e) => {
    if (e.key === 'Enter') {
      handleSendMessage(chatId);
    }
  };

  // Determine CSS class based on number of chats
  const getGridClass = () => {
    switch (chatInstances.length) {
      case 1:
        return 'single-chat';
      case 2:
        return 'double-chat';
      case 3:
        return 'triple-chat';
      default:
        return 'single-chat';
    }
  };

  return (
    <div className="chat-container">
      <div className={`chat-grid ${getGridClass()}`}>
        {chatInstances.map((chat) => (
          <div key={chat.id} className="chat-instance">
            <div className="chat-header">
              <div>
                <h3>{chat.name}</h3>
                {chatInstances.length > 1 && (
                  <button 
                    className="remove-chat-btn"
                    onClick={() => removeChat(chat.id)}
                    title="Remove chat"
                  >
                    ×
                  </button>
                )}
              </div>
              {chat.assignedModels.length > 0 && (
                <div className="assigned-models">
                  {chat.assignedModels.map((model, index) => (
                    <span key={index} className="model-badge">
                      {model}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Chatbot 
              selectedModels={chat.assignedModels} 
              onSendMessage={sendMessages[chat.id] ? {
                message: sendMessages[chat.id].message,
                omitMemory: sendMessages[chat.id].omitMemory,
                onSent: () => handleMessageSent(chat.id)
              } : null}
            />
            <div className="input-area">
              <input 
                type="text" 
                value={inputs[chat.id] || ""} 
                onChange={(e) => handleInputChange(chat.id, e.target.value)}
                onKeyPress={(e) => handleKeyPress(chat.id, e)}
                placeholder="Type a message or paste a YouTube link..." 
              />
              <button onClick={() => handleSendMessage(chat.id)}>Send</button>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className={`add-chat-btn ${chatInstances.length >= 3 ? 'disabled' : ''}`}
        onClick={addNewChat}
        disabled={chatInstances.length >= 3}
        title={chatInstances.length >= 3 ? "Maximum 3 chats allowed" : "Add new chat"}
      >
        +
      </button>
    </div>
  );
});

export default ChatContainer; 