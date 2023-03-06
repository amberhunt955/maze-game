//* Grab the canvas and get context
const canvas = document.getElementById("canvas");
canvas.style.backgroundColor = "#9DC08B";
const ctx = canvas.getContext("2d");
canvas.style.display = "none";

//* Start Button
const startButton = document.createElement("button");
startButton.textContent = "Start Game";
startButton.addEventListener("click", function () {
  reset();
  playGame();
});

//* Get game text
const gameText = document.getElementById("game-text");
gameText.textContent =
  "This is a two player game. Move the yellow circle with the arrow keys. Move the green circle with the AWDS keys. The goal of the yellow circle is to get to the bottom right corner. The goal of the green circle is to get to the top left corner. Whomever achieves their goal first, wins!";

const container = document.getElementById("container");
const body = document.getElementById("body");
body.appendChild(startButton);

//*

const h1 = document.querySelector("h1");

//* Declare currentCell and previousCell variables
let currentCell;
let previousCell;
let round = 0;
let yellowScore = 0;
let greenScore = 0;

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

  createGrid(x = 0, y = 0) {
    for (let i = 0; i < this.numOfRows; i++) {
      x = 0;
      let row = [];

      for (let j = 0; j < this.numOfCols; j++) {
        let cell = new Cell(i, j, this.cellWidth, this.cellHeight, this.grid);
        row.push(cell);
        x += this.cellWidth;
      }

      this.grid.push(row);
      y += this.cellHeight;
    }
  }

  buildPathFrom(cell = this.grid[0][0]) {
    currentCell = cell;

    //! If the cell has not been visited, mark cell as visited and find its unvisited neighbors
    while (currentCell.visited === false) {
      currentCell.visited = true;
      currentCell.findNeighbors();
      // If there are unvisited neighbors, pick one and build path from there
      if (currentCell.neighbors.length !== 0) {
        let nextCell = currentCell.chooseNeighbor();
        nextCell.cell.previousCell = currentCell;
        currentCell.breakDownWalls(nextCell);
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
        this.buildPathFrom(nextCell.cell);
        // If there are not unvisited neighbors, go back to previous cell
      } else {
        previousCell = currentCell.previousCell;
        this.buildPathFrom(previousCell);
      }
    }

    //! Set entry and exit
    // (Leaving this out for now as I had trouble with win/lose state)
    // this.grid[0][0].walls.leftWall = false;
    // this.grid[this.grid.length - 1][
    //   this.grid[0].length - 1
    // ].walls.rightWall = false;
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
    this.parentGrid = parentGrid;
    this.visited = false;
    // Structure
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
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

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    // If a wall exists - draw it
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
  }

  findNeighbors() {
    let topNeighbor = {};
    let rightNeighbor = {};
    let bottomNeighbor = {};
    let leftNeighbor = {};
    let availableNeighbors = [];

    // Check if there is a neighbor in the grid or not; if so - set neighbor position
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

    // Check if the neighbors have been visited - if not, push them to availableNeighbors
    if (topNeighbor.cell && topNeighbor.cell.visited === false) {
      availableNeighbors.push(topNeighbor);
    }
    if (rightNeighbor.cell && rightNeighbor.cell.visited === false) {
      availableNeighbors.push(rightNeighbor);
    }
    if (bottomNeighbor.cell && bottomNeighbor.cell.visited === false) {
      availableNeighbors.push(bottomNeighbor);
    }
    if (leftNeighbor.cell && leftNeighbor.cell.visited === false) {
      availableNeighbors.push(leftNeighbor);
    }

    // Assign the availableNeighbors array as a property of the cell to whom they are neighbors
    this.neighbors = availableNeighbors;
  }

  chooseNeighbor() {
    // Pick a neighbor to visit at random
    let randomIndex = Math.floor(Math.random() * this.neighbors.length);
    let randomNeighbor = this.neighbors[randomIndex];

    return randomNeighbor;
  }

  breakDownWalls(nextCell) {
    // Choose which walls won't be printed based on
    // the direction of the path in the maze
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

//* Create the Player class
class Player {
  constructor(rowNum, colNum, hostMaze, color) {
    this.hostMaze = hostMaze;
    // Positioning the player. X and Y are representing the center of the circle.
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.x = rowNum * hostMaze.cellWidth + hostMaze.cellWidth / 2;
    this.y = colNum * hostMaze.cellHeight + hostMaze.cellHeight / 2;
    // Size and color
    this.radius = (hostMaze.cellWidth + hostMaze.cellHeight) / 10;
    this.color = color;
  }

  drawPlayer() {
    // Players are circles
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }
}

//* Create the playGame function
function playGame() {
  if (startButton.parentNode === body) {
    body.removeChild(startButton);
    body.removeChild(h1);
  } else if (startButton.parentNode === container) {
    container.removeChild(startButton);
  }
  body.style.flexDirection = "row";
  round++;
  canvas.style.display = "block";
  gameText.innerHTML = `<b>Round ${round}</b><br>Yellow Score: ${yellowScore}<br/>Green Score: ${greenScore}`;
  console.log(`Round ${round} -->`);

  //! Updating player position
  let framesPerSecond = 10;
  let key;

  function update(player) {
    console.log(player);
    checkIfWall(player);
    if (player.wallInQuestion === false) {
      ctx.clearRect(
        (player.colNum + 0.5) * player.hostMaze.cellWidth - player.radius - 2,
        (player.rowNum + 0.5) * player.hostMaze.cellHeight - player.radius - 2,
        player.radius * 2 + 4,
        player.radius * 2 + 4
      );
      player.drawPlayer();
      determineWinner();

      setTimeout(function () {
        requestAnimationFrame(function () {
          checkIfWall(player);
          if (player.wallInQuestion === false) {
            changePosition(player);
            update(player);
            changeRowOrCol(player);
          }
        });
      }, 1000 / framesPerSecond);
    }
  }

  function changePosition(player) {
    if (key === "up") {
      player.y -= player.hostMaze.cellHeight / 2;
    }

    if (key === "right") {
      player.x += player.hostMaze.cellWidth / 2;
    }

    if (key === "down") {
      player.y += player.hostMaze.cellHeight / 2;
    }

    if (key === "left") {
      player.x -= player.hostMaze.cellWidth / 2;
    }
  }

  function changeRowOrCol(player) {
    if (key === "up") {
      player.rowNum -= 0.5;
    }

    if (key === "right") {
      player.colNum += 0.5;
    }

    if (key === "down") {
      player.rowNum += 0.5;
    }

    if (key === "left") {
      player.colNum -= 0.5;
    }
  }

  function checkIfWall(player) {
    if (key === "up" && player.rowNum % 1 === 0) {
      player.wallInQuestion =
        player.hostMaze.grid[Math.floor(player.rowNum)][
          Math.floor(player.colNum)
        ].walls.topWall;
    }

    if (
      key === "right" &&
      player.colNum < player.hostMaze.grid[0].length &&
      player.colNum % 1 === 0
    ) {
      player.wallInQuestion =
        player.hostMaze.grid[Math.floor(player.rowNum)][
          Math.floor(player.colNum)
        ].walls.rightWall;
    }

    if (key === "down" && player.rowNum % 1 === 0) {
      player.wallInQuestion =
        player.hostMaze.grid[Math.floor(player.rowNum)][
          Math.floor(player.colNum)
        ].walls.bottomWall;
    }

    if (key === "left" && player.colNum % 1 === 0) {
      player.wallInQuestion =
        player.hostMaze.grid[Math.floor(player.rowNum)][
          Math.floor(player.colNum)
        ].walls.leftWall;
    }
  }

  //! Keyboard controls
  addEventListener("keydown", function (event) {
    //& user1 controls
    if (event.code === "ArrowUp") {
      if (user1.colNum % 1 === 0) {
        user1.wallInQuestion =
          user1.hostMaze.grid[Math.floor(user1.rowNum)][
            Math.floor(user1.colNum)
          ].walls.topWall;
        key = "up";

        if (user1.wallInQuestion === false) {
          user1.y -= user1.hostMaze.cellHeight / 2;
          update(user1);
          user1.rowNum -= 0.5;
        } else if (
          user1.wallInQuestion === true &&
          user1.rowNum % 1 !== 0 &&
          user1.colNum % 1 === 0
        ) {
          user1.wallInQuestion = false;
          user1.y -= user1.hostMaze.cellHeight / 2;
          update(user1);
          user1.rowNum -= 0.5;
        }
      }
    }

    if (event.code === "ArrowRight") {
      if (user1.rowNum % 1 === 0) {
        user1.wallInQuestion =
          user1.hostMaze.grid[Math.floor(user1.rowNum)][
            Math.floor(user1.colNum)
          ].walls.rightWall;
        key = "right";

        if (user1.wallInQuestion === false) {
          user1.x += user1.hostMaze.cellWidth / 2;
          update(user1);
          user1.colNum += 0.5;
        } else if (
          user1.wallInQuestion === true &&
          user1.colNum % 1 !== 0 &&
          user1.rowNum % 1 === 0
        ) {
          user1.wallInQuestion = false;
          user1.x += user1.hostMaze.cellWidth / 2;
          update(user1);
          user1.colNum += 0.5;
        }
      }
    }

    if (event.code === "ArrowDown") {
      if (user1.colNum % 1 === 0) {
        user1.wallInQuestion =
          user1.hostMaze.grid[Math.floor(user1.rowNum)][
            Math.floor(user1.colNum)
          ].walls.bottomWall;
        key = "down";

        if (user1.wallInQuestion === false) {
          user1.y += user1.hostMaze.cellHeight / 2;
          update(user1);
          user1.rowNum += 0.5;
        } else if (
          user1.wallInQuestion === true &&
          user1.rowNum % 1 !== 0 &&
          user1.colNum % 1 === 0
        ) {
          user1.wallInQuestion = false;
          user1.y += user1.hostMaze.cellHeight / 2;
          update(user1);
          user1.rowNum += 0.5;
        }
      }
    }

    if (event.code === "ArrowLeft") {
      if (user1.rowNum % 1 === 0) {
        user1.wallInQuestion =
          user1.hostMaze.grid[Math.floor(user1.rowNum)][
            Math.floor(user1.colNum)
          ].walls.leftWall;
        key = "left";

        if (user1.wallInQuestion === false) {
          user1.x -= user1.hostMaze.cellWidth / 2;
          update(user1);
          user1.colNum -= 0.5;
        } else if (
          user1.wallInQuestion === true &&
          user1.colNum % 1 !== 0 &&
          user1.rowNum % 1 === 0
        ) {
          user1.wallInQuestion = false;
          user1.x -= user1.hostMaze.cellWidth / 2;
          update(user1);
          user1.colNum -= 0.5;
        }
      }
    }

    //& user2 controls
    if (event.code === "KeyW") {
      user2.wallInQuestion =
        user2.hostMaze.grid[user2.rowNum][user2.colNum].walls.topWall;
      key = "up";

      if (user2.wallInQuestion === false) {
        user2.y -= user2.hostMaze.cellHeight;
        update(user2);
        user2.rowNum--;
      }
    }

    if (event.code === "KeyD") {
      user2.wallInQuestion =
        user2.hostMaze.grid[user2.rowNum][user2.colNum].walls.rightWall;
      key = "right";

      if (user2.wallInQuestion === false) {
        user2.x += user2.hostMaze.cellWidth;
        update(user2);
        user2.colNum++;
      }
    }

    if (event.code === "KeyS") {
      user2.wallInQuestion =
        user2.hostMaze.grid[user2.rowNum][user2.colNum].walls.bottomWall;
      key = "down";

      if (user2.wallInQuestion === false) {
        user2.y += user2.hostMaze.cellHeight;
        update(user2);
        user2.rowNum++;
      }
    }

    if (event.code === "KeyA") {
      user2.wallInQuestion =
        user2.hostMaze.grid[user2.rowNum][user2.colNum].walls.leftWall;
      key = "left";

      if (user2.wallInQuestion === false) {
        user2.x -= user2.hostMaze.cellWidth;
        update(user2);
        user2.colNum--;
      }
    }
  });

  //! End game
  function determineWinner() {
    if (user1.x === 585 && user1.y === 438.75) {
      yellowScore++;
      gameText.textContent = `Round ${round} results: Yellow circle wins! Green circle loses. If you would like to continue, press Play Again.`;
      startButton.textContent = "Play Again";
      container.appendChild(startButton);
    }

    if (user2.x === 15 && user2.y === 11.25) {
      greenScore++;
      gameText.textContent = `Round ${round} results: Green circle wins! Yellow circle loses. If you would like to continue, press Play Again.`;
      startButton.textContent = "Play Again";
      container.appendChild(startButton);
    }
  }
}

//* Reset function
function reset() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  firstMaze.grid = [];

  firstMaze.createGrid();
  firstMaze.buildPathFrom();
  firstMaze.printMaze();

  user1.rowNum = 0;
  user1.colNum = 0;
  user1.x = 15;
  user1.y = 11.25;
  user1.drawPlayer();

  user2.rowNum = firstMaze.grid.length - 1;
  user2.colNum = firstMaze.grid[0].length - 1;
  user2.x = 585;
  user2.y = 438.75;
  user2.drawPlayer();
}

//&-------------------------------------------------------

//* Create maze instances and two player instances
let firstMaze = new Maze(600, 450, 20, 20);
firstMaze.createGrid();
firstMaze.buildPathFrom();
firstMaze.printMaze();

const user1 = new Player(0, 0, firstMaze, "yellow");
user1.drawPlayer();

const user2 = new Player(
  firstMaze.grid.length - 1,
  firstMaze.grid[0].length - 1,
  firstMaze,
  "#16FF00"
);
user2.drawPlayer();

//&-------------------------------------------------------
