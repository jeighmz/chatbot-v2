import React from 'react';
import '../App.css';

const LoadingScreen = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoadingScreen; 