//* Grab the canvas and get context
const canvas = document.getElementById("canvas");
canvas.style.backgroundColor = "grey";
const ctx = canvas.getContext("2d");

//* Declare currentCell and previousCell variables
let currentCell;
let previousCell;

//* Create the Maze class
class Maze {
  constructor(width, height, numOfRows, numOfCols) {
    this.numOfRows = numOfRows;
    this.numOfCols = numOfCols;
    this.grid = [];
    // Find cell width and height
    this.cellWidth = width / numOfCols;
    this.cellHeight = height / numOfRows;
    // Set the canvas as the maze size
    canvas.width = width;
    canvas.height = height;
  }

  createGrid(rowNum = 0, colNum = 0, x = 0, y = 0) {
    for (let i = 0; i < this.numOfRows; i++) {
      // while (colNum !== this.mazeHeight) {
      x = 0;
      let row = [];

      for (let j = 0; j < this.numOfCols; j++) {
        let cell = new Cell(
          i,
          j,
          this.cellWidth,
          this.cellHeight,
          this.grid
        );
        cell.showCell();
        row.push(cell);
        x += this.cellWidth;
      }

      this.grid.push(row);
      y += this.cellHeight;
    }

    console.log(x);
    console.log(y);
  }

  buildPathFrom(cell = this.grid[0][0]) {
    currentCell = cell;
    //? If the cell has not been visited, mark cell as visited and find its unvisited neighbors
    while (currentCell.visited === false) {
      currentCell.visited = true;
      let unvisitedNeighbors = currentCell.findNeighbors();

      // If there are unvisited neighbors, pick one and build path from there
      if (unvisitedNeighbors.length !== 0) {
        let nextCell = currentCell.chooseNeighbor();
        nextCell.previousCell = currentCell;
        console.log(`Going to next cell printed below`);
        console.log(nextCell);
        currentCell.breakDownWalls(nextCell);
        currentCell.showCell();
        nextCell.showCell();
        console.log("Current cell -->");
        console.log(currentCell);
        console.log("Next cell -->");
        console.log(nextCell);
        console.log("----------------");
        this.buildPathFrom(nextCell);
        // If there are not unvisited neighbors, go back to previous cell
      } else {
        previousCell = currentCell.previousCell;
        console.log(`Need to backtrack to previous cell`);
        console.log("----------------");
        console.log(previousCell);
        this.buildPathFrom(previousCell);
      }
    }

    //! If the cell has been visited, check for unvisited neighbors
    while (currentCell !== this.grid[0][0]) {
      let unvisitedNeighbors = currentCell.findNeighbors();

      // If there are unvisited neighbors, build path from there
      if (unvisitedNeighbors.length !== 0) {
        let nextCell = currentCell.chooseNeighbor();
        nextCell.previousCell = currentCell;
        console.log(`Going to next cell printed below`);
        console.log(nextCell);
        currentCell.breakDownWalls(nextCell);
        currentCell.showCell();
        nextCell.showCell();
        console.log("Current cell -->");
        console.log(currentCell);
        console.log("Next cell -->");
        console.log(nextCell);
        console.log("----------------");
        this.buildPathFrom(nextCell);
        // If there are not unvisited neighbors, go back to previous cell
      } else {
        previousCell = currentCell.previousCell;
        console.log(`Need to backtrack to previous cell`);
        console.log("----------------");
        console.log(previousCell);
        this.buildPathFrom(previousCell);
      }
    }
  }
}

//* Create the Cell class
class Cell {
  constructor(rowNum, colNum, cellWidth, cellHeight, parentGrid) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.parentGrid = parentGrid;
    this.visited = false;
    this.previousCell;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    this.position = "not set";
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
    let x = this.colNum * this.cellWidth;
    let y = this.rowNum * this.cellHeight;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.fillStyle = "purple";

    if (this.walls.topWall === true) this.drawTopWall(x, y, this.cellWidth);
    if (this.walls.rightWall === true)
      this.drawRightWall(x, y, this.cellWidth, this.cellHeight);
    if (this.walls.bottomWall === true)
      this.drawBottomWall(x, y, this.cellWidth, this.cellHeight);
    if (this.walls.leftWall === true) this.drawLeftWall(x, y, this.cellHeight);

    if (this.visited) {
      // ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
    }
  }

  // Have this function for now so I personally can see what is going on with any specific cell
  fillGreen() {
    let x = this.rowNum * this.cellWidth;
    let y = this.colNum * this.cellHeight;
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(x + 1, y + 1, this.cellWidth - 2, this.cellHeight - 2);
  }

  findNeighbors() {
    let topNeighbor;
    let rightNeighbor;
    let bottomNeighbor;
    let leftNeighbor;
    let availableNeighbors = [];

    // Check if there is a neighbor in the grid or not, set position
    // if (this.colNum > 0) {
    if (this.rowNum > 0) {
      // topNeighbor = this.parentGrid[this.colNum - 1][this.rowNum];
      topNeighbor = this.parentGrid[this.colNum][this.rowNum - 1];
      topNeighbor.position = "top";
    }

    if (this.colNum < this.parentGrid.length - 1) {
      // if (this.rowNum < this.parentGrid[0].length - 1) {
      // rightNeighbor = this.parentGrid[this.colNum][this.rowNum + 1];
      rightNeighbor = this.parentGrid[this.colNum + 1][this.rowNum];
      rightNeighbor.position = "right";
    }

    // if (this.colNum < this.parentGrid.length - 1) {
    if (this.rowNum < this.parentGrid[0].length - 1) {
      // bottomNeighbor = this.parentGrid[this.colNum + 1][this.rowNum];
      bottomNeighbor = this.parentGrid[this.colNum][this.rowNum + 1];
      bottomNeighbor.position = "bottom";
    }

    // if (this.rowNum > 0) {
    if (this.colNum > 0) {
      // leftNeighbor = this.parentGrid[this.colNum][this.rowNum - 1];
      leftNeighbor = this.parentGrid[this.colNum - 1][this.rowNum];
      leftNeighbor.position = "left";
    }

    // Check if the neighbors have been visited - if not, push them to currentNeighbors
    if (topNeighbor && topNeighbor.visited === false)
      availableNeighbors.push(topNeighbor);
    if (rightNeighbor && rightNeighbor.visited === false)
      availableNeighbors.push(rightNeighbor);
    if (bottomNeighbor && bottomNeighbor.visited === false)
      availableNeighbors.push(bottomNeighbor);
    if (leftNeighbor && leftNeighbor.visited === false)
      availableNeighbors.push(leftNeighbor);

    console.log("Current cell available neighbors -->");
    console.log(availableNeighbors);
    return availableNeighbors;
  }

  chooseNeighbor() {
    // Pick a neighbor to visit at random
    let unvisitedNeighbors = currentCell.findNeighbors();
    let randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
    let randomNeighbor = unvisitedNeighbors[randomIndex];
    randomNeighbor.fillGreen();

    return randomNeighbor;
  }

  breakDownWalls(nextCell) {
    if (this.position === "top") {
      this.walls.topWall = false;
      nextCell.walls.bottomWall = false;
    }
    if (this.position === "right") {
      this.walls.rightWall = false;
      nextCell.walls.leftWall = false;
    }
    if (this.position === "bottom") {
      this.walls.bottomWall = false;
      nextCell.walls.topWall = false;
    }
    if (this.position === "left") {
      this.walls.leftWall = false;
      nextCell.walls.rightWall = false;
    }
  }
}

//* Create a maze
let newMaze = new Maze(700, 400, 10, 20);
newMaze.createGrid();
console.log(newMaze);