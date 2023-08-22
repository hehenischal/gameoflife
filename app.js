document.addEventListener('DOMContentLoaded', function () {
  function activateCellOnClickAndDrag() {
    let isDrawing = false;
    let lastToggledCell = null;
    const brushSizeInput = document.getElementById('brushSize');
  
    function calculateCanvasCoordinates(event) {
      const canvasRect = canvas.getBoundingClientRect();
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      const offsetX = clientX - canvasRect.left;
      const offsetY = clientY - canvasRect.top;
      
      return {
        offsetX: offsetX,
        offsetY: offsetY
      };
    }
    
    
  
    function handleStart(event) {
      event.preventDefault();
      const { offsetX, offsetY } = calculateCanvasCoordinates(event);
      const col = Math.floor(offsetX / cellSize);
      const row = Math.floor(offsetY / cellSize);
      toggleCellState(row, col);
      lastToggledCell = { row, col };
      isDrawing = true;
    }
  
    const handleMove = (event) => {
      event.preventDefault();
      if (isDrawing) {
        const { offsetX, offsetY } = calculateCanvasCoordinates(event);
  
        const brushSize = parseInt(brushSizeInput.value, 10) || 1;
  
        const col = Math.floor(offsetX / cellSize);
        const row = Math.floor(offsetY / cellSize);
  
        if (!lastToggledCell || (lastToggledCell.row !== row || lastToggledCell.col !== col)) {
          lastToggledCell = { row, col };
          const cellsToToggle = [];
  
          for (let i = -Math.floor(brushSize / 2); i <= Math.floor(brushSize / 2); i++) {
            for (let j = -Math.floor(brushSize / 2); j <= Math.floor(brushSize / 2); j++) {
              const newRow = row + i;
              const newCol = col + j;
  
              if (!cellsToggled[`${newRow}-${newCol}`]) {
                cellsToggled[`${newRow}-${newCol}`] = true;
                cellsToToggle.push({ row: newRow, col: newCol });
              }
            }
          }
  
          cellsToToggle.forEach(cell => toggleCellState(cell.row, cell.col));
        }
      }
    }
    
  
    const handleEnd = () => {
      isDrawing = false;
      lastToggledCell = null;
      resetCellsToggled(); // Reset cellsToggled when drawing ends
    };
  
    canvas.addEventListener('pointerdown', handleStart);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleEnd);
    canvas.addEventListener('pointerleave', handleEnd);    
  
    function toggleCellState(row, col) {
      if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
        cellStates[row][col] = !cellStates[row][col];
        drawGrid();
      }
    }
    document.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { passive: false });
  
    drawGrid();
  }

  activateCellOnClickAndDrag();
});

document.addEventListener('DOMContentLoaded', function () {
  const howItWorksModal = new bootstrap.Modal(document.getElementById('howItWorksModal'));
  howItWorksModal.show();
});
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

let cellsToggled = {};

function resetCellsToggled() {
  cellsToggled = {};
}



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


  drawGrid();



  function forceRedraw() {
    canvas.style.display = 'none';
    canvas.offsetHeight; // Trigger reflow
    canvas.style.display = 'block';
  }
  
  function toggleCellState(row, col) {
    if (row >= 0 && row < gridHeight && col >= 0 && col < gridWidth) {
      cellStates[row][col] = !cellStates[row][col];
      forceRedraw();
    }
  }

