//&----------------------------------------------------------------
//& GLOBAL VARIABLES

let currentCell;
let round = 0;
let yellowScore = 0;
let greenScore = 0;

//&----------------------------------------------------------------
//& DOM MANIPULATION

const body = document.getElementById("body-div");

const h1 = document.querySelector("h1");

const containerDiv = document.getElementById("container");
const gameText = document.getElementById("game-text");
gameText.textContent =
  "ROAD TRIP! Who can get to their destination first? Move the yellow circle with the arrow keys. Move the green circle with the AWDS keys. The goal of the yellow circle is to get to the bottom right corner. The goal of the green circle is to get to the top left corner. Arrive to your destination before your opponent to win the round. This game is best of 3. Good luck!";

const startButton = document.getElementById("button");
startButton.addEventListener("click", function () {
  reset(round);
  playRound();
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.style.display = "none";

//&----------------------------------------------------------------
//& MAZE, CELL, AND PLAYER CLASSES

//* CREATE THE MAZE CLASS
class Maze {
  constructor(width, height, numOfRows, numOfCols) {
    this.numOfRows = numOfRows;
    this.numOfCols = numOfCols;
    this.grid = [];
    this.cellWidth = width / numOfCols;
    this.cellHeight = height / numOfRows;
    // Set the canvas as the maze size
    canvas.width = width;
    canvas.height = height;
  }

  //? The first step in generating a maze is creating a grid of cells (using arrays)
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

  //? Once you have the grid, you can build a maze path from any starting cell
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
      } else {
        // If there are not unvisited neighbors, go back to previous cell
        this.buildPathFrom(currentCell.previousCell);
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
      } else {
        // If there are not unvisited neighbors, go back to previous cell
        this.buildPathFrom(currentCell.previousCell);
      }
    }

    //! Set entry and exit
    //! (Leaving this out for now as I had trouble with win/lose state)
    // this.grid[0][0].walls.leftWall = false;
    // this.grid[this.grid.length - 1][this.grid[0].length - 1].walls.rightWall = false;
  }

  //? Once all cell walls have been determined true/false, print each cell
  printMaze() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j].showCell();
      }
    }
  }
}

//* CREATE THE CELL CLASS
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

  //? Find and store all available neighbors
  findNeighbors() {
    let topNeighbor = {};
    let rightNeighbor = {};
    let bottomNeighbor = {};
    let leftNeighbor = {};
    let availableNeighbors = [];

    //! Check if there is a neighbor in the grid or not; if so - set neighbor position
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

    //! Check if the neighbors have been visited - if not, push them to availableNeighbors
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

    //! Assign the availableNeighbors array as a property of the cell to whom they are neighbors
    this.neighbors = availableNeighbors;
  }

  //? Pick an available neighbor at random
  chooseNeighbor() {
    let randomIndex = Math.floor(Math.random() * this.neighbors.length);
    let randomNeighbor = this.neighbors[randomIndex];
    return randomNeighbor;
  }

  //? Choose which walls won't be printed based on the direction of the path in the maze
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

  //? Cell display functions -->

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
}

//* CREATE THE PLAYER CLASS
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
    // Animation
  }

  drawPlayer() {
    // (players are circles)
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }
}

//&----------------------------------------------------------------
//& CREATE THREE MAZE INSTANCES AND TWO PLAYER INSTANCES

let firstMaze = new Maze(600, 450, 15, 15);
firstMaze.createGrid();

//! These will be added in a later edition
// let secondMaze = new Maze (600, 450, 12, 14);
// let thirdMaze = new Maze (600, 450, 20, 20);

const user1 = new Player(0, 0, firstMaze, "yellow");
user1.drawPlayer();

const user2 = new Player(firstMaze.grid.length - 1, firstMaze.grid[0].length - 1, firstMaze, "#16FF00");
user2.drawPlayer();

//&----------------------------------------------------------------
//& GAME FUNCTIONS

