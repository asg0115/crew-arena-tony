(() => {
  'use strict';

  const STORAGE_KEY = 'todo-app-tasks';

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const emptyMessage = document.getElementById('empty-message');
  const counter = document.getElementById('counter');

  /** @type {{id: string, text: string, completed: boolean}[]} */
  let tasks = loadTasks();

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string')
        : [];
    } catch (err) {
      console.error('No se pudieron leer las tareas guardadas:', err);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('No se pudieron guardar las tareas:', err);
    }
  }

  function createId() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function render() {
    list.replaceChildren();

    for (const task of tasks) {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', 'Marcar como completada: ' + task.text);
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.textContent = 'Eliminar';
      delBtn.setAttribute('aria-label', 'Eliminar tarea: ' + task.text);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      li.append(checkbox, span, delBtn);
      list.appendChild(li);
    }

    emptyMessage.hidden = tasks.length > 0;

    const done = tasks.filter(t => t.completed).length;
    counter.textContent = tasks.length
      ? `${done} de ${tasks.length} completadas`
      : '';
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.push({ id: createId(), text: trimmed, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  render();
})();
