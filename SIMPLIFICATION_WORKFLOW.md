# TracePlay Simplification Workflow

## Overview
Simplifying the TracePlay frontend to focus on core image conversion features, removing production-ready features that add complexity during initial development.

## Milestones

### Milestone 1: Debug Core Functionality
**Status:** In Progress
**Goals:**
- Debug Generate button (Coloring Page and Connect Dots)
- Debug Save button
- Debug Print button
- Debug Load Sample Image button
- Ensure all buttons work correctly with the current implementation

**Acceptance Criteria:**
- Generate button processes image and shows result on canvas
- Save button downloads the processed image
- Print button opens print dialog with processed image
- Load Sample Image loads the turtle image correctly
- All button clicks trigger expected behavior

### Milestone 2: Remove Production Features
**Status:** Pending
**Goals:**
- Remove Interactive Tracing feature from frontend
- Remove Adaptive Quizzes feature from frontend
- Remove Classroom Mode feature from frontend
- Remove Curriculum View feature from frontend
- Remove related UI components and handlers
- Clean up unused imports and code

**Acceptance Criteria:**
- No references to removed features in page.tsx
- No unused imports
- Feature flags for removed features are commented out or removed
- UI only shows core conversion features

### Milestone 3: Simplify UI
**Status:** Pending
**Goals:**
- Update UI to only show these buttons:
  - Load Sample Image
  - Upload Image
  - Convert to Coloring Page
  - Convert to Connect Dots
  - Generate
  - Print
  - Save
- Remove all other buttons and cards
- Clean up layout

**Acceptance Criteria:**
- Only 7 buttons visible in the UI
- Clean, simple layout
- No extra cards or sections

### Milestone 4: Update Wording
**Status:** Pending
**Goals:**
- Remove "lesson" references from all text
- Remove "sample lesson" -> "sample image"
- Make button text simple and clear
- Update alt text and descriptions

**Acceptance Criteria:**
- No "lesson" references in the UI
- Button text is simple and clear
- Alt text is updated

### Milestone 5: Document Decisions
**Status:** Pending
**Goals:**
- Create documentation explaining feature removal
- Explain reasoning (too much complexity for initial development)
- Document what the production UI should look like
- Add TODO in README for future production features

**Acceptance Criteria:**
- DECISIONS.md created with reasoning
- README updated with production UI TODO
- Clear documentation of what was removed and why

### Milestone 6: Local Testing
**Status:** Pending
**Goals:**
- Run development server locally
- Test all button functionality
- Verify image processing works
- Test with uploaded images
- Test with sample image

**Acceptance Criteria:**
- All buttons work locally
- No console errors
- Image processing completes successfully
- Save and Print work correctly

## Decision Log

### Feature Removal Decision
**Date:** 2026-04-27
**Reason:** Production-ready features (Interactive Tracing, Adaptive Quizzes, Classroom Mode, Curriculum) add too much complexity during initial development of core image conversion features. These features require backend services that are not yet implemented, making them non-functional in the current demo mode.

**Removed Features:**
- Interactive Tracing (requires Phaser-based game server)
- Adaptive Quizzes (requires AI backend service)
- Classroom Mode (requires WebSocket server)
- Curriculum View (requires backend API)

**Future Plan:**
These features will be re-introduced once the core image conversion functionality is stable and the backend services are implemented. The README will document the intended production UI.

## Progress Tracking
- Milestone 1: In Progress
- Milestone 2: Pending
- Milestone 3: Pending
- Milestone 4: Pending
- Milestone 5: Pending
- Milestone 6: Pending
