//* Grab the canvas and get context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//* Maze class and cell class
class Maze {
    constructor(mazeWidth, mazeHeight, numOfRows, numOfCols) {
        this.numOfRows = numOfRows;
        this.numOfColumns = numOfCols;
        this.grid = [];
        // Find cell width and height
        this.cellWidth = mazeWidth / numOfRows;
        this.cellHeight = mazeHeight / numOfCols;
        // Set the canvas as the maze size
        canvas.width = mazeWidth;
        canvas.height = mazeHeight;
    }

    createGrid(rowNum = 0, colNum = 0, x = 0, y = 0) {
        for (let j = 0; j < this.numOfColumns; j++) {
        // while (colNum !== this.mazeHeight) {
            rowNum = 0;
            x = 0;
            let row = [];
            for(let i = 0; i < this.numOfRows; i++) {
                let cell = new Cell(rowNum, colNum);
                row.push(cell);
                console.log(`X is ${x} and Y is ${y}`);
                ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
                x += this.cellWidth;
                rowNum += 1;
            }
            this.grid.push(row);
            y += this.cellHeight;
            colNum += 1;
        }
    }
}

class Cell {
    constructor(rowNum, colNum) {
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.visited = false;
    }
}

//* Create a maze

let newMaze = new Maze(400, 400, 10, 10);
newMaze.createGrid(0, 0, 0, 0);
console.log(newMaze);




