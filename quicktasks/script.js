document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const errorMsg = document.getElementById('errorMsg');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterTabs = document.getElementById('filterTabs');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    let tasks = JSON.parse(localStorage.getItem('quicktasks')) || [];
    let currentFilter = 'all';
    let editingId = null;

    renderTasks();

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;

        if (!text) {
            errorMsg.textContent = 'Task description cannot be empty!';
            errorMsg.style.display = 'block';
            return;
        }
        errorMsg.style.display = 'none';

        if (editingId !== null) {
            tasks = tasks.map(task => {
                if (task.id === editingId) {
                    return { ...task, text, priority, dueDate };
                }
                return task;
            });
            editingId = null;
            document.getElementById('addBtn').textContent = 'Add Task';
        } else {
            const newTask = {
                id: Date.now(),
                text,
                priority,
                dueDate,
                completed: false,
                createdAt: new Date().toLocaleDateString()
            };
            tasks.unshift(newTask);
        }

        saveAndRender();
        taskForm.reset();
        prioritySelect.value = 'Medium';
    });

    filterTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTasks();
        }
    });

    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveAndRender();
    });

    taskList.addEventListener('click', (e) => {
        const card = e.target.closest('.task-card');
        if (!card) return;
        const id = Number(card.getAttribute('data-id'));

        if (e.target.classList.contains('task-checkbox')) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: e.target.checked };
                }
                return task;
            });
            saveAndRender();
        }

        if (e.target.classList.contains('edit-btn')) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                taskInput.value = task.text;
                prioritySelect.value = task.priority;
                dueDateInput.value = task.dueDate || '';
                editingId = id;
                document.getElementById('addBtn').textContent = 'Update Task';
                taskInput.focus();
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
        }
    });

    function saveAndRender() {
        localStorage.setItem('quicktasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card priority-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}`;
            card.setAttribute('data-id', task.id);

            card.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-details">
                        <span class="task-title">${escapeHtml(task.text)}</span>
                        <div class="task-meta">
                            <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                            ${task.dueDate ? `<span>Due: ${escapeHtml(task.dueDate)}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit Task">Edit</button>
                    <button class="action-btn delete-btn" title="Delete Task">Delete</button>
                </div>
            `;
            taskList.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
