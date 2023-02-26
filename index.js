// Grab the canvas and get context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//* Creating a grid
function createGrid(blockSideLength, x = 0, y = 0) {
    while (y !== canvas.height) {
        x = 0;
        for(let i = 0; i < canvas.width; i += blockSideLength) {
            ctx.strokeRect(x, y, blockSideLength, blockSideLength);
            x += blockSideLength;
        }
        y += blockSideLength;
    }

}

createGrid(50);

