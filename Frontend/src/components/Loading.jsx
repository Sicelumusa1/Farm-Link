import React, { useState, useEffect } from "react";
import '../styles/Loader.css';

const Loading = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          if (onLoadingComplete) {
            setTimeout(onLoadingComplete, 300);
          }
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  
  return (
    <div className="loading-container">
      <div className="loading-bar" style={{ width: `${progress}%` }}></div>
      <div className="loading-content">
        <h1 className="loading-percentage">{progress}%</h1>
        <h2 className="loading-text">LOADING...</h2>
      </div>
    </div>
  );
};

export default Loading;