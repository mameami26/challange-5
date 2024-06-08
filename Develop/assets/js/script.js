// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const now = dayjs();
  const deadline = dayjs(task.deadline);
  const isNearDeadline = deadline.diff(now, 'day') <= 2;
  const isOverdue = deadline.isBefore(now, 'day');
  
  let cardColorClass = '';
  if (isOverdue) {
    cardColorClass = 'bg-danger';
  } else if (isNearDeadline) {
    cardColorClass = 'bg-warning';
  }

  const card = `<div class="card task-card mb-3 ${cardColorClass}" id="task-${task.id}" data-id="${task.id}">
                  <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text">Deadline: ${task.deadline}</p>
                    <button class="btn btn-danger btn-sm delete-task"><i class="fas fa-trash"></i></button>
                  </div>
                </div>`;
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const todoCards = document.getElementById("todo-cards");
  const inProgressCards = document.getElementById("in-progress-cards");
  const doneCards = document.getElementById("done-cards");

  todoCards.innerHTML = "";
  inProgressCards.innerHTML = "";
  doneCards.innerHTML = "";

  taskList.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === "todo") {
      todoCards.insertAdjacentHTML("beforeend", card);
    } else if (task.status === "in-progress") {
      inProgressCards.insertAdjacentHTML("beforeend", card);
    } else if (task.status === "done") {
      doneCards.insertAdjacentHTML("beforeend", card);
    }
  });

  // Make cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    cursor: "move"
  });
  
  $(".delete-task").click(handleDeleteTask);
}

// Function to handle adding a new task
function handleAddTaskbutt(event) {
  event.preventDefault();
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const deadline = document.getElementById("deadline");
  const status = "todo"; // New tasks are initially in "todo" status

  const newTask = {
    id: generateTaskId(),
    title: title.value,
    description: description.value,
    deadline: deadline.value,
    status: status
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  renderTaskList();
  title.value = "";
  description.value = "";
  deadline.value = "";
  // $('#exampleModal').hide();
  let modal = bootstrap.Modal.getOrCreateInstance(document.querySelector("#exampleModal"))
  modal.hide();

}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const card = event.target.closest(".task-card");
  const taskId = parseInt(card.dataset.id);

  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

// Function to handle dropping a task into a new progress column
function handleDrop(event, ui) {
  const card = ui.draggable;
  const taskId = parseInt(card.data("id"));
  const newStatus = event.target.closest(".lane").id;

  const taskIndex = taskList.findIndex(task => task.id === taskId);
  taskList[taskIndex].status = newStatus;

  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}


// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Add event listeners
 $("#formModal").on('submit', handleAddTaskbutt);
  $(".delete-task").click(handleDeleteTask);

  $(".lane").droppable({
    drop: handleDrop
  });

  $("#deadline").datepicker({
    dateFormat: 'yy-mm-dd' // Set the date format as desired
  });
});