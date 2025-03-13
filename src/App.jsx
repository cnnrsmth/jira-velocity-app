import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Scatter,
  ZAxis,
} from "recharts";

// Icons for each area (you can replace these with your preferred icons)
const icons = {
  overall: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
    </svg>
  ),
  Web: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  Backend: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  ),
  Mobile: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
    </svg>
  ),
  "Data Engineering": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  ),
  Design: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.64.64 1.06 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" />
      <circle cx="6.5" cy="11.5" r="1.5" />
      <circle cx="9.5" cy="7.5" r="1.5" />
      <circle cx="14.5" cy="7.5" r="1.5" />
      <circle cx="17.5" cy="11.5" r="1.5" />
    </svg>
  ),
  "Data Analytics": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-5h2v5zm4 0h-2v-7h2v7zm4 0h-2V7h2v10z" />
    </svg>
  ),
  // Generic icon for any other engineering area
  generic: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.5,16 C15.3284271,16 16,16.6715729 16,17.5 C16,18.3284271 15.3284271,19 14.5,19 C13.6715729,19 13,18.3284271 13,17.5 C13,16.6715729 13.6715729,16 14.5,16 Z M8.5,16 C9.32842712,16 10,16.6715729 10,17.5 C10,18.3284271 9.32842712,19 8.5,19 C7.67157288,19 7,18.3284271 7,17.5 C7,16.6715729 7.67157288,16 8.5,16 Z M14.5,11 C15.3284271,11 16,11.6715729 16,12.5 C16,13.3284271 15.3284271,14 14.5,14 C13.6715729,14 13,13.3284271 13,12.5 C13,11.6715729 13.6715729,11 14.5,11 Z M8.5,11 C9.32842712,11 10,11.6715729 10,12.5 C10,13.3284271 9.32842712,14 8.5,14 C7.67157288,14 7,13.3284271 7,12.5 C7,11.6715729 7.67157288,11 8.5,11 Z M14.5,6 C15.3284271,6 16,6.67157288 16,7.5 C16,8.32842712 15.3284271,9 14.5,9 C13.6715729,9 13,8.32842712 13,7.5 C13,6.67157288 13.6715729,6 14.5,6 Z M8.5,6 C9.32842712,6 10,6.67157288 10,7.5 C10,8.32842712 9.32842712,9 8.5,9 C7.67157288,9 7,8.32842712 7,7.5 C7,6.67157288 7.67157288,6 8.5,6 Z" />
    </svg>
  ),
};

// Base color palette
const baseColors = {
  overall: "rgba(59, 130, 246, 0.8)", // Blue
  Web: "rgba(99, 102, 241, 0.8)", // Indigo
  Backend: "rgba(139, 92, 246, 0.8)", // Purple
  Mobile: "rgba(167, 139, 250, 0.8)", // Violet
  "Data Engineering": "rgba(196, 181, 253, 0.8)", // Light purple
  Design: "rgba(236, 72, 153, 0.8)", // Pink
  "Data Analytics": "rgba(16, 185, 129, 0.8)", // Emerald
};

