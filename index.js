// import Matter from 'matter-js';

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cells = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLength = width / cells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.querySelector('.canva'),
  engine: engine,
  options: {
    wireframes: true,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

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

const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals =  Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

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
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
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
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + 1,
      unitLength,
      4,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      4,
      unitLength,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * .7,
  unitLength * .7,
  {
    label: 'goals',
    isStatic: true
  }
);

World.add(world, goal);

// Ball

const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength / 4,
  {
    label: 'balls'
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

    if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});