# TaskFlow

Find your focus. Manage your day.

TaskFlow is a minimalist single-page task manager that runs entirely in your browser. It uses localStorage so you don't need an account — tasks persist between page reloads.

Features
- Add tasks via the input or press Enter
- Mark tasks complete (checkbox)
- Delete individual tasks
- Filters: All / Active / Completed
- Task counter that updates live
- Clear Completed button to remove all done tasks
- Edit-in-place: double-click a task to edit
 Drag-and-drop reordering
 Keyboard reordering: focus a task (Tab) and use Alt+ArrowUp / Alt+ArrowDown to move it; use Delete to remove it.

How to run
1. Open `index.html` in your browser (double-click or use "Open File" in your browser).
2. Add tasks and start organizing. Everything is saved locally.

Technical notes
- Vanilla JS (no frameworks)
- Data saved in localStorage under the key `taskflow.tasks`
 
 Autosave behavior
 - Saves to localStorage are debounced (300ms) to reduce excessive writes; saves are flushed when the page closes.

Animations & micro-interactions
- New tasks pop in with a smooth animation.
- Deleting tasks uses a shrink-and-fade animation to make removal feel natural.
- Completing a task draws a subtle animated strike-through and color shift.
- The task counter pulses briefly when the list changes.

License
MIT
