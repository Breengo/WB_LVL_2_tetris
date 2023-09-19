import "./style.css";

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const grid = 48;

var figureSequence = [];

var playfield = [];

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

const figures = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const colors = {
  I: "cyan",
  O: "yellow",
  T: "purple",
  S: "green",
  Z: "red",
  J: "blue",
  L: "orange",
};

let score = 0;

let count = 0;

let figure = getNextFigure();

let rAF = null;

const scoreElem = document.querySelector("h2");

const btn = document.querySelector("button");

let gameOver = false;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ["I", "J", "L", "O", "S", "T", "Z"];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];

    figureSequence.push(name);
  }
}

function getNextFigure() {
  if (figureSequence.length === 0) {
    generateSequence();
  }

  const name = figureSequence.pop();

  const matrix = figures[name];

  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

  const row = name === "I" ? -1 : -2;

  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col,
  };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));

  return result;
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        (cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

function placeFigure() {
  for (let row = 0; row < figure.matrix.length; row++) {
    for (let col = 0; col < figure.matrix[row].length; col++) {
      if (figure.matrix[row][col]) {
        if (figure.row + row < 0) {
          return showGameOver();
        }

        playfield[figure.row + row][figure.col + col] = figure.name;
      }
    }
  }

  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every((cell) => !!cell)) {
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
      score += 10;
      scoreElem.innerText = `Счёт: ${score}`;
    } else {
      row--;
    }
  }

  figure = getNextFigure();
}

function showGameOver() {
  cancelAnimationFrame(rAF);

  gameOver = true;
  btn.style.display = "block";

  context.fillStyle = "black";
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = "white";
  context.font = "36px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Вы проиграли", canvas.width / 2, canvas.height / 2);
}

function loop() {
  rAF = requestAnimationFrame(loop);

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];

        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  if (figure) {
    if (++count > 35) {
      figure.row++;
      count = 0;

      if (!isValidMove(figure.matrix, figure.row, figure.col)) {
        figure.row--;
        placeFigure();
      }
    }

    context.fillStyle = colors[figure.name];

    for (let row = 0; row < figure.matrix.length; row++) {
      for (let col = 0; col < figure.matrix[row].length; col++) {
        if (figure.matrix[row][col]) {
          context.fillRect(
            (figure.col + col) * grid,
            (figure.row + row) * grid,
            grid - 1,
            grid - 1
          );
        }
      }
    }
  }
}

document.addEventListener("keydown", function (e) {
  if (gameOver) return;

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const col = e.key === "ArrowLeft" ? figure.col - 1 : figure.col + 1;

    if (isValidMove(figure.matrix, figure.row, col)) {
      figure.col = col;
    }
  }

  if (e.key === "ArrowUp") {
    const matrix = rotate(figure.matrix);

    if (isValidMove(matrix, figure.row, figure.col)) {
      figure.matrix = matrix;
    }
  }

  if (e.key === "ArrowDown") {
    const row = figure.row + 1;

    if (!isValidMove(figure.matrix, row, figure.col)) {
      figure.row = row - 1;

      placeFigure();
      return;
    }

    figure.row = row;
  }
});

rAF = requestAnimationFrame(loop);

btn.addEventListener("click", () => {
  gameOver = false;
  score = 0;
  count = 0;
  figureSequence = [];
  for (let row = -2; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  scoreElem.innerText = "Счет: 0";
  rAF = requestAnimationFrame(loop);
  btn.style.display = "none";
});
