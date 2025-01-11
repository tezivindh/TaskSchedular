class TaskScheduler {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.setupEventListeners();
    this.renderTasks();
    this.startTaskChecker();
  }

  setupEventListeners() {
    document.getElementById("task-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTask();
    });

    document
      .getElementById("filter-category")
      .addEventListener("change", () => this.renderTasks());
    document
      .getElementById("filter-status")
      .addEventListener("change", () => this.renderTasks());
  }

  addTask() {
    const title = document.getElementById('task-title').value.trim();

    if (!title) {
        this.showNotification('Task title is required!');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description: document.getElementById('task-description').value.trim(),
        deadline: document.getElementById('task-deadline').value.trim(),
        priority: document.getElementById('task-priority').value,
        category: document.getElementById('task-category').value,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks(); // Ensure this is called after adding the task
    document.getElementById('task-form').reset();
    this.showNotification('Task added successfully!');
}



  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveTasks();
    this.renderTasks();
    this.showNotification("Task deleted!");
  }

  toggleTaskStatus(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.status = task.status === "completed" ? "pending" : "completed";
      this.saveTasks();
      this.renderTasks();
      this.showNotification(`Task marked as ${task.status}!`);
    }
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  renderTasks() {
    const tasksList = document.getElementById("tasks-list");
    const categoryFilter = document.getElementById("filter-category").value;
    const statusFilter = document.getElementById("filter-status").value;

    let filteredTasks = this.tasks;

    if (categoryFilter !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === statusFilter
      );
    }

    tasksList.innerHTML = filteredTasks
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .map((task) => this.createTaskElement(task))
      .join("");
  }

  createTaskElement(task) {
    const isOverdue =
      new Date(task.deadline) < new Date() && task.status !== "completed";
    const statusClass =
      task.status === "completed" ? "completed" : isOverdue ? "overdue" : "";

    return `
            <div class="task ${statusClass}" data-id="${task.id}">
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-priority priority-${task.priority}">${
      task.priority
    }</span>
                </div>
                <div class="task-category">${task.category}</div>
                <div class="task-deadline">Deadline: ${new Date(
                  task.deadline
                ).toLocaleString()}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-actions">
                    <button onclick="taskScheduler.toggleTaskStatus(${
                      task.id
                    })">
                        ${
                          task.status === "completed"
                            ? "Mark Pending"
                            : "Mark Complete"
                        }
                    </button>
                    <button onclick="taskScheduler.deleteTask(${
                      task.id
                    })">Delete</button>
                </div>
            </div>
        `;
  }

  startTaskChecker() {
    setInterval(() => {
      const now = new Date();
      this.tasks.forEach((task) => {
        if (task.status !== "completed") {
          const deadline = new Date(task.deadline);
          const timeDiff = deadline - now;

          // Notify 1 hour before deadline
          if (timeDiff > 0 && timeDiff <= 3600000 && !task.notified) {
            this.showNotification(
              `Task "${task.title}" is due in less than an hour!`
            );
            task.notified = true;
            this.saveTasks();
          }
        }
      });
      this.renderTasks();
    }, 60000); // Check every minute
  }

  showNotification(message) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(message);
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }

    // Fallback alert
    alert(message);
  }
}

// Initialize the task scheduler
const taskScheduler = new TaskScheduler();

// Request notification permission
if ("Notification" in window) {
  Notification.requestPermission();
}
