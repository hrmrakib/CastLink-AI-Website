import React from "react";

interface FullScreenLoaderProps {
  isLoading: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loaderContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // Highly transparent white
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    // Light blur keeps content underneath "seeable" but soft
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 9999,
  },
  spinner: {
    width: "40px",
    height: "40px",
    // Semi-transparent ring to match the glass vibe
    border: "4px solid rgba(0, 0, 0, 0.05)",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export default FullScreenLoader;
