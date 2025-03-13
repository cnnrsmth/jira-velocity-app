import { useState, useEffect } from "react";
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
};

// Define a consistent color scheme for each area
const areaColors = {
  overall: "rgba(59, 130, 246, 0.8)", // Blue
  Web: "rgba(99, 102, 241, 0.8)", // Indigo
  Backend: "rgba(139, 92, 246, 0.8)", // Purple
  Mobile: "rgba(167, 139, 250, 0.8)", // Violet
  "Data Engineering": "rgba(196, 181, 253, 0.8)", // Light purple
};

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(new Set(["overall"]));
  const [displayMode, setDisplayMode] = useState("points"); // "points" or "tickets"
  const [sprintRange, setSprintRange] = useState([0, 100]); // [min, max] as percentages
  const [sprintNumbers, setSprintNumbers] = useState([]);

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

      const area = row[headers.indexOf("Custom field (Engineering Area)")];
      if (!area || area.trim() === "") return; // Skip if no engineering area

      const pointsStr = row[headers.indexOf("Custom field (Story Points)")];
      const points = parseInt(pointsStr);
      if (isNaN(points)) return; // Skip if no valid story points

      // Add to set of engineering areas
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

      // Initialize area data if needed
      if (!velocityBySprintAndArea[completionSprint].byArea[area]) {
        velocityBySprintAndArea[completionSprint].byArea[area] = 0;
        ticketCountBySprintAndArea[completionSprint].byArea[area] = 0;
      }

      // Add points
      velocityBySprintAndArea[completionSprint].byArea[area] += points;
      velocityBySprintAndArea[completionSprint].total += points;

      // Increment ticket count
      ticketCountBySprintAndArea[completionSprint].byArea[area] += 1;
      ticketCountBySprintAndArea[completionSprint].total += 1;
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
    };
  };

  const filteredData = getFilteredData();
  const {
    chartData: filteredChartData,
    averageVelocity,
    averageByArea,
    ticketCountByArea,
  } = filteredData;

  const getFilteredChartDataForDisplay = () => {
    if (!data || filteredChartData.length === 0) return [];

    const dataToFilter = filteredChartData;

    const filteredDisplayData = selectedAreas.has("overall")
      ? dataToFilter
      : dataToFilter.map((sprint) => {
          const filteredSprint = { sprint: sprint.sprint };
          selectedAreas.forEach((area) => {
            filteredSprint[area] = sprint[area] || 0;
            filteredSprint[`${area}Tickets`] = sprint[`${area}Tickets`] || 0;
          });
          return filteredSprint;
        });

    // If we're displaying tickets, transform the data
    if (displayMode === "tickets") {
      return filteredDisplayData.map((sprint) => {
        const ticketSprint = { sprint: sprint.sprint };

        // For all engineering areas being displayed
        const areasToInclude = selectedAreas.has("overall")
          ? data.engineeringAreas
          : Array.from(selectedAreas);

        areasToInclude.forEach((area) => {
          // Use the ticket count as the primary value
          ticketSprint[area] = sprint[`${area}Tickets`] || 0;
        });

        return ticketSprint;
      });
    }

    return filteredDisplayData;
  };

  const handleRangeChange = (e, index) => {
    const newValue = parseInt(e.target.value);

    let newRange = [...sprintRange];

    if (index === 0) {
      // Updating minimum value
      newRange[0] = Math.min(newValue, newRange[1] - 5);
    } else {
      // Updating maximum value
      newRange[1] = Math.max(newValue, newRange[0] + 5);
    }

    setSprintRange(newRange);
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
            <div className="grid grid-cols-5 gap-4">
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
                      style={{ color: areaColors.overall }}
                    >
                      {icons.overall}
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

              {Object.entries(averageByArea).map(([area, average]) => (
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
                        style={{ color: areaColors[area] }}
                      >
                        {icons[area] || icons.overall}
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
                      displayMode === "points" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Story Points
                  </div>
                  <div
                    className={`flex-1 flex justify-center items-center z-10 text-sm ${
                      displayMode === "tickets" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Tickets
                  </div>
                </div>
              </div>

              {/* Sprint Range Slider */}
              <div className="mb-8 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Sprint Range:</span>
                  <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                    Sprint {displayMin} – {displayMax}
                  </span>
                </div>

                <div className="relative h-12 flex items-center mb-2">
                  {/* Track */}
                  <div className="absolute w-full h-1 bg-gray-700 rounded-full"></div>

                  {/* Range highlight */}
                  <div
                    className="absolute h-1 bg-blue-500 rounded-full"
                    style={{
                      left: `${sprintRange[0]}%`,
                      width: `${sprintRange[1] - sprintRange[0]}%`,
                    }}
                  ></div>

                  {/* Min & Max Thumb Labels */}
                  <div
                    className="absolute text-xs text-gray-400 -top-4 transform -translate-x-1/2"
                    style={{ left: `${sprintRange[0]}%` }}
                  >
                    Min
                  </div>
                  <div
                    className="absolute text-xs text-gray-400 -top-4 transform -translate-x-1/2"
                    style={{ left: `${sprintRange[1]}%` }}
                  >
                    Max
                  </div>

                  {/* Min handle with z-index to be on top when needed */}
                  <input
                    type="range"
                    min="0"
                    max="95"
                    value={sprintRange[0]}
                    onChange={(e) => handleRangeChange(e, 0)}
                    className="absolute w-full appearance-none bg-transparent z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                  />

                  {/* Max handle */}
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={sprintRange[1]}
                    onChange={(e) => handleRangeChange(e, 1)}
                    className="absolute w-full appearance-none bg-transparent z-10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sprint {sprintNumbers[0] || 0}</span>
                  <span>
                    Sprint {sprintNumbers[sprintNumbers.length - 1] || 0}
                  </span>
                </div>
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
                    ).map((area) => (
                      <Bar
                        key={area}
                        dataKey={
                          displayMode === "points" ? area : `${area}Tickets`
                        }
                        stackId="a"
                        fill={areaColors[area]}
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
