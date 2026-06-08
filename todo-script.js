// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.init();
    }

    init() {
        // Load tasks from local storage
        this.loadTasks();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render tasks
        this.render();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear and delete buttons
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('deleteAllBtn').addEventListener('click', () => this.deleteAll());

        // Modal close
        document.getElementById('modalCancel')?.addEventListener('click', () => this.closeModal());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (text === '') {
            alert('Please enter a task');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.tasks.push(task);
        this.saveTasks();
        input.value = '';
        this.render();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingId = id;
            const modal = document.getElementById('editModal');
            const input = document.getElementById('modalInput');
            
            input.value = task.text;
            modal.classList.add('show');
            input.focus();
        }
    }

    saveEdit() {
        const input = document.getElementById('modalInput');
        const text = input.value.trim();

        if (text === '') {
            alert('Task cannot be empty');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingId);
        if (task) {
            task.text = text;
            this.saveTasks();
            this.closeModal();
            this.render();
        }
    }

    closeModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        this.editingId = null;
    }

    clearCompleted() {
        if (confirm('Delete all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
        }
    }

    deleteAll() {
        if (confirm('Delete all tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const remaining = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('remainingTasks').textContent = remaining;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="app.toggleTask(${task.id})"
                    >
                    <div class="task-content">
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <span class="task-date">${task.createdAt}</span>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="app.editTask(${task.id})">Edit</button>
                        <button class="delete-btn" onclick="app.deleteTask(${task.id})">Delete</button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }

        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create edit modal in DOM
function createEditModal() {
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Task</h2>
            <input 
                type="text" 
                id="modalInput" 
                class="modal-input" 
                placeholder="Update your task..."
            >
            <div class="modal-buttons">
                <button class="save-btn" onclick="app.saveEdit()">Save</button>
                <button id="modalCancel" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            app.closeModal();
        }
    });
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    createEditModal();
    app = new TodoApp();
});
