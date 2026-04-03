# Findings & Decisions

## Requirements
- **Core Entities**: Task (title, priority, deadline, status, owner)
- **State model**: Binary (PENDING, DONE)
- **Priority model**: HIGH, MEDIUM, LOW
- **Derived Views**: 
  - Today Focus (deadline = today, sorted by priority)
  - All Tasks (sorted by priority)
  - Completed Tasks (status = DONE)
- **UI Hierarchy**: Header -> Progress -> Today Focus -> Task List -> Task creation interface
- **Constraints**: No drag-and-drop, no nested tasks, no notifications, no real-time collaboration.

## Research Findings
- The application focuses on clarity and decision-support, acting as a prioritization layer.
- Sorting logic absolutely needs to follow priority strictly.
- Progress calculation relies on completed vs total tasks.
- The UI is functional and encodes the system logic visually (e.g. separation of concerns, no dense lists).

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Tech stack selection | React for dynamic views, Tailwind for precise styling, Node/Express + MySQL for structured relational tracking. |
| Time resolution | "Today" needs to be dynamically evaluated to filter task lists properly. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- Tailwind documentation
- Node.js/Express guidelines
- React state management techniques for derived views

## Visual/Browser Findings
-
