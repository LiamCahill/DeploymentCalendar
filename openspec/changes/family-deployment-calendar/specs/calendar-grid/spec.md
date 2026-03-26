## ADDED Requirements

### Requirement: Yearly 12-column grid
The app SHALL display a calendar as a 12-column grid where each column represents one month of the selected year. Each column SHALL show the month name as a header and a tile for every calendar day in that month.

#### Scenario: Grid renders all months for the current year
- **WHEN** the app loads for the first time
- **THEN** a 12-column grid is displayed showing January through December of the current year

#### Scenario: Each month column shows correct number of day tiles
- **WHEN** a user views any month column
- **THEN** the column contains exactly the correct number of day tiles for that month and year (accounting for leap years)

---

### Requirement: Year navigation
The app SHALL display the currently selected year and provide previous/next controls to navigate between years. The default year SHALL be the current calendar year.

#### Scenario: User navigates to previous year
- **WHEN** the user clicks the previous year control
- **THEN** the grid updates to show the prior year and the year indicator decrements by one

#### Scenario: User navigates to next year
- **WHEN** the user clicks the next year control
- **THEN** the grid updates to show the following year and the year indicator increments by one

#### Scenario: App loads at current year
- **WHEN** the app first renders after auth
- **THEN** the selected year matches the current calendar year

---

### Requirement: Day tile post indicator
Each day tile SHALL visually indicate whether one or more posts exist for that day (e.g., a dot or count badge), fetched from Supabase.

#### Scenario: Day with posts shows indicator
- **WHEN** one or more posts exist for a given day
- **THEN** that day's tile displays a visual indicator

#### Scenario: Day without posts shows no indicator
- **WHEN** no posts exist for a given day
- **THEN** that day's tile shows no post indicator

---

### Requirement: Responsive layout
On narrow viewports (mobile), the 12-column grid SHALL adapt to remain usable, either via horizontal scroll or a single-column stacked layout.

#### Scenario: Mobile viewport renders usable calendar
- **WHEN** the viewport width is less than 768px
- **THEN** the calendar is navigable without horizontal overflow clipping content off-screen
