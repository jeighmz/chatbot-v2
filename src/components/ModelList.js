import React, { useState, useEffect } from "react";
import "../App.css"; // Ensure you include your CSS file

const ModelList = ({ onSelectionChange }) => {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await import("../data/groq-models.json");
        setModels(response.data);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    fetchModels();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedModels((prevSelected) => {
      const updatedSelection = prevSelected.includes(id)
        ? prevSelected.filter((modelId) => modelId !== id)
        : [...prevSelected, id];

      onSelectionChange(updatedSelection); // Pass selection to parent
      return updatedSelection;
    });
  };

  return (
    <div className="model-list">
      <h2>Select Models</h2>
      <div className="model-list-panel">
        {models.map((model) => (
          <label key={model.id} className="model-item">
            <input
              type="checkbox"
              checked={selectedModels.includes(model.id)}
              onChange={() => handleCheckboxChange(model.id)}
            />
            <span className="model-name">{model.id}</span>
            <span className="model-owner">({model.owned_by})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ModelList;