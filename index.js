//* Grab the canvas and get context
const canvas = document.getElementById("canvas");
canvas.style.backgroundColor = "black";
const ctx = canvas.getContext("2d");

//* Current cell
let currentCell;

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
                let cell = new Cell(rowNum, colNum, this.cellWidth, this.cellHeight, this.grid);
                cell.showCell();
                row.push(cell);
                x += this.cellWidth;
                rowNum += 1;
            }
            this.grid.push(row);
            y += this.cellHeight;
            colNum += 1;
        }
        
    }

    createPath() {
        currentCell = this.grid[0][0];
        currentCell.visited = true;
    }
}

class Cell {
    constructor(rowNum, colNum, cellWidth, cellHeight, parentGrid) {
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.parentGrid = parentGrid;
        this.visited = false;
        this.walls = {
            topWall: true,
            rightWall: true,
            bottomWall: true,
            leftWall: true
        }
    }

    drawTopWall(x, y, cellWidth) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellWidth, y);
        ctx.stroke();
    }

    drawRightWall(x, y, cellWidth, cellHeight) {
        ctx.beginPath();
        ctx.moveTo(x + cellWidth, y);
        ctx.lineTo(x + cellWidth, y + cellHeight);
        ctx.stroke();
    }

    drawBottomWall(x, y, cellWidth, cellHeight) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellHeight);
        ctx.lineTo(x + cellWidth, y + cellHeight);
        ctx.stroke();
    }

    drawLeftWall(x, y, cellHeight) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellHeight);
        ctx.stroke();
    }

    showCell() {
        let x = this.rowNum * this.cellWidth;
        let y = this.colNum * this.cellHeight;
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.fillStyle = "purple";

        if (this.walls.topWall) this.drawTopWall(x, y, this.cellWidth);
        if (this.walls.rightWall) this.drawRightWall(x, y, this.cellWidth, this.cellHeight);
        if (this.walls.bottomWall) this.drawBottomWall(x, y, this.cellWidth, this.cellHeight);
        if (this.walls.leftWall) this.drawLeftWall (x, y, this.cellHeight);

        if(this.visited) {
            ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
        }
    
    }

    // Have this function for now so I personally can see what is going on with any specific cell
    fillGreen() {
        let x = this.rowNum * this.cellWidth;
        let y = this.colNum * this.cellHeight;
        ctx.fillStyle = "green";
        ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
    }
    
    findNeighbors() {
        let topNeighbor;
        let rightNeighbor;
        let bottomNeighbor;
        let leftNeighbor;
        let currentNeighbors = [];

        // Check if there is a neighbor in the grid or not
        if (this.colNum > 0) topNeighbor = this.parentGrid[this.colNum - 1][this.rowNum];
        if (this.rowNum < this.parentGrid[0].length - 1) rightNeighbor = this.parentGrid[this.colNum][this.rowNum + 1];
        if (this.colNum < this.parentGrid.length - 1) bottomNeighbor = this.parentGrid[this.colNum + 1][this.rowNum];
        if (this.rowNum > 0) leftNeighbor = this.parentGrid[this.colNum][this.rowNum - 1];
    
        // Check if the neighbors have been visited - if not, push them to currentNeighbors
        if (topNeighbor && topNeighbor.visited === false) currentNeighbors.push(topNeighbor);
        if (rightNeighbor && rightNeighbor.visited === false) currentNeighbors.push(rightNeighbor);
        if (bottomNeighbor && bottomNeighbor.visited === false) currentNeighbors.push(bottomNeighbor);
        if (leftNeighbor && leftNeighbor.visited === false) currentNeighbors.push(leftNeighbor);

        return currentNeighbors;
    }

}

//* Create a maze

let newMaze = new Maze(700, 400, 10, 10);
newMaze.createGrid(0, 0, 0, 0);
newMaze.createPath();
currentCell.showCell();
console.log(currentCell.findNeighbors());




