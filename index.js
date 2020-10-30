// import Matter from 'matter-js';

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

  const cellsHorizontal = 5;
  const cellsVertical = 5;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  const unitLengthX = width / cellsHorizontal;
  const unitLengthY = height / cellsVertical;
  
  const engine = Engine.create();
  const { world } = engine;
  const render = Render.create({
    element: document.querySelector('.canva'),
    engine: engine,
    options: {
      wireframes: false,
      width,
      height
    }
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);
  
  const createMaze = function () {
    engine.world.gravity.y = 0;
  
  // Walls
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true}),
  ];
  World.add(world, walls);
  
  // Maze Generate
  
  const shuffle = (arr) => {
    let counter = arr.length;
  
    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);
  
      counter--;
  
      [ arr[counter], arr[index] ] = [ arr[index], arr[counter] ];
    }
  
    return arr;
  };
  
  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));
  
  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));
  
  const horizontals =  Array(cellsHorizontal - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));
  
  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);
  
  const stepThroughCell = (row, column) => {
    // If i have visited the cell at (row, column), thn return
    if (grid[row][column]) {
      return;
    }
  
    // Mark this cell as being visited
    grid[row][column] = true;
  
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
      [row - 1, column, 'up'],
      [row, column + 1, 'right'],
      [row + 1, column, 'down'],
      [row, column - 1, 'left']
    ]);
    // For each neighbors ...
    for (let neigbor of neighbors) {
      const [ nextRow, nextColumn, direction ] = neigbor;
  
      // See if neighbor is out of bounds
      if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
        continue;
      }
      
      // If we have visited neigbor, continue to next neigbor
      if (grid[nextRow][nextColumn]) {
        continue;
      }
      
      // Remove a wall from either the horizontals or verticals array
      if (direction === 'left') {
        verticals[row][column - 1] = true;
      } else if (direction === 'right') {
        verticals[row][column] = true;
      } else if (direction === 'up') {
        horizontals[row - 1][column] = true;
      } else if (direction === 'down') {
        horizontals[row][column] = true;
      }
  
      // Visit that next cell
      stepThroughCell(nextRow, nextColumn); 
    }
  
  };
  
  stepThroughCell(1, 1);
    
  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) return;
     
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        4,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'red'
          }
        }
      );
      World.add(world, wall);
    });
  });
  
  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) return;
  
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        4,
        unitLengthY,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'red'
          }
        }
      );
      World.add(world, wall);
    });
  });
  
  // Goal
  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
      label: 'goals',
      isStatic: true,
      render: {
        fillStyle: 'green'
      }
    }
  );
  
  World.add(world, goal);
  
  // Ball
  const ballRadius = Math.min(unitLengthY, unitLengthX) / 4;
  const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
      label: 'balls',
      render: {
        fillStyle: 'blue'
      }
    }
  );
  
  World.add(world, ball);
  
  document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
  
    if (event.keyCode === 38) {
      Body.setVelocity(ball, { x, y: y - 5 });
    }
    
    if (event.keyCode === 39) {
      Body.setVelocity(ball, { x: x + 5, y });
      
    }
    
    if (event.keyCode === 40) {
      Body.setVelocity(ball, { x, y: y + 5 });
      
    }
    
    if (event.keyCode === 37) {
      Body.setVelocity(ball, { x: x - 5, y });
    }
  });
  
  // Win Condition
  
  Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
      const labels = ['balls', 'goals'];
  
      if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label) && document.querySelector('.winner').classList.contains('hidden')) {
        let win = document.querySelector('.winner');
        win.classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach(body => {
          if (body.label === 'wall') {
            Body.setStatic(body, false);
          }
          // Matter.Composite.remove(world, body);
        });
        createButton(win);
      }
    });
  });
};
createMaze();
function createButton(element) {
  const btn = document.createElement('button');
  btn.innerText = 'Re-start game';
  btn.classList.add('button');
  btn.addEventListener('click', () => {
    World.clear(engine.world);
    Engine.clear(engine);
    createMaze();
    element.removeChild(btn);
    element.classList.add('hidden');
  });
  element.appendChild(btn);
}