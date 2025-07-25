"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import { Search } from "lucide-react";

const MAP_SOURCES = {
  default: "/default_map.jpg",
  sumatra: "/sumatra_active.jpg",
  java: "/default_map.jpg",
  kalimantan: "/default_map.jpg",
  sulawesi: "/default_map.jpg",
  papua: "/default_map.jpg",
};

// --- UI COMPONENTS ---

const Tooltip = ({ content, position }) => {
  if (!content) return null;
  return (
    <div
      style={{ position: "absolute", left: `${position.x}px`, top: `${position.y}px`, transform: "translate(15px, -100%)" }}
      className="bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 z-50 pointer-events-none max-w-xs"
    >
      <h3 className="font-bold text-base mb-1">{content.name}</h3>
      {content.description ? <p>{content.description}</p> : <p className="text-gray-400">No details available.</p>}
    </div>
  );
};

const RegionDetailsCard = ({ data, onClose }) => {
  const { name, description, reports, details } = data || {};

  const cardVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 30, stiffness: 200 } },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.2 } },
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "Completed":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case "In Progress":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>In Progress</span>;
      case "Pending":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 bg-opacity-60 flex items-end z-50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-t-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[85vh] flex flex-col"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Executive Summary</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The {name} region reports a total of <span className="font-bold">{details?.sekolahNegeri + details?.sekolahSwasta}</span> educational institutions, supported by{" "}
                    <span className="font-bold">{details?.teacherCount?.toLocaleString()}</span> teachers. The student population is significant, with <span className="font-bold">{details?.sdInSchool?.toLocaleString()}</span> elementary,{" "}
                    <span className="font-bold">{details?.smpInSchool?.toLocaleString()}</span> junior high, and <span className="font-bold">{details?.smaInSchool?.toLocaleString()}</span> senior high students currently enrolled. However,
                    there is a notable number of out-of-school children across all levels, indicating potential challenges in access and retention.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Statistics</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 font-medium text-gray-600">Total Public Schools (Sekolah Negeri)</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.sekolahNegeri?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-gray-600">Total Private Schools (Sekolah Swasta)</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.sekolahSwasta?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 font-medium text-gray-600">Total Teachers</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.teacherCount?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-gray-600">Elementary Students (In School)</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.sdInSchool?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 font-medium text-gray-600">Elementary Students (Out of School)</td>
                          <td className="p-3 text-red-600 font-semibold text-right">{details?.sdOutSchool?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-gray-600">Junior High Students (In School)</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.smpInSchool?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 font-medium text-gray-600">Junior High Students (Out of School)</td>
                          <td className="p-3 text-red-600 font-semibold text-right">{details?.smpOutSchool?.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-gray-600">Senior High Students (In School)</td>
                          <td className="p-3 text-gray-800 font-semibold text-right">{details?.smaInSchool?.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 font-medium text-gray-600">Senior High Students (Out of School)</td>
                          <td className="p-3 text-red-600 font-semibold text-right">{details?.smaOutSchool?.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function InteractiveMap() {
  const regions = {
    sumatra: {
      id: 2,
      name: "Sumatra",
      rect: { x: 0, y: 5, width: 30, height: 75 },
    },
    jawa: {
      id: 1,
      name: "Jawa",
      rect: { x: 25, y: 75, width: 25, height: 15 },
    },
    kalimantan: {
      id: 3,
      name: "Kalimantan",
      rect: { x: 28, y: 10, width: 28, height: 60 },
    },
    sulawesi: {
      id: 4,
      name: "Sulawesi",
      rect: { x: 50, y: 30, width: 20, height: 50 },
    },
    papua: {
      id: 5,
      name: "Papua",
      rect: { x: 70, y: 25, width: 30, height: 55 },
    },
  };

  const [currentMap, setCurrentMap] = useState(MAP_SOURCES.default);
  const [hoveredRegionKey, setHoveredRegionKey] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedRegionData, setSelectedRegionData] = useState(null);

  // New state to hold the fetched details
  const [regionDetails, setRegionDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 3. Real API fetch function using axios
  const fetchRegionStats = async (id) => {
    try {
      console.log(`Fetching data for region ID: ${id}...`);
      const response = await axios.get(`http://localhost:3000/api/stats/${id}`);

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`No data found for region ID ${id}`);
      } else {
        console.error(`An error occurred while fetching data for region ID ${id}:`, error);
      }
      return null;
    }
  };

  const debounceTimer = useRef(null);

  // Effect to fetch all region data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      console.log("Fetching all region stats...");
      setIsLoading(true);
      try {
        const promises = Object.entries(regions).map(async ([key, region]) => {
          const data = await fetchRegionStats(region.id);
          return { key, data };
        });

        const results = await Promise.all(promises);

        const detailsMap = results.reduce((acc, { key, data }) => {
          if (data) {
            acc[key] = data;
          }
          return acc;
        }, {});

        setRegionDetails(detailsMap);
        console.log("Fetched data:", detailsMap);
      } catch (err) {
        console.error("Failed to fetch region data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTooltipPosition({ x, y });

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      let activeRegionKey = null;

      for (const key in regions) {
        const region = regions[key];
        if (percentX >= region.rect.x && percentX <= region.rect.x + region.rect.width && percentY >= region.rect.y && percentY <= region.rect.y + region.rect.height) {
          activeRegionKey = key;
          break;
        }
      }
      setHoveredRegionKey(activeRegionKey);
    }, 50);
  };

  useEffect(() => {
    if (hoveredRegionKey) {
      setCurrentMap(MAP_SOURCES[hoveredRegionKey]);
    } else {
      setCurrentMap(MAP_SOURCES.default);
    }
  }, [hoveredRegionKey]);

  const handleMouseLeave = () => {
    clearTimeout(debounceTimer.current);
    setHoveredRegionKey(null);
  };

  const handleClick = async () => {
    const id = regions[hoveredRegionKey]?.id;

    const details = await fetchRegionStats(1);

    console.log("details", details);
    setSelectedRegionData(details);
  };

  const getTooltipContent = () => {
    if (!hoveredRegionKey) return null;
    const baseInfo = regions[hoveredRegionKey];
    const details = regionDetails[hoveredRegionKey];
    // Combine base info with fetched description for the tooltip
    return {
      name: baseInfo.name,
      description: details ? details.description : "Details not available.",
    };
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-screen overflow-hidden">
      {!isLoading && (
        <div className="border border-blue-700 w-1/2 mx-auto flex items-center rounded-full">
          <div className="px-8 py-2 flex gap-x-4 w-full">
            <Search className="text-blue-700 cursor-pointer" />
            <input
              className="rounded-full w-full focus:outline-none focus:border-none placeholder:text-blue-700"
              placeholder="Provinsi Kota"
            />
          </div>
          <div className="w-1/2 flex text-blue-700 justify-center gap-x-8">
            <Link href="/">Home</Link>
            <Link href="/explore">Explore</Link>
          </div>
        </div>
      )}

      <div
        className="relative w-full max-w-4xl mx-auto cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {isLoading ? (
          <div className="w-full aspect-[16/9] flex items-center justify-center rounded-lg animate-pulse">
            <p className="text-gray-500">Loading Map Data...</p>
          </div>
        ) : (
          <img
            src={currentMap}
            alt="Map of Indonesia"
            className="w-full h-auto"
          />
        )}
        <Tooltip
          content={getTooltipContent()}
          position={tooltipPosition}
        />
      </div>

      <RegionDetailsCard
        data={selectedRegionData}
        onClose={() => setSelectedRegionData(null)}
      />
    </div>
  );
}
