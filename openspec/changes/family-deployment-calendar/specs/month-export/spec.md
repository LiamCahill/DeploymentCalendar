## ADDED Requirements

### Requirement: Trigger month export from calendar
Each month column in the calendar grid SHALL include an export control (e.g., a download icon). Activating it SHALL initiate a PDF export of all posts for that month.

#### Scenario: User triggers export for a month with posts
- **WHEN** the user clicks the export control on a month column that has posts
- **THEN** the app begins generating a PDF for that month

#### Scenario: User triggers export for a month with no posts
- **WHEN** the user clicks the export control on a month column with no posts
- **THEN** the app displays a message indicating there is nothing to export and does not generate a PDF

---

### Requirement: PDF content and structure
The generated PDF SHALL contain all posts for the selected month, grouped by day in chronological order. Each post SHALL include the author's display name, the post date, the text content, and any attached photos inline.

#### Scenario: PDF includes all posts for the month
- **WHEN** the PDF is generated for a given month
- **THEN** every post recorded for that month appears in the PDF, ordered by date then creation time

#### Scenario: PDF includes inline photos
- **WHEN** a post has one or more photos
- **THEN** each photo appears inline within the post's section in the PDF

#### Scenario: PDF shows author attribution
- **WHEN** a post is rendered in the PDF
- **THEN** the author's display name is shown alongside the post content

---

### Requirement: PDF download
The generated PDF SHALL be downloaded to the user's device as a file named `<Year>-<Month>.pdf` (e.g., `2026-03.pdf`).

#### Scenario: PDF file is downloaded on completion
- **WHEN** PDF generation completes successfully
- **THEN** the browser initiates a file download with the correct filename

#### Scenario: PDF generation in progress shows feedback
- **WHEN** the PDF is being generated (photos being fetched and rendered)
- **THEN** the export control shows a loading indicator until the download begins

---

### Requirement: Photos fetched as embedded data for PDF
Photos SHALL be fetched via signed URLs and converted to base64 data URLs before being embedded in the PDF, so the exported file is fully self-contained.

#### Scenario: Exported PDF is self-contained
- **WHEN** the user opens the downloaded PDF without an internet connection
- **THEN** all photos are visible within the PDF (no broken image links)