// Function to generate a color for an area that doesn't have a predefined color
const generateColorForArea = (area, index = 0) => {
  // If the area has a predefined color, use it
  if (baseColors[area]) {
    return baseColors[area];
  }

  // Otherwise, generate a color based on the area name
  // This ensures the same area always gets the same color
  const hue =
    (area.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) +
      index * 50) %
    360;
  return `hsla(${hue}, 70%, 60%, 0.8)`;
};

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(new Set(["overall"]));
  const [displayMode, setDisplayMode] = useState("points"); // "points" or "tickets"
  const [sprintRange, setSprintRange] = useState([0, 100]); // [min, max] as percentages
  const [sprintNumbers, setSprintNumbers] = useState([]);
  const [showSprintFilter, setShowSprintFilter] = useState(false);

  const sprintFilterRef = useRef(null);

  // Close the sprint filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sprintFilterRef.current &&
        !sprintFilterRef.current.contains(event.target)
      ) {
        setShowSprintFilter(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // For quick preset filters
  const applyPresetFilter = (presetType) => {
    switch (presetType) {
      case "all":
        setSprintRange([0, 100]);
        break;
      case "last3":
        if (sprintNumbers.length > 0) {
          const percentage = Math.max(
            0,
            100 - (3 / sprintNumbers.length) * 100
          );
          setSprintRange([percentage, 100]);
        }
        break;
      case "last6":
        if (sprintNumbers.length > 0) {
          const percentage = Math.max(
            0,
            100 - (6 / sprintNumbers.length) * 100
          );
          setSprintRange([percentage, 100]);
        }
        break;
      default:
        break;
    }
    setShowSprintFilter(false);
  };

  const validateColumns = (headers) => {
    const requiredColumns = {
      "Issue key": "Ticket",
      "Custom field (Engineering Area)": "Engineering Area",
      "Custom field (Story Points)": "Story Points",
      Status: "Status",
    };

    const missingColumns = Object.entries(requiredColumns)
      .filter(([csvHeader]) => !headers.includes(csvHeader))
      .map(([_, requiredName]) => requiredName);

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Find all Sprint columns
    return headers.reduce((sprintCols, header, index) => {
      if (header === "Sprint") {
        sprintCols.push(index);
      }
      return sprintCols;
    }, []);
  };

  const processData = (results) => {
    const headers = results.data[0];
    const sprintColumnIndexes = validateColumns(headers);

    // Track all unique engineering areas we encounter
    const engineeringAreas = new Set();

    // Initialize velocity data structure
    const velocityBySprintAndArea = {};

    // Track ticket counts by sprint and area
    const ticketCountBySprintAndArea = {};

    // Track assignees by area and sprint
    const assigneesByAreaAndSprint = {};

    // Process each row
    results.data.slice(1).forEach((row) => {
      if (!row || row.length < headers.length) return; // Skip empty or malformed rows

      const status = row[headers.indexOf("Status")];
      if (status !== "Done") return; // Skip non-done items

      // Find the last non-empty sprint
      let completionSprint = null;
      for (let i = sprintColumnIndexes.length - 1; i >= 0; i--) {
        const sprintValue = row[sprintColumnIndexes[i]];
        if (sprintValue && sprintValue.trim() !== "") {
          completionSprint = sprintValue;
          break;
        }
      }

      if (!completionSprint) return; // Skip if no sprint found

      // Get assignee
      const assigneeIdx = headers.indexOf("Assignee");
      const assignee = assigneeIdx >= 0 ? row[assigneeIdx] : null;

      // Check for Engineering Area across multiple possible columns
      let area = null;

      // First try the exact match column
      const exactMatchIdx = headers.indexOf("Custom field (Engineering Area)");
      if (
        exactMatchIdx >= 0 &&
        row[exactMatchIdx] &&
        row[exactMatchIdx].trim() !== ""
      ) {
        area = row[exactMatchIdx];
      } else {
        // Try all columns that contain "Engineering Area" in their name
        for (let i = 0; i < headers.length; i++) {
          if (
            headers[i].includes("Engineering Area") &&
            row[i] &&
            row[i].trim() !== ""
          ) {
            area = row[i];
            break;
          }
        }
      }

      if (!area || area.trim() === "") return; // Skip if no engineering area found

      // Add to set of engineering areas (do this regardless of story points)
      engineeringAreas.add(area);

      // Initialize sprint data if needed
      if (!velocityBySprintAndArea[completionSprint]) {
        velocityBySprintAndArea[completionSprint] = {
          total: 0,
          byArea: {},
        };
      }

      // Initialize ticket count data if needed
      if (!ticketCountBySprintAndArea[completionSprint]) {
        ticketCountBySprintAndArea[completionSprint] = {
          total: 0,
          byArea: {},
        };
      }

      // Initialize assignee tracking if needed
      if (!assigneesByAreaAndSprint[completionSprint]) {
        assigneesByAreaAndSprint[completionSprint] = {};
      }
      if (!assigneesByAreaAndSprint[completionSprint][area]) {
        assigneesByAreaAndSprint[completionSprint][area] = new Set();
      }

      // Add assignee to tracking if available
      if (assignee) {
        assigneesByAreaAndSprint[completionSprint][area].add(assignee);
      }

      // Initialize area data if needed (for both points and tickets)
      if (!velocityBySprintAndArea[completionSprint].byArea[area]) {
        velocityBySprintAndArea[completionSprint].byArea[area] = 0;
      }
      if (!ticketCountBySprintAndArea[completionSprint].byArea[area]) {
        ticketCountBySprintAndArea[completionSprint].byArea[area] = 0;
      }

      // Always increment ticket count regardless of story points
      ticketCountBySprintAndArea[completionSprint].byArea[area] += 1;
      ticketCountBySprintAndArea[completionSprint].total += 1;

      // Only add story points if they are valid
      const pointsStr = row[headers.indexOf("Custom field (Story Points)")];
      const points = parseInt(pointsStr);
      if (!isNaN(points)) {
        velocityBySprintAndArea[completionSprint].byArea[area] += points;
        velocityBySprintAndArea[completionSprint].total += points;
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(velocityBySprintAndArea)
      .map(([sprint, data]) => {
        const ticketData = ticketCountBySprintAndArea[sprint] || {
          total: 0,
          byArea: {},
        };
        const result = {
          sprint,
          total: data.total,
          totalTickets: ticketData.total,
          ...data.byArea,
        };

        // Add ticket counts with a suffix to distinguish them
        engineeringAreas.forEach((area) => {
          result[`${area}Tickets`] = ticketData.byArea[area] || 0;
        });

        return result;
      })
      .sort((a, b) => {
        const getSprintNumber = (sprint) => {
          const match = sprint.match(/Sprint (\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        return getSprintNumber(a.sprint) - getSprintNumber(b.sprint);
      });

    // Prepare assignee data - collect all assignees by area across all sprints
    const assigneesByArea = {};
    engineeringAreas.forEach((area) => {
      assigneesByArea[area] = new Set();
    });

    Object.values(assigneesByAreaAndSprint).forEach((sprintData) => {
      Object.entries(sprintData).forEach(([area, assignees]) => {
        assignees.forEach((assignee) => {
          assigneesByArea[area].add(assignee);
        });
      });
    });

    // Convert Sets to Arrays for easier use
    Object.keys(assigneesByArea).forEach((area) => {
      assigneesByArea[area] = Array.from(assigneesByArea[area]);
    });

    // Calculate averages
    const sprintCount = chartData.length;
    const averageVelocity =
      sprintCount > 0
        ? chartData.reduce((sum, sprint) => sum + sprint.total, 0) / sprintCount
        : 0;

    const averageByArea = {};
    const ticketCountByArea = {};
    engineeringAreas.forEach((area) => {
      averageByArea[area] =
        sprintCount > 0
          ? chartData.reduce((sum, sprint) => sum + (sprint[area] || 0), 0) /
            sprintCount
          : 0;

      ticketCountByArea[area] =
        sprintCount > 0
          ? chartData.reduce(
              (sum, sprint) => sum + (sprint[`${area}Tickets`] || 0),
              0
            )
          : 0;
    });

    return {
      chartData,
      averageVelocity,
      averageByArea,
      engineeringAreas: Array.from(engineeringAreas),
      ticketCountByArea,
      assigneesByAreaAndSprint,
      assigneesByArea,
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setError(null);

      Papa.parse(file, {
        complete: (results) => {
          try {
            const processedData = processData(results);
            setData(processedData);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          setError("Error parsing CSV file: " + err.message);
          setLoading(false);
        },
        header: false,
      });
    }
  };

  const toggleArea = (area) => {
    const newSelected = new Set(selectedAreas);
    if (area === "overall") {
      setSelectedAreas(new Set(["overall"]));
      return;
    }

    // Remove "overall" if it's selected
    newSelected.delete("overall");

    if (newSelected.has(area)) {
      newSelected.delete(area);
      // If nothing is selected, select overall
      if (newSelected.size === 0) {
        newSelected.add("overall");
      }
    } else {
      newSelected.add(area);
    }

    setSelectedAreas(newSelected);
  };

  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === "points" ? "tickets" : "points");
  };

  useEffect(() => {
    if (data) {
      // Initialize the sprint range to include all sprints
      setSprintRange([0, 100]);

      // Extract sprint numbers for the slider labels
      const sprintNums = data.chartData
        .map((sprint) => {
          const match = sprint.sprint.match(/Sprint (\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b);

      setSprintNumbers(sprintNums);
    }
  }, [data]);

  const getSprintNumber = (sprint) => {
    const match = sprint.match(/Sprint (\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getFilteredData = () => {
    if (!data)
      return {
        chartData: [],
        averageVelocity: 0,
        averageByArea: {},
        ticketCountByArea: {},
        filteredAssigneesByArea: {},
      };

    // Calculate the actual sprint numbers from the percentage range
    const minPercentage = sprintRange[0];
    const maxPercentage = sprintRange[1];

    const sprintMin = Math.floor(
      sprintNumbers[0] +
        (sprintNumbers[sprintNumbers.length - 1] - sprintNumbers[0]) *
          (minPercentage / 100)
    );

    const sprintMax = Math.ceil(
      sprintNumbers[0] +
        (sprintNumbers[sprintNumbers.length - 1] - sprintNumbers[0]) *
          (maxPercentage / 100)
    );

    // Filter data based on sprint range
    const filteredChartData = data.chartData.filter((sprint) => {
      const sprintNum = getSprintNumber(sprint.sprint);
      return sprintNum >= sprintMin && sprintNum <= sprintMax;
    });

    // Get the filtered sprint names
    const filteredSprintNames = filteredChartData.map((item) => item.sprint);

    // Filter assignees based on the sprint range
    const filteredAssigneesByArea = {};
    data.engineeringAreas.forEach((area) => {
      filteredAssigneesByArea[area] = new Set();
    });

    // Only include assignees who contributed in the filtered sprints
    filteredSprintNames.forEach((sprintName) => {
      const sprintData = data.assigneesByAreaAndSprint[sprintName];
      if (sprintData) {
        Object.entries(sprintData).forEach(([area, assignees]) => {
          assignees.forEach((assignee) => {
            filteredAssigneesByArea[area].add(assignee);
          });
        });
      }
    });

    // Convert Sets to Arrays
    Object.keys(filteredAssigneesByArea).forEach((area) => {
      filteredAssigneesByArea[area] = Array.from(filteredAssigneesByArea[area]);
    });

    if (filteredChartData.length === 0)
      return {
        chartData: filteredChartData,
        averageVelocity: 0,
        averageByArea: Object.fromEntries(
          data.engineeringAreas.map((area) => [area, 0])
        ),
        ticketCountByArea: Object.fromEntries(
          data.engineeringAreas.map((area) => [area, 0])
        ),
        filteredAssigneesByArea,
      };

    // Recalculate averages
    const averageVelocity =
      filteredChartData.reduce((sum, sprint) => sum + sprint.total, 0) /
      filteredChartData.length;

    const averageByArea = {};
    const ticketCountByArea = {};

    data.engineeringAreas.forEach((area) => {
      // Calculate average points per sprint for this area
      averageByArea[area] =
        filteredChartData.reduce(
          (sum, sprint) => sum + (sprint[area] || 0),
          0
        ) / filteredChartData.length;

      // Calculate total tickets for this area
      ticketCountByArea[area] = filteredChartData.reduce(
        (sum, sprint) => sum + (sprint[`${area}Tickets`] || 0),
        0
      );
    });

    return {
      chartData: filteredChartData,
      averageVelocity,
      averageByArea,
      ticketCountByArea,
      filteredAssigneesByArea,
    };
  };

  const filteredData = getFilteredData();
  const {
    chartData: filteredChartData,
    averageVelocity,
    averageByArea,
    ticketCountByArea,
    filteredAssigneesByArea,
  } = filteredData;

  const getFilteredChartDataForDisplay = () => {
    if (!data || filteredChartData.length === 0) return [];

    const dataToFilter = filteredChartData;

    // If we're displaying tickets, transform the data
    if (displayMode === "tickets") {
      return dataToFilter.map((sprint) => {
        const ticketSprint = { sprint: sprint.sprint };

        // For all engineering areas being displayed
        const areasToInclude = selectedAreas.has("overall")
          ? data.engineeringAreas
          : Array.from(selectedAreas);

        areasToInclude.forEach((area) => {
          // Just use the area name directly for ticket counts in tickets mode
          ticketSprint[area] = sprint[`${area}Tickets`] || 0;
        });

        return ticketSprint;
      });
    } else {
      // Points mode
      return selectedAreas.has("overall")
        ? dataToFilter
        : dataToFilter.map((sprint) => {
            const filteredSprint = { sprint: sprint.sprint };
            selectedAreas.forEach((area) => {
              filteredSprint[area] = sprint[area] || 0;
            });
            return filteredSprint;
          });
    }
  };

  // Handle range change from the dropdowns
  const handleRangeChange = (type, value) => {
    const numValue = parseInt(value);
    const newRange = [...sprintRange];

    // Convert the actual sprint number to percentage for our internal state
    if (sprintNumbers.length > 0) {
      const minNum = sprintNumbers[0];
      const maxNum = sprintNumbers[sprintNumbers.length - 1];
      const totalRange = maxNum - minNum;

      if (type === "min") {
        // Convert min sprint to percentage
        const percentage =
          totalRange > 0 ? ((numValue - minNum) / totalRange) * 100 : 0;
        newRange[0] = Math.max(0, Math.min(newRange[1] - 5, percentage));
      } else {
        // Convert max sprint to percentage
        const percentage =
          totalRange > 0 ? ((numValue - minNum) / totalRange) * 100 : 100;
        newRange[1] = Math.min(100, Math.max(newRange[0] + 5, percentage));
      }

      setSprintRange(newRange);
    }
  };

  // Get the actual min and max sprint numbers from the percentage range
  const displayMin =
    sprintNumbers.length > 0
      ? Math.floor(
          sprintNumbers[0] +
            (sprintNumbers[sprintNumbers.length - 1] - sprintNumbers[0]) *
              (sprintRange[0] / 100)
        )
      : 0;

  const displayMax =
    sprintNumbers.length > 0
      ? Math.ceil(
          sprintNumbers[0] +
            (sprintNumbers[sprintNumbers.length - 1] - sprintNumbers[0]) *
              (sprintRange[1] / 100)
        )
      : 0;

  // Sprint filter component with dropdown selectors
  const SprintFilterControls = ({ showLabels = true }) => {
    return (
      <div className="w-full">
        {showLabels && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-400">
              Sprint Range
            </span>
            <span className="text-xs font-medium bg-gray-700/80 px-2 py-0.5 rounded">
              {displayMin} – {displayMax}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              From Sprint
            </label>
            <select
              value={displayMin}
              onChange={(e) => handleRangeChange("min", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              {sprintNumbers.map((num) => (
                <option
                  key={`min-${num}`}
                  value={num}
                  disabled={num > displayMax - 1}
                >
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-6">
            <span className="text-gray-400">—</span>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              To Sprint
            </label>
            <select
              value={displayMax}
              onChange={(e) => handleRangeChange("max", e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              {sprintNumbers.map((num) => (
                <option
                  key={`max-${num}`}
                  value={num}
                  disabled={num < displayMin + 1}
                >
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Get icon for an engineering area
  const getIconForArea = (area) => {
    return icons[area] || icons.generic;
  };

  // Get color for an engineering area
  const getColorForArea = (area, index) => {
    return baseColors[area] || generateColorForArea(area, index);
  };

  // Create a component for the Avatars section
  const AvatarGroup = ({ assignees, maxDisplay = 5 }) => {
    if (!assignees || assignees.length === 0) {
      return null;
    }

    const totalAssignees = assignees.length;
    const displayedAssignees = assignees.slice(0, maxDisplay);
    const remainingAssignees = assignees.slice(maxDisplay);
    const remainingCount = totalAssignees - maxDisplay;

    // Function to get the initial from name
    const getInitial = (name) => {
      return name ? name.trim().charAt(0).toUpperCase() : "?";
    };

    // Function to get a deterministic color based on name
    const getAvatarColor = (name) => {
      const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-teal-500",
      ];

      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    // Custom tooltip component
    const Tooltip = ({ content, children }) => {
      const [showTooltip, setShowTooltip] = useState(false);
      const [tooltipPosition, setTooltipPosition] = useState({
        top: 0,
        left: 0,
      });
      const childRef = useRef(null);

      // Calculate position when tooltip visibility changes
      useEffect(() => {
        if (showTooltip && childRef.current) {
          const rect = childRef.current.getBoundingClientRect();
          setTooltipPosition({
            top: rect.top - 5, // Position above the avatar
            left: rect.left + rect.width / 2,
          });
        }
      }, [showTooltip]);

      return (
        <div
          className="relative group"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          ref={childRef}
        >
          {children}

          {showTooltip && (
            <div
              className="fixed z-[999] transform -translate-x-1/2 -translate-y-full"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                marginBottom: "10px",
              }}
            >
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg border border-gray-700 whitespace-nowrap">
                {content}
              </div>
              <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b border-gray-700"></div>
            </div>
          )}
        </div>
      );
    };

    // Multiple names tooltip component
    const MultiTooltip = ({ names }) => {
      const [showTooltip, setShowTooltip] = useState(false);
      const [tooltipPosition, setTooltipPosition] = useState({
        top: 0,
        left: 0,
      });
      const childRef = useRef(null);

      // Calculate position when tooltip visibility changes
      useEffect(() => {
        if (showTooltip && childRef.current) {
          const rect = childRef.current.getBoundingClientRect();
          setTooltipPosition({
            top: rect.bottom + 5, // Position below the +X badge
            left: rect.left,
          });
        }
      }, [showTooltip]);

      return (
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          ref={childRef}
        >
          <div className="relative z-0 inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-gray-800 bg-gray-600">
            <span className="text-xs font-medium text-white">
              +{remainingCount}
            </span>
          </div>

          {showTooltip && (
            <div
              className="fixed z-[999]"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
              }}
            >
              <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg border border-gray-700">
                <p className="font-semibold mb-2">Other contributors:</p>
                <ul className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {names.map((name, idx) => (
                    <li key={idx} className="whitespace-nowrap">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute -top-1 left-4 border-l border-t border-gray-700"></div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-wrap -space-x-2 mt-3">
        {displayedAssignees.map((assignee, index) => (
          <Tooltip key={index} content={assignee}>
            <div
              className={`relative z-10 inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-gray-800 ${getAvatarColor(
                assignee
              )} transition-transform hover:scale-110`}
              style={{ zIndex: 20 - index }}
            >
              <span className="text-xs font-medium text-white">
                {getInitial(assignee)}
              </span>
            </div>
          </Tooltip>
        ))}

        {remainingCount > 0 && <MultiTooltip names={remainingAssignees} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Squad Velocity
          </h1>
          <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-start space-x-2">
              <div className="w-1 h-16 bg-blue-500 rounded-full mt-1" />
              <div>
                <h2 className="text-lg font-semibold">
                  Understanding Velocity
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Track completed story points across sprints. Each bar shows
                  work completed when tickets move to 'Done'. Click the cards
                  below to filter by engineering area.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!data && (
          <div className="flex flex-col items-center justify-center space-y-4 p-12 border-2 border-dashed border-gray-600 rounded-lg backdrop-blur-sm bg-gray-800/30">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-gray-400">
              Upload your Jira CSV file to view insights
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div
                onClick={() => toggleArea("overall")}
                className={`bg-gray-800 p-6 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700 relative overflow-hidden group ${
                  selectedAreas.has("overall") ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-5 h-5"
                      style={{ color: getColorForArea("overall") }}
                    >
                      {getIconForArea("overall")}
                    </div>
                    <h3 className="text-gray-400 text-sm">Overall Velocity</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div
                      className={
                        displayMode === "points" ? "opacity-100" : "opacity-60"
                      }
                    >
                      <p className="text-3xl font-bold">
                        {averageVelocity.toFixed(1)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Avg points</p>
                    </div>
                    <div className="h-8 border-r border-gray-700 mx-1"></div>
                    <div
                      className={
                        displayMode === "tickets" ? "opacity-100" : "opacity-60"
                      }
                    >
                      <p className="text-xl font-semibold text-right">
                        {filteredChartData.length > 0
                          ? (
                              filteredChartData.reduce(
                                (sum, sprint) => sum + sprint.totalTickets,
                                0
                              ) / filteredChartData.length
                            ).toFixed(1)
                          : "0.0"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Avg tickets</p>
                    </div>
                  </div>
                </div>
              </div>

              {Object.entries(averageByArea).map(([area, average], index) => (
                <div
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`bg-gray-800 p-6 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700 relative overflow-hidden group ${
                    selectedAreas.has(area) ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-5 h-5"
                        style={{ color: getColorForArea(area, index) }}
                      >
                        {getIconForArea(area)}
                      </div>
                      <h3 className="text-gray-400 text-sm">{area}</h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <div
                        className={
                          displayMode === "points"
                            ? "opacity-100"
                            : "opacity-60"
                        }
                      >
                        <p className="text-3xl font-bold">
                          {average.toFixed(1)}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Avg points</p>
                      </div>
                      <div className="h-8 border-r border-gray-700 mx-1"></div>
                      <div
                        className={
                          displayMode === "tickets"
                            ? "opacity-100"
                            : "opacity-60"
                        }
                      >
                        <p className="text-xl font-semibold text-right">
                          {ticketCountByArea[area]}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Total tickets
                        </p>
                      </div>
                    </div>

                    {/* Contributors section */}
                    {filteredAssigneesByArea &&
                      filteredAssigneesByArea[area] &&
                      filteredAssigneesByArea[area].length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">
                            Contributors
                          </p>
                          <AvatarGroup
                            assignees={filteredAssigneesByArea[area]}
                            maxDisplay={7}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Sprint Velocity Trend</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {displayMode === "points"
                      ? "Story points completed per sprint"
                      : "Tickets completed per sprint"}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sprint Filter Dropdown */}
                  <div className="relative" ref={sprintFilterRef}>
                    <button
                      onClick={() => setShowSprintFilter(!showSprintFilter)}
                      className="flex items-center space-x-2 bg-gray-700/70 hover:bg-gray-700 text-sm py-1.5 px-3 rounded-lg transition-colors"
                    >
                      <span className="text-gray-300">
                        Sprint {displayMin} – {displayMax}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {showSprintFilter && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-50">
                        <div className="mb-4">
                          <SprintFilterControls showLabels={false} />
                        </div>

                        {/* Quick presets */}
                        <div className="space-y-1.5 border-t border-gray-700 pt-3">
                          <h4 className="text-xs text-gray-400 mb-2">
                            Quick filters
                          </h4>
                          <button
                            onClick={() => applyPresetFilter("all")}
                            className="w-full text-left text-sm text-gray-300 hover:text-white py-1 px-2 rounded hover:bg-gray-700/50 transition-colors"
                          >
                            All sprints
                          </button>
                          <button
                            onClick={() => applyPresetFilter("last3")}
                            className="w-full text-left text-sm text-gray-300 hover:text-white py-1 px-2 rounded hover:bg-gray-700/50 transition-colors"
                          >
                            Last 3 sprints
                          </button>
                          <button
                            onClick={() => applyPresetFilter("last6")}
                            className="w-full text-left text-sm text-gray-300 hover:text-white py-1 px-2 rounded hover:bg-gray-700/50 transition-colors"
                          >
                            Last 6 sprints
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <div
                    onClick={toggleDisplayMode}
                    className="relative flex items-center h-8 cursor-pointer bg-gray-700 rounded-full w-48 p-1"
                  >
                    <div
                      className={`absolute transition-transform duration-300 ease-in-out h-6 w-24 bg-blue-600 rounded-full ${
                        displayMode === "tickets"
                          ? "translate-x-[5.5rem]"
                          : "translate-x-0"
                      }`}
                    />
                    <div
                      className={`flex-1 flex justify-center items-center z-10 text-sm ${
                        displayMode === "points"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Story Points
                    </div>
                    <div
                      className={`flex-1 flex justify-center items-center z-10 text-sm ${
                        displayMode === "tickets"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Tickets
                    </div>
                  </div>
                </div>
              </div>

              {/* Sprint Range Controls for Mobile - Now using dropdowns */}
              <div className="md:hidden mb-8 mt-4">
                <SprintFilterControls showLabels={true} />
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredChartDataForDisplay()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={40}
                  >
                    <XAxis
                      dataKey="sprint"
                      scale="point"
                      padding={{ left: 40, right: 40 }}
                      tick={{ fill: "#9CA3AF" }}
                      tickFormatter={(value) =>
                        value.replace("Thor: Sprint ", "")
                      }
                    />
                    <YAxis
                      tick={{ fill: "#9CA3AF" }}
                      label={{
                        value:
                          displayMode === "points" ? "Story Points" : "Tickets",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#9CA3AF",
                        offset: 10,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(31, 41, 55, 0.9)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(55, 65, 81, 0.5)",
                        borderRadius: "0.375rem",
                      }}
                      labelStyle={{ color: "#9CA3AF" }}
                      itemStyle={{ color: "#9CA3AF" }}
                      formatter={(value, name) => [
                        `${value} ${
                          displayMode === "points" ? "points" : "tickets"
                        }`,
                        name,
                      ]}
                      labelFormatter={(label) =>
                        `Sprint ${label.replace("Thor: Sprint ", "")}`
                      }
                    />
                    {Array.from(
                      selectedAreas.has("overall")
                        ? data.engineeringAreas
                        : selectedAreas
                    ).map((area, index) => (
                      <Bar
                        key={area}
                        dataKey={area}
                        stackId="a"
                        fill={getColorForArea(area, index)}
                        name={area}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
