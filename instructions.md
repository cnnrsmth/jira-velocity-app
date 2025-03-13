# Code Explanation: Squad Velocity Dashboard

This code defines a React component that enables users to upload a Jira-exported CSV file and view a dashboard displaying sprint velocity data. The application processes the CSV data, calculates metrics, and renders a bar chart to visualize completed story points over several sprints. It also provides interactive filters to view velocity by different engineering areas.

---

## CSV File Structure

The CSV file is expected to have a header row followed by data rows. The key columns required for the code to work correctly are:

- **Issue key**  
  _Identifier for each ticket._

- **Custom field (Engineering Area)**  
  _Indicates the engineering area (e.g., Web, Backend, Mobile, Data Engineering)._

- **Custom field (Story Points)**  
  _Numeric value representing the story points assigned to the ticket._

- **Status**  
  _The status of the ticket. Only tickets with a status of `"Done"` are processed._

- **Sprint**  
  _There can be one or more columns with the header `"Sprint"`. The code scans these columns and uses the last non-empty sprint value to determine the sprint in which the ticket was completed._

---

## How the Code Works

### 1. Initial Setup and Imports

- **React & State Management**:  
  The code uses React’s `useState` hook to manage component state such as the CSV data, error messages, loading state, and which engineering areas are selected for filtering.

- **CSV Parsing with Papa Parse**:  
  The `papaparse` library is used to parse the uploaded CSV file.

- **Charting with Recharts**:  
  Components from the `recharts` library are imported to build a responsive bar chart that visualizes the velocity data.

- **Icons and Colors**:  
  A set of SVG icons and a color scheme are defined for different engineering areas. These are used to visually represent each area in the dashboard.

### 2. CSV Validation and Data Processing

- **Column Validation**:  
  The `validateColumns` function checks the CSV header row for the required columns:

  - `"Issue key"`, `"Custom field (Engineering Area)"`, `"Custom field (Story Points)"`, and `"Status"`.

  If any of these columns are missing, it throws an error. It also scans the headers to collect the indexes of all columns labeled `"Sprint"`.

- **Processing Rows**:  
  The `processData` function handles the main data processing:
  - **Iteration**: It skips malformed rows or rows that do not have the `"Done"` status.
  - **Sprint Extraction**: For each valid row, it searches the sprint columns (from last to first) to determine the sprint in which the ticket was completed.
  - **Data Aggregation**:  
    It aggregates the story points by sprint and further categorizes them by engineering area. Simultaneously, it builds a set of unique engineering areas encountered in the data.
  - **Chart Data Preparation**:  
    The aggregated data is transformed into an array of objects (`chartData`), each representing a sprint. The data is sorted by sprint number.
  - **Averages Calculation**:  
    It computes the average velocity (total story points per sprint) and the average story points per engineering area.

### 3. File Upload and Error Handling

- **File Upload**:  
  The `handleFileUpload` function is triggered when a user selects a CSV file. It uses Papa Parse to read the file:
  - **On Success**: The CSV data is processed with `processData` and stored in the state.
  - **On Error**: Any parsing error is captured and displayed to the user.

### 4. Interactive Filtering and Chart Rendering

- **Filtering by Engineering Area**:  
  The `toggleArea` function allows users to select or deselect specific engineering areas. If "overall" is selected, it shows all data; otherwise, the chart displays only the selected areas.

- **Filtered Data for the Chart**:  
  The `getFilteredChartData` function applies the current filter settings to prepare the data for chart rendering.

- **User Interface Components**:  
  The rendered UI includes:
  - **Upload Interface**: A file upload button prompting the user to select a CSV file.
  - **Loading Indicator**: A spinner displayed while the CSV is being processed.
  - **Error Display**: An error message if CSV parsing fails.
  - **Dashboard Cards**: Cards showing the overall average velocity and average points per engineering area.
  - **Responsive Bar Chart**: A bar chart (using Recharts) that visualizes the sprint velocity trend. It uses axes, tooltips, legends, and interactive filtering to enhance the data presentation.

---

## Summary

- **Purpose**:  
  The component visualizes sprint velocity by reading a CSV file exported from Jira, processing the ticket data, and displaying it through an interactive bar chart.

- **CSV Requirements**:  
  The CSV must include columns for Issue key, Engineering Area, Story Points, Status, and one or more Sprint columns. The processing focuses on tickets marked as "Done" and calculates metrics based on the sprint in which the ticket was completed.

- **User Experience**:  
  Users upload their CSV file, view calculated averages, and interact with the dashboard to filter data by specific engineering areas. The responsive chart updates accordingly to display the trend of completed story points over multiple sprints.

This explanation should help an agent understand the core functionality of the codebase and the expected CSV file structure.
