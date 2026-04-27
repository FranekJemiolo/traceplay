# TracePlay Feature Removal Decisions

## Date
2026-04-27

## Overview
This document outlines the decision to temporarily remove production-ready features from the TracePlay frontend to focus on core image conversion functionality during initial development.

## Removed Features

### 1. Interactive Tracing
**Description:** Phaser-based tracing game with real-time shape recognition and progress tracking.

**Reason for Removal:**
- Requires backend game server implementation
- Adds significant complexity to the frontend
- Core image conversion features need to be stable first
- Non-functional in current demo mode without backend

**Future Plan:**
Re-introduce once core image conversion is stable and backend game server is implemented.

### 2. Adaptive Quizzes
**Description:** AI-generated quizzes with adaptive difficulty and performance analytics.

**Reason for Removal:**
- Requires backend AI service
- Adds complexity unrelated to core image processing
- Feature flags and UI components clutter the interface
- Non-functional without AI backend

**Future Plan:**
Re-introduce after AI backend service is implemented and core features are production-ready.

### 3. Classroom Mode
**Description:** Live instructor sessions with real-time collaboration via WebSocket.

**Reason for Removal:**
- Requires WebSocket server implementation
- Adds real-time complexity to the application
- Not relevant to standalone image conversion use case
- Non-functional without backend infrastructure

**Future Plan:**
Re-introduce when collaborative features are prioritized and WebSocket infrastructure is ready.

### 4. Curriculum View
**Description:** Curriculum management and lesson organization interface.

**Reason for Removal:**
- Requires backend API for curriculum data
- Adds unnecessary complexity for simple image conversion
- Lesson-related terminology doesn't fit the simplified use case
- Non-functional without backend

**Future Plan:**
Re-introduce when lesson management and curriculum features are needed.

## Current Focus

The simplified application now focuses on:
- Loading sample images
- Uploading custom images
- Converting images to coloring pages
- Converting images to connect-the-dots activities
- Saving and printing processed images

## Rationale

The removed features, while valuable for a full production learning platform, were adding unnecessary complexity during the initial development phase. By focusing on the core image conversion functionality first, we can:

1. **Stabilize Core Features:** Ensure the OpenCV.js image processing works reliably
2. **Simplify Development:** Reduce cognitive load and debugging complexity
3. **Faster Iteration:** Ship a working MVP faster
4. **Clear User Value:** Provide immediate value with simple, functional features
5. **Better Testing:** Easier to test and validate core functionality

## Production Mode Vision

### TODO: Future Production UI

When the application reaches full production mode, the UI should include:

**Main Dashboard:**
- Interactive Tracing card (65% progress indicator)
- Adaptive Quizzes card (40% progress indicator)
- Image Converter section (current simplified UI)
- Curriculum View button
- Classroom Mode card

**Image Converter Section:**
- Load Sample Image
- Upload Image
- Convert to Coloring Page
- Convert to Connect Dots
- Generate
- Print
- Save

**Bottom Cards:**
- Getting Started guide
- Advanced Techniques guide
- Classroom Mode access

**Backend Requirements:**
- Game server for Interactive Tracing
- AI service for Adaptive Quizzes
- WebSocket server for Classroom Mode
- API server for Curriculum management

## Migration Path

When re-introducing features:
1. Implement backend services first
2. Add feature flags for gradual rollout
3. Test each feature independently
4. Update UI to include feature cards
5. Integrate with existing image converter
6. Full integration testing

## Conclusion

This simplification decision is temporary and strategic. The removed features will be re-introduced once the core image conversion functionality is stable and the required backend infrastructure is in place.
