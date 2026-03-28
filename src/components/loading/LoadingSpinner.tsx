"use client";

import React, { useEffect, useState } from "react";

const LoadingSpinner: React.FC = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-transparent z-50'>
      <div className='relative flex items-center justify-center w-32 h-32'>
        {/* Outer ring — slow rotate */}
        <span
          className='absolute inset-0 rounded-full border-4 border-transparent'
          style={{
            borderTopColor: "#38bdf8",
            borderRightColor: "#818cf8",
            animation: "spin 1.6s linear infinite",
          }}
        />

        {/* Middle ring — counter-rotate */}
        <span
          className='absolute rounded-full border-4 border-transparent'
          style={{
            inset: "14px",
            borderBottomColor: "#f472b6",
            borderLeftColor: "#34d399",
            animation: "spinReverse 1.1s linear infinite",
          }}
        />

        {/* Inner ring — fast pulse-spin */}
        <span
          className='absolute rounded-full border-4 border-transparent'
          style={{
            inset: "28px",
            borderTopColor: "#fb923c",
            borderRightColor: "#a78bfa",
            animation: "spin 0.7s linear infinite",
          }}
        />

        {/* Core glow dot */}
        <span
          className='absolute rounded-full'
          style={{
            inset: "44px",
            background:
              "radial-gradient(circle, #f0abfc 0%, #818cf8 60%, transparent 100%)",
            animation: "pulse 1.4s ease-in-out infinite",
            boxShadow: "0 0 18px 6px #818cf880",
          }}
        />

        {/* Orbiting dot */}
        <span
          className='absolute w-3 h-3 rounded-full'
          style={{
            background: "#38bdf8",
            boxShadow: "0 0 10px 3px #38bdf8aa",
            top: "4px",
            left: "50%",
            transformOrigin: "50% 60px",
            transform: `translateX(-50%) rotate(${tick * 6}deg)`,
            transition: "transform 0.08s linear",
          }}
        />

        {/* Second orbiting dot */}
        <span
          className='absolute w-2 h-2 rounded-full'
          style={{
            background: "#f472b6",
            boxShadow: "0 0 8px 2px #f472b6aa",
            top: "14px",
            left: "50%",
            transformOrigin: "50% 50px",
            transform: `translateX(-50%) rotate(${-tick * 9 + 120}deg)`,
            transition: "transform 0.08s linear",
          }}
        />
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
