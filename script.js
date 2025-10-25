// TaskFlow — Vanilla JS
const STORAGE_KEY = 'taskflow.tasks'

// State
let tasks = []
let filter = 'all' // all | active | completed
let dragSrcId = null
let saveTimeout = null
const SAVE_DEBOUNCE_MS = 300

// Selectors
const form = document.getElementById('task-form')
const input = document.getElementById('task-input')
const tasksList = document.getElementById('tasks')
const counterEl = document.getElementById('task-counter')
const filterButtons = document.querySelectorAll('.filter-btn')
const clearCompletedBtn = document.getElementById('clear-completed')

// Utilities
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6)

function saveTasks(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }catch(e){
    console.error('Could not save tasks', e)
  }
}

// Debounced save to reduce frequent localStorage writes; call scheduleSave() after edits.
function scheduleSave(){
  if(saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(()=>{
    saveTasks()
    saveTimeout = null
  }, SAVE_DEBOUNCE_MS)
}

function flushSave(){
  if(saveTimeout){
    clearTimeout(saveTimeout)
    saveTasks()
    saveTimeout = null
  }
}

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    tasks = raw ? JSON.parse(raw) : []
  }catch(e){
    console.error('Could not load tasks', e)
    tasks = []
  }
}

function addTask(text){
  if(!text || !text.trim()) return
  const newTask = { id: uid(), text: text.trim(), completed: false }
  tasks.unshift(newTask) // newest first
  scheduleSave()
  render()
}

function toggleComplete(id){
  const t = tasks.find(x=>x.id===id)
  if(!t) return
  t.completed = !t.completed
  scheduleSave()
  render()
}

function deleteTask(id){
  tasks = tasks.filter(x=>x.id!==id)
  scheduleSave()
  render()
}

function clearCompleted(){
  tasks = tasks.filter(t=>!t.completed)
  scheduleSave()
  render()
}

function updateCounter(){
  const remaining = tasks.filter(t=>!t.completed).length
  counterEl.textContent = `You have ${remaining} task${remaining===1?'':'s'} left.`
}

function setFilter(f){
  filter = f
  filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter===f))
  render()
}

function createTaskElement(task){
  const li = document.createElement('li')
  li.className = 'task'
  li.dataset.id = task.id
  li.draggable = true
  if(task.completed) li.classList.add('completed')

  // checkbox
  const checkbox = document.createElement('label')
  checkbox.className = 'checkbox'
  const inputCb = document.createElement('input')
  inputCb.type = 'checkbox'
  inputCb.checked = !!task.completed
  inputCb.setAttribute('aria-label', 'Mark task complete')
  checkbox.appendChild(inputCb)

  // label (text)
  const span = document.createElement('span')
  span.className = 'task-label'
  span.textContent = task.text
  span.title = 'Double-click to edit'

  // delete button
  const del = document.createElement('button')
  del.className = 'icon-btn delete'
  del.innerHTML = '✕'
  del.title = 'Delete task'

  li.appendChild(checkbox)
  li.appendChild(span)
  li.appendChild(del)

  // Events: checkbox change
  inputCb.addEventListener('change', (e)=>{
    toggleComplete(task.id)
  })

  // Delete
  del.addEventListener('click', ()=>{
    // animate out, then delete
    li.classList.add('removing')
    li.addEventListener('animationend', ()=> deleteTask(task.id), { once: true })
  })

  // Edit in place on dblclick
  span.addEventListener('dblclick', ()=> enableEdit(span, task))

  // Drag & Drop
  li.addEventListener('dragstart', (e)=>{
    dragSrcId = task.id
    li.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
  })
  li.addEventListener('dragend', ()=>{
    dragSrcId = null
    li.classList.remove('dragging')
  })

  li.addEventListener('dragover', (e)=>{
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  })

  li.addEventListener('drop', (e)=>{
    e.preventDefault()
    const targetId = li.dataset.id
    if(!dragSrcId || dragSrcId === targetId) return
    reorderTasks(dragSrcId, targetId)
    scheduleSave()
    render()
  })

  // Keyboard accessibility: make each task focusable and allow Alt+ArrowUp/Down to reorder
  li.tabIndex = 0
  li.addEventListener('keydown', (e)=>{
    // Alt+ArrowUp moves the task up one
    if(e.altKey && e.key === 'ArrowUp'){
      e.preventDefault()
      const idx = tasks.findIndex(t=>t.id===task.id)
      if(idx > 0){
        reorderTasks(task.id, tasks[idx-1].id)
        scheduleSave()
        render()
        // keep focus on this task after render
        const el = document.querySelector(`li[data-id="${task.id}"]`)
        if(el) el.focus()
      }
    }
    // Alt+ArrowDown moves the task down one
    if(e.altKey && e.key === 'ArrowDown'){
      e.preventDefault()
      const idx = tasks.findIndex(t=>t.id===task.id)
      if(idx >= 0 && idx < tasks.length - 1){
        reorderTasks(task.id, tasks[idx+1].id)
        scheduleSave()
        render()
        const el = document.querySelector(`li[data-id="${task.id}"]`)
        if(el) el.focus()
      }
    }
    // Delete key to remove
    if(e.key === 'Delete'){
      deleteTask(task.id)
    }
  })

  // Add animation class for pop-in
  requestAnimationFrame(()=>{
    li.classList.add('added')
    li.addEventListener('animationend', ()=> li.classList.remove('added'), { once: true })
  })

  return li
}

