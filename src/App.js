import React, { useState } from "react";
import "./App.css";
import Chatbot from "./components/Chatbot";
import ModelList from "./components/ModelList";

function App() {
  const [selectedModels, setSelectedModels] = useState([]);

  return (
    <div className="App">
      <h1>Ask AI</h1>
      <p> powered by ChatGPT, Groq accelerated TPU inference, Mem0 long-term memory</p>
      <div className="center-section">
        <ModelList onSelectionChange={setSelectedModels} />
        <Chatbot selectedModels={selectedModels} />
      </div>
    </div>
  );
}

export default App;