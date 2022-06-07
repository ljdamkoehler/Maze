//The 2D Grid Array
const grid = [];

for (let i = 0; i < 3; i++) {
    grid.push([]);
    for( let j = 0; j < 3; j++) {
        grid[i].push(false);
    }
}
console.log(grid);
