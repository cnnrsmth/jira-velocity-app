# Jira Insights Dashboard

A web-based tool for visualizing Jira sprint velocity data from CSV files. This dashboard presents aggregated metrics and time-series charts to reveal trends in story point completion across multiple sprints.

## Features

- CSV file upload and parsing
- Average velocity metrics
- Breakdown by engineering area (Frontend, Backend, DevOps)
- Time-series visualization of sprint velocity
- Clean, modern UI inspired by Revolut's trading platform
- Client-side only (no data persistence)

## Required CSV Format

The CSV file should contain the following columns:

- Ticket
- Summary
- Status
- Engineering Area
- Story Points
- Sprint columns (Sprint 1, Sprint 2, etc.)

Example:

```csv
Ticket,Summary,Status,Engineering Area,Story Points,Sprint 1,Sprint 2,Sprint 3
ABC-123,"Login Feature",Done,Frontend,5,Done,Done,
ABC-124,"Database Migration",Done,Backend,8,In Dev,Done,Done
ABC-125,"Setup CI/CD",Done,DevOps,3,,In Dev,Done
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development server (usually http://localhost:5173)

## Usage

1. Click the "Upload CSV" button
2. Select your Jira CSV export file
3. View the generated insights:
   - Average velocity across all sprints
   - Average velocity by engineering area
   - Sprint-by-sprint velocity breakdown chart

## Technology Stack

- React
- Vite
- Tailwind CSS
- Papa Parse (CSV parsing)
- Recharts (data visualization)

## Notes

- All data processing is done client-side
- No data is stored or persisted
- Data is cleared on page refresh
