// import Matter from 'matter-js';

const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();
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
  Bodies.rectangle(width / 2, 0, width, 40, {isStatic: true}),
  Bodies.rectangle(width / 2, height, width, 40, {isStatic: true}),
  Bodies.rectangle(0, height / 2, 40, height, {isStatic: true}),
  Bodies.rectangle(width, height / 2, 40, height, {isStatic: true}),
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
    [row - 1, column],
    [row, column + 1],
    [row + 1, column],
    [row, column - 1]
  ]);

  // For each neighbors ...

  // See if neighbor is out of bounds

  // If we have visited neigbor, continue to next neigbor

  // Remove a wall from either the horizontals or verticals array

  // Visit that next cell
};
  
stepThroughCell(startRow, startColumn);
console.log(grid);
