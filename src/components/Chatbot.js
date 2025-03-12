import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../App.css"; // Ensure you include your CSS file

const Chatbot = ({ selectedModels }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

  const addMessage = (message, sender, isMemory = false) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender, message, isMemory, collapsed: isMemory ? true : false },
    ]);
  };

  const toggleCollapse = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].collapsed = !updatedMessages[index].collapsed;
    setMessages(updatedMessages);
  };

  const fetchYouTubeTranscript = async (videoId) => {
    try {
      const response = await axios.post("http://localhost:5001/api/youtube-transcript", {
        videoId,
      });

      return response.data.transcript || null;
    } catch (error) {
      console.error("Error fetching YouTube transcript:", error);
      return null;
    }
  };

  const sendMessage = async (message) => {
  if (!message.trim() || selectedModels.length === 0) return;

  setLoading(true);
  addMessage(message, "user");

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const youtubeMatch = message.match(youtubeRegex);

  // Handle YouTube transcript
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    addMessage("Fetching transcript...", "system");

    const response = await axios.post("http://localhost:5001/api/youtube-transcript", {
      videoId,
    });

    if (response.data.transcript) {
      const transcript = response.data.transcript;

      // Directly pass transcript into the summarization prompt without storing it as memory
      const summarizationPrompt = `Summarize the key points of this YouTube video transcript:\n\n${transcript}`;
      addMessage(summarizationPrompt, "system"); // Add as a system message (NOT MEMORY)

      // Now send summarization prompt to the chatbot
      const chatResponse = await axios.post("http://localhost:5001/api/chat", {
        message: summarizationPrompt,
        models: selectedModels,
      });

      chatResponse.data.forEach((botResponse) => {
        addMessage(botResponse.response, botResponse.model);
      });
    } else {
      addMessage("Could not retrieve transcript for the YouTube video.", "system");
    }

    setLoading(false);
    return;
  }

  // Default behavior for non-YouTube messages
  try {
    const response = await axios.post("http://localhost:5001/api/chat", {
      message,
      models: selectedModels,
    });

    response.data.forEach((botResponse) => {
      if (botResponse.retrieved_memory && botResponse.retrieved_memory.length > 0) {
        const memoryMarkdown = botResponse.retrieved_memory
          .map((mem) => `- ${mem}`)
          .join("\n");
        addMessage(memoryMarkdown, "memory", true);
      }
      addMessage(botResponse.response, botResponse.model);
    });
  } catch (error) {
    console.error("Error:", error);
    addMessage("Error fetching response", "system");
  }

  setLoading(false);
  setInput("");
};

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="chat-placeholder">
            <p>👋 Welcome! Type a message or paste a YouTube link to summarize.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-block ${msg.isMemory ? "memory-block" : ""} ${msg.sender === "user" ? "user-block" : ""}`}>
            {msg.isMemory ? (
              <div className="memory-container">
                <div className="memory-header" onClick={() => toggleCollapse(index)} style={{ cursor: "pointer" }}>
                  <span>Retrieved Memory</span>
                  <button className="collapse-btn">{msg.collapsed ? "Expand" : "Collapse"}</button>
                </div>
                {!msg.collapsed && <div className="memory-content"><ReactMarkdown>{msg.message}</ReactMarkdown></div>}
              </div>
            ) : (
              <>
                {msg.sender !== "user" && (
                  <div className="sender-info">
                    <img src={`/images/${msg.sender}.png`} alt={msg.sender} className="sender-logo" />
                    <span className="sender-name">{msg.sender}</span>
                  </div>
                )}
                <div className={`message ${msg.sender}`}>
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        ))}

        {loading && <div className="loading">Bot is thinking...</div>}
      </div>

      <div className="input-area">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message or paste a YouTube link..." />
        <button onClick={() => sendMessage(input)} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;