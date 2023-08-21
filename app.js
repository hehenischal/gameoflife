const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 10;

windowWidth = window.innerWidth*0.8;
windowHeight = window.innerHeight * 0.8;
const gridHeight = Math.floor(windowHeight / cellSize);
const gridWidth = Math.floor(windowWidth / cellSize);


canvas.width = gridWidth * cellSize;
canvas.height = gridHeight * cellSize;

let cellStates = Array.from({ length: gridHeight }, () =>
  Array.from({ length: gridWidth }, () => false)
);

function countAliveNeighbors(row, col) {
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const newRow = row + i;
      const newCol = col + j;

      if (newRow >= 0 && newRow < gridHeight && newCol >= 0 && newCol < gridWidth) {
        count += cellStates[newRow][newCol] ? 1 : 0;
      }
    }
  }

  return count;
}

function activateGameOfLifeLogic() {
  const newCellStates = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => false)
  );

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const aliveNeighbors = countAliveNeighbors(row, col);

      if (cellStates[row][col]) {
        // Cell is alive
        newCellStates[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3;
      } else {
        // Cell is dead
        newCellStates[row][col] = aliveNeighbors === 3;
      }
    }
  }

  cellStates = newCellStates;
  drawGrid();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x <= canvas.width; x += cellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }

  for (let y = 0; y <= canvas.height; y += cellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }

  ctx.stroke();

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (cellStates[row][col]) {
        ctx.fillStyle = 'black';
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}


function activateCellOnClickAndDrag() {
  let isDrawing = false;
  let cellsToggled = {}; // Keep track of cells already toggled during the current drag
  let lastToggledCell = null;
  const brushSizeInput = document.getElementById('brushSize'); // Get the brush size slider element

  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);

  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleEnd);

  function handleStart(event) {
    event.preventDefault();
    isDrawing = true;
    const touch = event.type.startsWith('touch') ? event.touches[0] : event;
    const col = Math.floor((touch.clientX - canvas.getBoundingClientRect().left - window.scrollX) / cellSize);
    const row = Math.floor((touch.clientY - canvas.getBoundingClientRect().top - window.scrollY) / cellSize);
    toggleCellState(row, col);
    lastToggledCell = { row, col };
    cellsToggled = { [`${row}-${col}`]: true };
  }

  function handleMove(event) {
    if (isDrawing) {
      event.preventDefault();
      const touch = event.type.startsWith('touch') ? event.touches[0] : event;
      const col = Math.floor((touch.clientX - canvas.getBoundingClientRect().left - window.scrollX) / cellSize);
      const row = Math.floor((touch.clientY - canvas.getBoundingClientRect().top - window.scrollY) / cellSize);

      const brushSize = parseInt(brushSizeInput.value, 10) || 1;

      // Apply brush size to toggle cell state only if the cell has changed
      if (!lastToggledCell || (lastToggledCell.row !== row || lastToggledCell.col !== col)) {
        lastToggledCell = { row, col };
        for (let i = -Math.floor(brushSize / 2); i <= Math.floor(brushSize / 2); i++) {
          for (let j = -Math.floor(brushSize / 2); j <= Math.floor(brushSize / 2); j++) {
            const newRow = row + i;
            const newCol = col + j;

            if (!cellsToggled[`${newRow}-${newCol}`]) {
              toggleCellState(newRow, newCol);
              cellsToggled[`${newRow}-${newCol}`] = true;
            }
          }
        }
      }
    }
  }

  function handleEnd() {
    isDrawing = false;
    cellsToggled = {};
    lastToggledCell = null;
  }

  // ... Other functions ...

  drawGrid();
}

activateCellOnClickAndDrag();

let intervalId = null;

function toggleActivation() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    drawGrid(); // Redraw the grid when deactivating
  } else {
    intervalId = setInterval(() => {
      activateGameOfLifeLogic();
      drawGrid(); // Redraw the grid after each logic iteration
    }, 100); // Adjust interval time as needed
  }
}

const activateButton = document.getElementById('activateButton');

activateButton.addEventListener('click', toggleActivation);

drawGrid();

let scale = 1; // Initial scale

canvas.width = gridWidth * cellSize;
canvas.height = gridHeight * cellSize;

function handleZoom(event) {
    const zoomFactor = Math.sign(event.deltaY) > 0 ? 0.9 : 1.1; // Zoom in or out based on scroll direction
    const oldScale = scale;
    scale *= zoomFactor;
  
    // Adjust cell size based on new scale
    cellSize *= scale;
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;
  
    // Calculate new offset to maintain the zoom center
    const offsetX = (event.clientX - canvas.getBoundingClientRect().left) * (1 - scale / oldScale);
    const offsetY = (event.clientY - canvas.getBoundingClientRect().top) * (1 - scale / oldScale);
  
    // Redraw the grid
    drawGrid();
  
    // Adjust scroll position to maintain the zoom center
    canvas.scrollLeft += offsetX;
    canvas.scrollTop += offsetY;
  }
  
  canvas.addEventListener('wheel', handleZoom);
  
  drawGrid();

