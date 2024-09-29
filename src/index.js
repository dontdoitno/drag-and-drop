import "./style.css"

document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  let draggedCard = null;

  function loadState() {
    return JSON.parse(localStorage.getItem('boardState')) || {
      todo: [],
      progress: [],
      done: [],
    };
  }

  function saveState(state) {
    localStorage.setItem('boardState', JSON.stringify(state));
  }

  function generateUniqueId() {
    return 'card-' + Math.random().toString(36).substr(2, 9);
  }

  function renderColumn(state, columnId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    state[columnId].forEach((cardData) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.textContent = cardData.text;
      card.id = cardData.id;
      card.draggable = true;

      const deleteBtn = document.createElement('span');
      deleteBtn.textContent = '✕';
      deleteBtn.classList.add('delete');
      deleteBtn.addEventListener('click', () => {
        state[columnId] = state[columnId].filter(card => card.id !== cardData.id);
        saveState(state);
        render();
      });

      card.appendChild(deleteBtn);

      card.addEventListener('dragstart', () => {
        draggedCard = card;
        setTimeout(() => card.style.display = 'none', 0);
      });

      card.addEventListener('dragend', () => {
        draggedCard = null;
        setTimeout(() => card.style.display = 'block', 0);
      });

      container.appendChild(card);
    });
  }

  function render() {
    const state = loadState();
    renderColumn(state, 'todo', 'todo-list');
    renderColumn(state, 'progress', 'progress-list');
    renderColumn(state, 'done', 'done-list');
  }

  board.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  board.addEventListener('drop', (e) => {
    const closestList = e.target.closest('.card-list');
    if (closestList && draggedCard) {
      const fromColumn = draggedCard.parentElement.id.split('-')[0];
      const toColumn = closestList.id.split('-')[0];
      const cardText = draggedCard.textContent.replace('✕', '');

      const state = loadState();
      state[fromColumn] = state[fromColumn].filter(card => card.text !== cardText);
      state[toColumn].push({ id: draggedCard.id, text: cardText });

      saveState(state);
      render();
    }
  });

  document.querySelectorAll('.add-card').forEach(button => {
    button.addEventListener('click', () => {
      const form = document.createElement('div');
      form.classList.add('add-card-form');

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter card text...';
      input.classList.add('add-card-input');

      const addButton = document.createElement('button');
      addButton.textContent = 'Add';
      addButton.classList.add('add-btn');

      form.appendChild(input);
      form.appendChild(addButton);

      button.parentElement.appendChild(form);
      button.style.display = 'none';
      form.style.display = 'block';

      addButton.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
          const listId = button.previousElementSibling.id.split('-')[0];
          const state = loadState();
          const newCard = { id: generateUniqueId(), text };
          state[listId].push(newCard);
          saveState(state);
          render();
        }
        form.remove();
        button.style.display = 'block';
      });
    });
  });

  render();
});
