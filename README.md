# Jira Insights Dashboard (Quick Guide)

**Overview**  
This React-based dashboard accepts a Jira CSV export to calculate sprint velocity:

- Determines the final sprint for “Done” tickets.
- Aggregates story points and shows average velocity + breakdown by engineering area.
- Displays time-series charts of sprint velocities.
- Data is never persisted (reset on refresh).

**Steps**

1. **Upload CSV**: Include columns like `Ticket`, `Status`, `Engineering Area`, `Story Points`, and multiple `Sprint X` columns.
2. **Parse & Transform**: Identify the last sprint marked `Done` for each ticket; sum their story points.
3. **Dashboard**:
   - **KPIs**: Average velocity across sprints, plus per-engineering-area averages.
   - **Charts**: Bar/line chart showing velocity per sprint over time.

**Demo Video**  
[![Watch the Demo](https://cdn.loom.com/sessions/thumbnails/4c3445091c43440eb42e2db543afe47c-7f3c15c2f5c06792-full-play.gif)](https://www.loom.com/share/4c3445091c43440eb42e2db543afe47c)
