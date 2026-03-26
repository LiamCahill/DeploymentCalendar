## ADDED Requirements

### Requirement: Client-side photo selection and preview
The post form SHALL allow the user to select up to 5 photos per post. Selected photos SHALL be previewed before submission. Files exceeding 5 MB SHALL be resized client-side before upload.

#### Scenario: User selects photos within limits
- **WHEN** the user selects 1–5 image files each under 5 MB
- **THEN** thumbnails are shown in the form preview area

#### Scenario: User selects more than 5 photos
- **WHEN** the user attempts to select more than 5 photos
- **THEN** the app shows an error and does not accept the excess files

#### Scenario: User selects a photo exceeding 5 MB
- **WHEN** the user selects an image file larger than 5 MB
- **THEN** the app resizes the image client-side to fit within 5 MB before queuing it for upload

---

### Requirement: Photo upload to Supabase Storage
On post submission, all selected photos SHALL be uploaded to a private Supabase Storage bucket. The resulting storage paths SHALL be persisted on the post record.

#### Scenario: Successful photo upload
- **WHEN** the user submits a post with photos
- **THEN** each photo is uploaded to Supabase Storage and its path is stored in the post's photo array

#### Scenario: Upload failure
- **WHEN** a photo upload fails (e.g., network error)
- **THEN** the app shows an error message and does not save the post, leaving the form intact for retry

---

### Requirement: Photo display via signed URLs
Photos in the day modal SHALL be displayed using short-lived signed URLs retrieved from Supabase Storage, ensuring images are served securely without public access.

#### Scenario: Photos render in day modal
- **WHEN** a post with photos is displayed in the day modal
- **THEN** each photo is visible as an image loaded via a Supabase signed URL

#### Scenario: Signed URL expiry
- **WHEN** a signed URL expires during a long session
- **THEN** the app refreshes the signed URL on next render without requiring a page reload

---

### Requirement: Photo deletion on post edit
When a user removes a photo from a post during editing, the photo SHALL be deleted from Supabase Storage and removed from the post's photo list.

#### Scenario: Photo removed during edit is deleted from storage
- **WHEN** the user removes a photo in the edit form and saves
- **THEN** the photo object is deleted from Supabase Storage and the post record no longer references it
