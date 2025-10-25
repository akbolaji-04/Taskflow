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


Technical notes
- Vanilla JS (no frameworks)
- Data saved in localStorage under the key `taskflow.tasks`
 
 Autosave behavior
 - Saves to localStorage are debounced (300ms) to reduce excessive writes; saves are flushed when the page closes.



License
MIT

