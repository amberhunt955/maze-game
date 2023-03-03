//* Grab the canvas and get context
const canvas = document.getElementById("canvas");
canvas.style.backgroundColor = "#9DC08B";
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
        let cell = new Cell(i, j, this.cellWidth, this.cellHeight, this.grid);
        // cell.showCell();
        row.push(cell);
        x += this.cellWidth;
      }

      this.grid.push(row);
      y += this.cellHeight;
    }
  }

  buildPathFrom(cell = this.grid[0][0]) {
    currentCell = cell;

    //? If the cell has not been visited, mark cell as visited and find its unvisited neighbors
    while (currentCell.visited === false) {
      currentCell.visited = true;
      currentCell.findNeighbors();

      // If there are unvisited neighbors, pick one and build path from there
      if (currentCell.neighbors.length !== 0) {
        let nextCell = currentCell.chooseNeighbor();
        nextCell.cell.previousCell = currentCell;
        currentCell.breakDownWalls(nextCell);
        // currentCell.showCell();
        // nextCell.cell.showCell();
        this.buildPathFrom(nextCell.cell);
        // If there are not unvisited neighbors, go back to previous cell
      } else {
        previousCell = currentCell.previousCell;
        this.buildPathFrom(previousCell);
      }
    }

    //! If the cell has been visited, check for unvisited neighbors
    while (currentCell !== this.grid[0][0]) {
      currentCell.findNeighbors();

      // If there are unvisited neighbors, build path from there
      if (currentCell.neighbors.length !== 0) {
        let nextCell = currentCell.chooseNeighbor();
        nextCell.cell.previousCell = currentCell;
        currentCell.breakDownWalls(nextCell);
        // currentCell.showCell();
        // nextCell.cell.showCell();
        this.buildPathFrom(nextCell.cell);
        // If there are not unvisited neighbors, go back to previous cell
      } else {
        previousCell = currentCell.previousCell;
        this.buildPathFrom(previousCell);
      }
    }

    // set entry and exit
    this.grid[0][0].walls.leftWall = false;
    this.grid[this.grid.length - 1][
      this.grid[0].length - 1
    ].walls.rightWall = false;
  }

  printMaze() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j].showCell();
      }
    }
  }
}

//* Create the Cell class
class Cell {
  constructor(rowNum, colNum, cellWidth, cellHeight, parentGrid) {
    this.visited = false;
    // Structure
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.parentGrid = parentGrid;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    // Friends
    this.previousCell;
    this.neighbors = [];
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

    if (this.walls.topWall === true) {
      this.drawTopWall(x, y, this.cellWidth);
    }

    if (this.walls.rightWall === true) {
      this.drawRightWall(x, y, this.cellWidth, this.cellHeight);
    }

    if (this.walls.bottomWall === true) {
      this.drawBottomWall(x, y, this.cellWidth, this.cellHeight);
    }

    if (this.walls.leftWall === true) {
      this.drawLeftWall(x, y, this.cellHeight);
    }

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
    let topNeighbor = {};
    let rightNeighbor = {};
    let bottomNeighbor = {};
    let leftNeighbor = {};
    let availableNeighbors = [];

    // Check if there is a neighbor in the grid or not, set position
    if (this.rowNum > 0) {
      topNeighbor.cell = this.parentGrid[this.rowNum - 1][this.colNum];
      topNeighbor.position = "top";
    }

    if (this.colNum < this.parentGrid[0].length - 1) {
      rightNeighbor.cell = this.parentGrid[this.rowNum][this.colNum + 1];
      rightNeighbor.position = "right";
    }

    if (this.rowNum < this.parentGrid.length - 1) {
      bottomNeighbor.cell = this.parentGrid[this.rowNum + 1][this.colNum];
      bottomNeighbor.position = "bottom";
    }

    if (this.colNum > 0) {
      leftNeighbor.cell = this.parentGrid[this.rowNum][this.colNum - 1];
      leftNeighbor.position = "left";
    }

    // Check if the neighbors have been visited - if not, push them to currentNeighbors
    if (topNeighbor.cell && topNeighbor.cell.visited === false)
      availableNeighbors.push(topNeighbor);
    if (rightNeighbor.cell && rightNeighbor.cell.visited === false)
      availableNeighbors.push(rightNeighbor);
    if (bottomNeighbor.cell && bottomNeighbor.cell.visited === false)
      availableNeighbors.push(bottomNeighbor);
    if (leftNeighbor.cell && leftNeighbor.cell.visited === false)
      availableNeighbors.push(leftNeighbor);

    this.neighbors = availableNeighbors;
  }

