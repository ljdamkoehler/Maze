// Destructure from the global variable of Matter that came from the matter js script I included.
const { 
    Engine, 
    Render, 
    Runner, 
    World, 
    Bodies,
    Body,
    Events 
} = Matter;

//Setting the dimensions of the canvas to configure the borders
const width = window.innerWidth;
const height = window.innerHeight;
const borderThickness = 2;
// Maze Dimension Config
// const cells = 3;
const cellsHorizontal = 14;
const cellsVertical = 10;
// Length of each square/unit used to generate the maze
// const unitLength = width / cells;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
//Creating a new engine
const engine = Engine.create();
engine.world.gravity.y = 0;
//Destructuring a world from our new engine from the global one
const { world } = engine;
// Creating a new render object from the global one
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, borderThickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, borderThickness, { isStatic: true }),
    Bodies.rectangle(0, height / 2, borderThickness, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, borderThickness, height, { isStatic: true })
]

World.add(world, walls);

//Maze Generation! ---------------------------- Maze Generation!

// Below is a function to help us randomize the items in an array

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

//The 2D Grid Array
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

//The verticals array
const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

//The horizontals array
const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

//Code for picking random starting position
const startRow = Math.floor(Math.random()* cellsVertical);
const startColumn = Math.floor(Math.random()* cellsHorizontal);

const workThroughCells = (row, column) => {
    // If i have visted the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }
    //Mark this cell as being visited (by making it true)
    grid[row][column] = true;
    //Assemble a randomely ordered (using the shuffle function) list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column -1, 'left']
    ]);
    //For each neighbor....
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        //Check to see if neighbor is out-of-bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
        // If we have visited neighbor, go on to the next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        //Check which direction we are moving and remove appropriate wall
        // The first conditionals two are to update verticals the second two are to update horizontals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        // Repeat the process by calling the function again
        workThroughCells(nextRow, nextColumn);
    }

    
};

workThroughCells(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        } 
       
        const wall = Bodies.rectangle(
           columnIndex * unitLengthX + unitLengthX / 2,
           rowIndex * unitLengthY + unitLengthY,
           unitLengthX,
           5,
           {
               label: 'wall',
               isStatic: true,
               render: {
                   fillStyle: 'red'
               }
           }
        );
        World.add(world, wall)
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex*unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        )
        World.add(world, wall);
    })
});

// Below is the code for the goal/finish area of the maze 
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);

World.add(world, goal);

// Below is the code for the ball
const ballRadius = Math.min(unitLengthX, unitLengthY);
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius/ 4,
    {
        label: 'ball',
        render: {
            fillStyle: 'blue'
        }
    }

);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if(event.code === 'KeyW' || event.code === 'ArrowUp') {
        Body.setVelocity(ball, { x, y: y - 5 })
    } 
    
    if(event.code === 'KeyA' || event.code === 'ArrowLeft') {
        Body.setVelocity(ball, { x: x - 5, y})
    } 
    
    if(event.code === 'KeyD' || event.code === 'ArrowRight') {
        Body.setVelocity(ball, { x: x + 5, y})
    } 
    
    if(event.code === 'KeyS' || event.code === 'ArrowDown') {
        Body.setVelocity(ball, { x, y: y + 5 })
    }
});

//Win Condition Code

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })
        }
    });
});
