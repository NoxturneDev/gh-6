"use client";

import React, { useState, useRef, useEffect } from 'react';

const MAP_SOURCES = {
  default: "/default_map.jpg",
  sumatra: "/sumatra_active.jpg",
  java: "/default_map.jpg",
  kalimantan: "/default_map.jpg",
  sulawesi: "/default_map.jpg",
  papua: "/default_map.jpg",
};

const regions = {
  sumatra: {
    name: "Sumatra",
    info: "Sumatra is the sixth-largest island in the world.",
    rect: { x: 0, y: 5, width: 30, height: 75 }
  },
  java: {
    name: "Java",
    info: "Java is the world's most populous island.",
    rect: { x: 25, y: 75, width: 25, height: 15 }
  },
  kalimantan: {
    name: "Kalimantan (Borneo)",
    info: "The island is divided among three countries.",
    rect: { x: 28, y: 10, width: 28, height: 60 }
  },
  sulawesi: {
    name: "Sulawesi",
    info: "Sulawesi is known for its distinctive K-shape.",
    rect: { x: 50, y: 30, width: 20, height: 50 }
  },
  papua: {
    name: "Papua (New Guinea)",
    info: "The western half of New Guinea is part of Indonesia.",
    rect: { x: 70, y: 25, width: 30, height: 55 }
  }
};

// Tooltip component to display information
const Tooltip = ({ content, position }) => {
  if (!content) return null;

  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(15px, -100%)',
    transition: 'opacity 0.2s ease-in-out',
  };

  return (
    <div style={style} className="bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 z-50 pointer-events-none max-w-xs">
      <h3 className="font-bold text-base mb-1">{content.name}</h3>
      <p>{content.info}</p>
    </div>
  );
};


export default function InteractiveMap() {
  const [currentMap, setCurrentMap] = useState(MAP_SOURCES.default);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Use a ref to hold the timer ID. This prevents re-renders.
  const debounceTimer = useRef(null);

  // --- DEBOUNCE LOGIC ---
  // This effect will run when the component unmounts to clear any pending timers.
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update tooltip position immediately for a smooth feel.
    setTooltipPosition({ x, y });

    // Clear the previous timer to reset the debounce period.
    clearTimeout(debounceTimer.current);

    // Set a new timer. The map will only change after the delay (e.g., 75ms).
    debounceTimer.current = setTimeout(() => {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      let activeRegion = null;

      for (const key in regions) {
        const region = regions[key];
        if (
          percentX >= region.rect.x &&
          percentX <= region.rect.x + region.rect.width &&
          percentY >= region.rect.y &&
          percentY <= region.rect.y + region.rect.height
        ) {
          activeRegion = key;
          break;
        }
      }

      if (activeRegion) {
        // Only update state if the new region is different from the current one.
        if (hoveredRegion?.name !== regions[activeRegion].name) {
          setCurrentMap(MAP_SOURCES[activeRegion]);
          setHoveredRegion(regions[activeRegion]);
        }
      } else {
        // If not over any region, revert to the default.
        if (hoveredRegion !== null) {
          setCurrentMap(MAP_SOURCES.default);
          setHoveredRegion(null);
        }
      }
    }, 10); // 75ms delay. You can adjust this value.
  };

  const handleMouseLeave = () => {
    // When the mouse leaves, clear any pending timers and reset to default.
    clearTimeout(debounceTimer.current);
    setCurrentMap(MAP_SOURCES.default);
    setHoveredRegion(null);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 md:p-8 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Interactive Map of Indonesia</h1>
      <p className="text-gray-600 mb-6 text-center">Hover over an island to see more information.</p>

      <div
        className="relative w-full max-w-4xl mx-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* The image source is now controlled by our state */}
        <img
          src={currentMap}
          alt="Map of Indonesia"
          className="w-full h-auto"
        />

        {/* The Tooltip still works the same way */}
        <Tooltip content={hoveredRegion} position={tooltipPosition} />
      </div>
    </div>
  );
}
