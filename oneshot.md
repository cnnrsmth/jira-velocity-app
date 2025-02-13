TITLE: Jira Insights Dashboard – Product Requirements Document (PRD)

1.  OVERVIEW
    The Jira Insights Dashboard is a web-based tool for visualizing Jira sprint velocity data from a user-uploaded CSV file. It presents aggregated metrics and time-series charts to reveal trends in story point completion across multiple sprints. No data is permanently stored; all information is processed and visualized purely in the browser and discarded upon refresh.

2.  PROBLEM STATEMENT
    Teams often export Jira issues data (e.g., tickets, statuses, sprints, etc.) into a CSV, but lack a quick, clean way to see how many story points were completed per sprint, broken down by engineering area. This dashboard solves that gap by:

    - Parsing the CSV
    - Determining the final sprint in which tickets transitioned to ‘Done’
    - Computing and displaying velocity metrics in a Revolut-trading-inspired UI

3.  USERS & USE CASES

    - Scrum Masters / Product Owners: Need to assess sprint performance (velocity, breakdown by area).
    - Engineering Leads: Want insight into which areas (Frontend, Backend, DevOps) contribute how many story points each sprint.
    - Developers: Quick check on average velocity trends.

4.  PRODUCT SCOPE

    - Single-page React application.
    - CSV Upload functionality (no authentication required).
    - Client-side data processing (no backend).
    - Dashboard with:
      1. Average velocity across sprints
      2. Average velocity by engineering area
      3. Time-series chart displaying velocity over consecutive sprints

5.  KEY REQUIREMENTS
    5.1 Functional Requirements 1) File Upload: - Allow user to upload a CSV file containing Jira issue data. - Support columns: “Ticket”, “Summary”, “Status”, “Engineering Area”, “Story Points”, and multiple “Sprint” columns (e.g., Sprint 1, Sprint 2, …). - Validate file format; show errors if critical columns are missing.

        2) Data Parsing & Transformation:
           - Identify sprint columns dynamically (they could be named Sprint 1, Sprint 2, up to Sprint N).
           - For tickets with Status=“Done”, determine the last sprint column that contains “Done” (or similar) to mark the final sprint in which it was completed.
           - Aggregate the story points in that sprint under the ticket’s engineering area.

        3) Computations:
           - Calculate velocity per sprint: sum of story points from tickets that completed in that sprint.
           - Calculate average velocity across all sprints with completions.
           - Calculate average velocity by engineering area (sum of story points for each area, divided by the number of sprints that had completions).

        4) Dashboard Visualization:
           - Show counters/KPIs:
             a) Average velocity across sprints.
             b) Average velocity by each engineering area.
           - Provide a time-series chart (line or bar) plotting velocity over sprints:
             a) X-axis: Sprint labels (Sprint 1, Sprint 2, Sprint 3, etc.).
             b) Y-axis: Total story points completed in each sprint.
             c) Optionally show a breakdown by engineering area via stacked or multiline chart.

        5) Ephemeral Data Handling:
           - All computations done client-side in memory.
           - No data is stored or persisted. When the page is refreshed, data is lost.

    5.2 Non-Functional Requirements 1) Performance: - Must parse CSVs quickly in-browser (up to a few thousand rows). - Smooth chart rendering and minimal lag.

        2) UI/UX:
           - Mimic Revolut’s minimalistic trading UI aesthetic (clean typography, subtle animations, dark or light mode).
           - Responsive design for desktop screens; mobile is optional but a plus.

        3) Reliability:
           - Graceful error messages for malformed CSVs or missing columns.
           - Resilient to large CSV files (e.g., 5k–10k lines).

6.  TECHNICAL SPECIFICATIONS
    6.1 Technology Stack - React (JavaScript) front end - Libraries:
    • Papa Parse for CSV parsing
    • Recharts (or Chart.js/Victory) for data visualization - No backend; ephemeral memory usage only

    6.2 Architecture 1) UI Layer: - React components for layout, file upload, charts, KPIs 2) Data Flow: - User uploads CSV → Papa Parse reads data → Transform and store in React state → Chart and KPI components render from state 3) No Persistence: - Data resides only in component state - Cleared on page refresh

7.  USER FLOWS
    7.1 Upload Flow 1) Landing page with “Upload CSV” button. 2) User selects a CSV file. 3) Display a loading indicator while parsing with Papa Parse. 4) If valid CSV with required columns → Move to dashboard; else show error message.

    7.2 Dashboard Flow 1) Show KPI row: “Average Velocity” + “Average Velocity per Engineering Area”. 2) Show a time-series chart (bar or line) of velocity per sprint. 3) Optionally allow user to toggle between stacked or multiline representation of areas.

8.  SAMPLE CSV DETAILS
    Example CSV excerpt:
    Ticket,Summary,Status,Engineering Area,Story Points,Sprint 1,Sprint 2,Sprint 3
    ABC-123,"Login Feature",Done,Frontend,5,Done,Done,
    ABC-124,"Database Migration",Done,Backend,8,In Dev,Done,Done
    ABC-125,"Setup CI/CD",Done,DevOps,3,,In Dev,Done
    ABC-126,"User Profile Page","To Do",Frontend,3,,,,
    ABC-127,"Notifications",Done,Backend,5,In Dev,In Dev,Done

    - Sprints might contain Done, In Dev, blank, etc.
    - The last sprint with Done for each row is the final sprint of completion.

9.  EDGE CASES & ERROR HANDLING

    - Missing columns: “Ticket”, “Status”, “Engineering Area”, “Story Points” → Show error.
    - Tickets marked Done in Jira but no sprint column has “Done” → Possibly skip or warn.
    - Non-numeric “Story Points” → treat as 0 or display error.
    - CSV with zero Done tickets → velocity calculations are moot, show “No completed tickets found”.

10. ACCEPTANCE CRITERIA

1)  User can upload a valid CSV and see a loading indicator.
2)  Dashboard displays:
    - At least one KPI for overall average velocity.
    - A bar/line chart with x-axis of sprint labels, y-axis of story points completed.
3)  Data is cleared if user refreshes the page.
4)  Error message appears for invalid CSV structure.

11. IMPLEMENTATION STEPS (HIGH-LEVEL)

1)  Initialize React project (create-react-app or Vite).
2)  Install dependencies (papa-parse, recharts).
3)  Build FileUpload component:
    - <input type="file" accept=".csv" />
    - On file change, parse with Papa Parse → set state + loading.
4)  Validate columns + identify sprint columns.
5)  Transform data:
    - For each row with Status=Done, find final sprint containing Done.
    - Accumulate story points under that sprint + that engineering area.
6)  Compute:
    - Velocity per sprint.
    - Average velocity across sprints.
    - Average velocity per engineering area.
7)  Display:
    - KPI cards for average velocities.
    - Recharts-based time-series graph for velocities.
8)  Ensure ephemeral storage only (React state). No local storage, no DB.

13. CONCLUSION
    This PRD outlines the core requirements and design details for the Jira Insights Dashboard. Following these specifications ensures a cohesive solution enabling teams to quickly upload a Jira CSV and gain sprint velocity insights, with a sleek UI inspired by Revolut’s trading platform.