  chooseNeighbor() {
    // Pick a neighbor to visit at random
    let randomIndex = Math.floor(Math.random() * this.neighbors.length);
    let randomNeighbor = this.neighbors[randomIndex];

    return randomNeighbor;
  }

  breakDownWalls(nextCell) {
    if (nextCell.position === "top") {
      this.walls.topWall = false;
      nextCell.cell.walls.bottomWall = false;
    }
    if (nextCell.position === "right") {
      this.walls.rightWall = false;
      nextCell.cell.walls.leftWall = false;
    }
    if (nextCell.position === "bottom") {
      this.walls.bottomWall = false;
      nextCell.cell.walls.topWall = false;
    }
    if (nextCell.position === "left") {
      this.walls.leftWall = false;
      nextCell.cell.walls.rightWall = false;
    }
  }
}

//* Create a maze
let newMaze = new Maze(700, 400, 20, 25);
newMaze.createGrid();
console.log(newMaze);
newMaze.buildPathFrom();
newMaze.printMaze();

//& --------------------------------------

//* Create the Player class
class Player {
  constructor(rowNum, colNum, hostMaze) {
    // X and Y are representing the center of the circle
    this.x = (rowNum * hostMaze.cellWidth) / 2 + hostMaze.cellWidth / 2;
    this.y = (colNum * hostMaze.cellHeight) / 2 + hostMaze.cellHeight / 2;
    this.radius = (hostMaze.cellWidth + hostMaze.cellHeight) / 10;
    this.hostMaze = hostMaze;
    this.rowNum = Math.floor(this.x / hostMaze.cellWidth);
    this.colNum = Math.floor(this.y / hostMaze.cellHeight);
  }

  drawPlayer() {
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }

}

//* Create a user
const user = new Player(0, 0, newMaze);
console.log(user);
user.drawPlayer();

//* Update functions

function update(player) {
  checkIfWall();
  if (player.wallInQuestion === false) {
    ctx.clearRect(
      (player.colNum + 0.5) * player.hostMaze.cellWidth - player.radius - 2,
      (player.rowNum + 0.5) * player.hostMaze.cellHeight - player.radius - 2,
      player.radius * 2 + 4,
      player.radius * 2 + 4
    );
    player.drawPlayer();

    requestAnimationFrame(function () {
      checkIfWall();
      if (player.wallInQuestion === false) {
        changePosition();
        update(user);
        changeRowOrCol();
      }
    });
  }
}

function changePosition() {
  if (key === "up") {
    user.y -= user.hostMaze.cellHeight;
  }

  if (key === "right") {
    user.x += user.hostMaze.cellWidth;
  }

  if (key === "down") {
    user.y += user.hostMaze.cellHeight;
  }

  if (key === "left") {
    user.x -= user.hostMaze.cellWidth;
  }
}

function changeRowOrCol() {
  if (key === "up") {
    user.rowNum--;
  }

  if (key === "right") {
    user.colNum++;
  }

  if (key === "down") {
    user.rowNum++;
  }

  if (key === "left") {
    user.colNum--;
  }
}

function checkIfWall() {
  if (key === "up") {
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.topWall;
  }

  if (key === "right") {
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.rightWall;
  }

  if (key === "down") {
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.bottomWall;
  }

  if (key === "left") {
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.leftWall;
  }
}

//* Key Controls
let key;
addEventListener("keydown", function (event) {
  if (event.code === "ArrowUp") {
    console.log("Up arrow pressed");
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.topWall;
    key = "up";

    if (user.wallInQuestion === false) {
      user.y -= user.hostMaze.cellHeight;
      update(user);
      user.rowNum--;
    }
  }

  if (event.code === "ArrowRight") {
    console.log("Right arrow pressed");
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.rightWall;
    key = "right";

    if (user.wallInQuestion === false) {
      user.x += user.hostMaze.cellWidth;
      update(user);
      user.colNum++;
    }
  }

  if (event.code === "ArrowDown") {
    console.log("Down arrow pressed");
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.bottomWall;
    key = "down";

    if (user.wallInQuestion === false) {
      user.y += user.hostMaze.cellHeight;
      update(user);
      user.rowNum++;
    }
  }

  if (event.code === "ArrowLeft") {
    console.log("Left arrow pressed");
    user.wallInQuestion =
      user.hostMaze.grid[user.rowNum][user.colNum].walls.leftWall;
    key = "left";

    if (user.wallInQuestion === false) {
      user.x -= user.hostMaze.cellWidth;
      update(user);
      user.colNum--;
    }
  }
});
