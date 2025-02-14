import { useState } from "react";
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

      // Initialize area data if needed
      if (!velocityBySprintAndArea[completionSprint].byArea[area]) {
        velocityBySprintAndArea[completionSprint].byArea[area] = 0;
      }

      // Add points
      velocityBySprintAndArea[completionSprint].byArea[area] += points;
      velocityBySprintAndArea[completionSprint].total += points;
    });

    // Convert to chart data format
    const chartData = Object.entries(velocityBySprintAndArea)
      .map(([sprint, data]) => ({
        sprint,
        total: data.total,
        ...data.byArea,
      }))
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
    engineeringAreas.forEach((area) => {
      averageByArea[area] =
        sprintCount > 0
          ? chartData.reduce((sum, sprint) => sum + (sprint[area] || 0), 0) /
            sprintCount
          : 0;
    });

    return {
      chartData,
      averageVelocity,
      averageByArea,
      engineeringAreas: Array.from(engineeringAreas),
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

  const getFilteredChartData = () => {
    if (!data) return [];
    if (selectedAreas.has("overall")) return data.chartData;

    return data.chartData.map((sprint) => {
      const filteredSprint = { sprint: sprint.sprint };
      selectedAreas.forEach((area) => {
        filteredSprint[area] = sprint[area] || 0;
      });
      return filteredSprint;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Thor Squad Velocity
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
                  <p className="text-3xl font-bold">
                    {data.averageVelocity.toFixed(1)}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Average per sprint
                  </p>
                </div>
              </div>

              {Object.entries(data.averageByArea).map(([area, average]) => (
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
                    <p className="text-3xl font-bold">{average.toFixed(1)}</p>
                    <p className="text-gray-400 text-xs mt-1">Average points</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Sprint Velocity Trend</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Story points completed per sprint
                </p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredChartData()}
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
                        value: "Story Points",
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
                      formatter={(value, name) => [`${value} points`, name]}
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
                        dataKey={area}
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