//* CREATE THE PLAY ROUND FUNCTION
function playRound() {
  //? Manipulate DOM based on Game start vs Round start
  if (startButton.parentNode === body) {
    body.removeChild(startButton);
    body.removeChild(h1);
  } else if (startButton.parentNode === containerDiv) {
    containerDiv.removeChild(startButton);
  }

  // body.style.flexDirection = "row";
  canvas.style.display = "block";
  round++;
  gameText.innerHTML = `<b>Round ${round}</b><br>Yellow Score: ${yellowScore}<br/>Green Score: ${greenScore}`;

  //? Updating player position
  let key;
  const framesPerSecond = 10;

  function update(player) {
    checkIfWall(player);

    if (player.wallInQuestion === false) {
      ctx.clearRect(
        (player.colNum + 0.5) * player.hostMaze.cellWidth - player.radius - 2,
        (player.rowNum + 0.5) * player.hostMaze.cellHeight - player.radius - 2,
        player.radius * 2 + 4,
        player.radius * 2 + 4
      );
      player.drawPlayer();
      determineRoundWinner();

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
    if (key === "up") player.y -= player.hostMaze.cellHeight / 4;
    if (key === "right") player.x += player.hostMaze.cellWidth / 4;
    if (key === "down") player.y += player.hostMaze.cellHeight / 4;
    if (key === "left") player.x -= player.hostMaze.cellWidth / 4;
  }

  function changeRowOrCol(player) {
    if (key === "up") player.rowNum -= 0.25;
    if (key === "right") player.colNum += 0.25;
    if (key === "down") player.rowNum += 0.25;
    if (key === "left") player.colNum -= 0.25;
  }

  function checkIfWall(player) {
    if (key === "up" && player.rowNum % 1 === 0) {
      player.wallInQuestion = player.hostMaze.grid[Math.floor(player.rowNum)][Math.floor(player.colNum)].walls.topWall;
    }

    if (key === "right" && player.colNum < player.hostMaze.grid[0].length && player.colNum % 1 === 0) {
      player.wallInQuestion = player.hostMaze.grid[Math.floor(player.rowNum)][Math.floor(player.colNum)].walls.rightWall;
    }

    if (key === "down" && player.rowNum % 1 === 0) {
      player.wallInQuestion = player.hostMaze.grid[Math.floor(player.rowNum)][Math.floor(player.colNum)].walls.bottomWall;
    }

    if (key === "left" && player.colNum % 1 === 0) {
      player.wallInQuestion = player.hostMaze.grid[Math.floor(player.rowNum)][Math.floor(player.colNum)].walls.leftWall;
    }
  }

  //? Keyboard controls
  addEventListener("keydown", function (event) {
    //! user1 controls
    if (event.code === "ArrowUp" && user1.colNum % 1 === 0) {
      user1.wallInQuestion = user1.hostMaze.grid[Math.floor(user1.rowNum)][Math.floor(user1.colNum)].walls.topWall;
      key = "up";

      if (user1.wallInQuestion === false) {
        user1.y -= user1.hostMaze.cellHeight / 4;
        update(user1);
        user1.rowNum -= 0.25;
      } else if (user1.wallInQuestion === true && user1.rowNum % 1 !== 0 && user1.colNum % 1 === 0) {
        user1.wallInQuestion = false;
        user1.y -= user1.hostMaze.cellHeight / 4;
        update(user1);
        user1.rowNum -= 0.25;
      }
    }

    if (event.code === "ArrowRight" && user1.rowNum % 1 === 0) {
      user1.wallInQuestion = user1.hostMaze.grid[Math.floor(user1.rowNum)][Math.floor(user1.colNum)].walls.rightWall;
      key = "right";

      if (user1.wallInQuestion === false) {
        user1.x += user1.hostMaze.cellWidth / 4;
        update(user1);
        user1.colNum += 0.25;
      } else if (user1.wallInQuestion === true && user1.colNum % 1 !== 0 && user1.rowNum % 1 === 0) {
        user1.wallInQuestion = false;
        user1.x += user1.hostMaze.cellWidth / 4;
        update(user1);
        user1.colNum += 0.25;
      }
    }

    if (event.code === "ArrowDown" && user1.colNum % 1 === 0) {
      user1.wallInQuestion = user1.hostMaze.grid[Math.floor(user1.rowNum)][Math.floor(user1.colNum)].walls.bottomWall;
      key = "down";

      if (user1.wallInQuestion === false) {
        user1.y += user1.hostMaze.cellHeight / 4;
        update(user1);
        user1.rowNum += 0.25;
      } else if (user1.wallInQuestion === true && user1.rowNum % 1 !== 0 && user1.colNum % 1 === 0) {
        user1.wallInQuestion = false;
        user1.y += user1.hostMaze.cellHeight / 4;
        update(user1);
        user1.rowNum += 0.25;
      }
    }

    if (event.code === "ArrowLeft" && user1.rowNum % 1 === 0) {
      user1.wallInQuestion = user1.hostMaze.grid[Math.floor(user1.rowNum)][Math.floor(user1.colNum)].walls.leftWall;
      key = "left";

      if (user1.wallInQuestion === false) {
        user1.x -= user1.hostMaze.cellWidth / 4;
        update(user1);
        user1.colNum -= 0.25;
      } else if (user1.wallInQuestion === true && user1.colNum % 1 !== 0 && user1.rowNum % 1 === 0) {
        user1.wallInQuestion = false;
        user1.x -= user1.hostMaze.cellWidth / 4;
        update(user1);
        user1.colNum -= 0.25;
      }
    }

    //! user2 controls
    if (event.code === "KeyW" && user2.colNum % 1 === 0) {
      user2.wallInQuestion = user2.hostMaze.grid[Math.floor(user2.rowNum)][Math.floor(user2.colNum)].walls.topWall;
      key = "up";

      if (user2.wallInQuestion === false) {
        user2.y -= user2.hostMaze.cellHeight / 4;
        update(user2);
        user2.rowNum -= 0.25;
      } else if (user2.wallInQuestion === true && user2.rowNum % 1 !== 0 && user2.colNum % 1 === 0) {
        user2.wallInQuestion = false;
        user2.y -= user2.hostMaze.cellHeight / 4;
        update(user2);
        user2.rowNum -= 0.25;
      }
    }

    if (event.code === "KeyD" && user2.rowNum % 1 === 0) {
      user2.wallInQuestion = user2.hostMaze.grid[Math.floor(user2.rowNum)][Math.floor(user2.colNum)].walls.rightWall;
      key = "right";

      if (user2.wallInQuestion === false) {
        user2.x += user2.hostMaze.cellWidth / 4;
        update(user2);
        user2.colNum += 0.25;
      } else if (user2.wallInQuestion === true && user2.colNum % 1 !== 0 && user2.rowNum % 1 === 0) {
        user2.wallInQuestion = false;
        user2.x += user2.hostMaze.cellWidth / 4;
        update(user2);
        user2.colNum += 0.25;
      }
    }

    if (event.code === "KeyS" && user2.colNum % 1 === 0) {
      user2.wallInQuestion = user2.hostMaze.grid[Math.floor(user2.rowNum)][Math.floor(user2.colNum)].walls.bottomWall;
      key = "down";

      if (user2.wallInQuestion === false) {
        user2.y += user2.hostMaze.cellHeight / 4;
        update(user2);
        user2.rowNum += 0.25;
      } else if (user2.wallInQuestion === true && user2.rowNum % 1 !== 0 && user2.colNum % 1 === 0) {
        user2.wallInQuestion = false;
        user2.y += user2.hostMaze.cellHeight / 4;
        update(user2);
        user2.rowNum += 0.25;
      }
    }

    if (event.code === "KeyA" && user2.rowNum % 1 === 0) {
      user2.wallInQuestion = user2.hostMaze.grid[Math.floor(user2.rowNum)][Math.floor(user2.colNum)].walls.leftWall;
      key = "left";

      if (user2.wallInQuestion === false) {
        user2.x -= user2.hostMaze.cellWidth / 4;
        update(user2);
        user2.colNum -= 0.25;
      } else if (user2.wallInQuestion === true && user2.colNum % 1 !== 0 && user2.rowNum % 1 === 0) {
        user2.wallInQuestion = false;
        user2.x -= user2.hostMaze.cellWidth / 4;
        update(user2);
        user2.colNum -= 0.25;
      }
    }
  });

  //? End of round
  function determineRoundWinner() {
    if (user1.x === canvas.width - user1.hostMaze.cellWidth / 2 && user1.y === canvas.height - user1.hostMaze.cellHeight / 2) {
      yellowScore++;
      gameText.textContent = `Round ${round} results: Yellow circle wins! Green circle loses.`;
      announceGameWinner();
    }

    if (user2.x === user2.hostMaze.cellWidth / 2 && user2.y === user2.hostMaze.cellHeight / 2) {
      greenScore++;
      gameText.textContent = `Round ${round} results: Green circle wins! Yellow circle loses.`;
      announceGameWinner();
    }
  }

  //? End of game
  function announceGameWinner() {
    let gameWinMessage;

    if (yellowScore > greenScore) gameWinMessage = "Yellow circle wins!";
    if (greenScore > yellowScore) gameWinMessage = "Green circle wins!";
    if (greenScore === yellowScore) gameWinMessage = "It's a tie.";

    if (round === 3) {
      gameText.innerHTML += `<br/><br/>Yellow Score: ${yellowScore}<br/>Green Score: ${greenScore}<br/><br/>GAME OVER!<br/>${gameWinMessage}`;
    } else {
      gameText.innerHTML += `<br/><br/>Yellow Score: ${yellowScore}<br/>Green Score: ${greenScore}<br/><br/>If you would like to continue, press Play Again.`;
      startButton.textContent = "Play Again";
      containerDiv.appendChild(startButton);
    }
  }
}

//&----------------------------------------------------------------
//& GAME / ANIMATION RESET

// This doesn't seem to be working well....
function restartAnimation() {
  canvas.style.animationName = "none";
  console.log("Step 1");

  requestAnimationFrame(() => {
    setTimeout(() => {
      canvas.style.animationName = "";
    }, 0);
  });
}

function reset() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  restartAnimation();

  //! This switch statement will be used once I can figure
  //! out adding different sized mazes to each level
  // switch (roundNum) {
  //   case 0:
  //     user1.hostMaze = firstMaze;
  //     user2.hostMaze = firstMaze;
  //     break;
  //   case 1:
  //     user1.hostMaze = secondMaze;
  //     user2.hostMaze = secondMaze;
  //     break;
  //   case 2:
  //     user1.hostMaze = thirdMaze;
  //     user2.hostMaze = thirdMaze;
  //     break;
  // }

  user1.hostMaze.grid = [];
  user1.hostMaze.createGrid();
  user1.hostMaze.buildPathFrom();
  user1.hostMaze.printMaze();

  user1.rowNum = 0;
  user1.colNum = 0;
  user1.x = user1.hostMaze.cellWidth / 2;
  user1.y = user1.hostMaze.cellHeight / 2;
  user1.radius = (user1.hostMaze.cellWidth + user1.hostMaze.cellHeight) / 10;
  user1.drawPlayer();

  user2.rowNum = user2.hostMaze.grid.length - 1;
  user2.colNum = user2.hostMaze.grid[0].length - 1;
  user2.x = canvas.width - user2.hostMaze.cellWidth / 2;
  user2.y = canvas.height - user2.hostMaze.cellHeight / 2;
  user2.radius = (user2.hostMaze.cellWidth + user2.hostMaze.cellHeight) / 10;
  user2.drawPlayer();
}
