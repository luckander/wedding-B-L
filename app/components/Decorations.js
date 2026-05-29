import React from "react";

export function FlowerDivider({ className = "" }) {
  return (
    <div 
      className={`flower-divider-container ${className}`} 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        margin: "3rem auto", 
        width: "100%",
        pointerEvents: "none"
      }}
    >
      <img 
        src="/flower-divider.svg" 
        alt="Divisor Floral" 
        style={{ 
          width: "120px", 
          height: "auto", 
          opacity: 0.45 
        }} 
      />
    </div>
  );
}

export function CornerLeaves({ className = "", position = "top-left", size = 80, opacity = 0.2 }) {
  // position can be top-left, top-right, bottom-left, bottom-right
  const getStyles = () => {
    switch (position) {
      case "top-left": 
        return { 
          top: 0, 
          left: 0, 
          transform: "scale(1)" 
        };
      case "top-right": 
        return { 
          top: 0, 
          right: 0, 
          transform: "scaleX(-1)" 
        };
      case "bottom-left": 
        return { 
          bottom: 0, 
          left: 0, 
          transform: "scaleY(-1)" 
        };
      case "bottom-right": 
        return { 
          bottom: 0, 
          right: 0, 
          transform: "scale(-1)" 
        };
      default: 
        return { top: 0, left: 0 };
    }
  };
  
  return (
    <img 
      src="/corner-leaves.svg" 
      alt="Moldura de Folhas de Canto" 
      className={`corner-leaves ${className}`} 
      style={{ 
        position: "absolute", 
        width: `${size}px`, 
        height: `${size}px`, 
        opacity: opacity, 
        pointerEvents: "none",
        zIndex: 1,
        transition: "opacity 0.3s ease",
        ...getStyles() 
      }} 
    />
  );
}