function enableEdit(span, task){
  const inputEdit = document.createElement('input')
  inputEdit.type = 'text'
  inputEdit.value = task.text
  inputEdit.className = 'edit-input'
  inputEdit.style.width = '100%'
  inputEdit.style.fontSize = '15px'
  inputEdit.style.padding = '6px'

  span.replaceWith(inputEdit)
  inputEdit.focus()
  // place caret at end
  inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length)

  function commit(){
    const v = inputEdit.value.trim()
    if(v){
      task.text = v
      saveTasks()
    } else {
      // if cleared, delete
      tasks = tasks.filter(x=>x.id!==task.id)
      saveTasks()
    }
    render()
  }

  inputEdit.addEventListener('blur', commit)
  inputEdit.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') inputEdit.blur()
    if(e.key === 'Escape') render()
  })
}

function reorderTasks(fromId, toId){
  const fromIndex = tasks.findIndex(t=>t.id===fromId)
  const toIndex = tasks.findIndex(t=>t.id===toId)
  if(fromIndex < 0 || toIndex < 0) return
  const [moved] = tasks.splice(fromIndex,1)
  tasks.splice(toIndex,0,moved)
}

function render(){
  // clear
  tasksList.innerHTML = ''

  const visible = tasks.filter(t => {
    if(filter === 'all') return true
    if(filter === 'active') return !t.completed
    if(filter === 'completed') return t.completed
  })

  visible.forEach(t => {
    const el = createTaskElement(t)
    tasksList.appendChild(el)
  })

  updateCounter()
  // pulse counter to draw attention to changes
  counterEl.classList.add('pulse')
  setTimeout(()=> counterEl.classList.remove('pulse'), 420)
}

// INIT
function init(){
  loadTasks()
  render()

  // Form submit
  form.addEventListener('submit', (e)=>{
    e.preventDefault()
    addTask(input.value)
    input.value = ''
    input.focus()
  })

  // Filters
  filterButtons.forEach(btn => {
    btn.addEventListener('click', ()=> setFilter(btn.dataset.filter))
  })

  clearCompletedBtn.addEventListener('click', ()=>{
    const completedCount = tasks.filter(t=>t.completed).length
    if(completedCount === 0) return
    // animate completed items, then clear
    const completedEls = Array.from(document.querySelectorAll('li.task.completed'))
    if(completedEls.length){
      completedEls.forEach(el => el.classList.add('removing'))
      // wait for animation then clear
      setTimeout(()=> clearCompleted(), 220)
    } else {
      clearCompleted()
    }
  })

  // Ensure any pending saves are flushed when the page is closed or reloaded
  window.addEventListener('beforeunload', ()=>{
    flushSave()
  })

  // Keyboard accessibility: delete with Del when a task is focused
  tasksList.addEventListener('keydown', (e)=>{
    const li = e.target.closest('li')
    if(!li) return
    const id = li.dataset.id
    if(e.key === 'Delete') deleteTask(id)
  })
}

init()
