
const boardEl = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const turnEl = document.getElementById("turn");
const statusEl = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const clearScoreBtn = document.getElementById("clearScoreBtn");
const modeRadios = document.querySelectorAll('input[name="mode"]');
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");


let board = Array(9).fill(null); 
let currentPlayer = "X";
let gameOver = false;
let mode = "human"; 
let scores = { X: 0, O: 0, D: 0 };

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], 
  [0,3,6],[1,4,7],[2,5,8], 
  [0,4,8],[2,4,6]          
];


attachEvents();
updateTurnUI();
statusEl.textContent = "Make your move!";

function attachEvents() {
  cells.forEach(cell => {
    cell.addEventListener("click", onCellClick, { once: true });
  });

  resetBtn.addEventListener("click", resetBoard);
  clearScoreBtn.addEventListener("click", () => {
    scores = { X: 0, O: 0, D: 0 };
    renderScores();
  });

  modeRadios.forEach(r => r.addEventListener("change", (e) => {
    mode = e.target.value;
    resetBoard();
  }));
}

function onCellClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  if (gameOver || board[idx]) return;

  makeMove(idx, currentPlayer);

  const result = evaluateBoard();
  if (result.finished) {
    endGame(result);
    return;
  }


  if (mode === "cpu" && currentPlayer === "O" && !gameOver) {
    setTimeout(() => {
      const move = chooseCpuMove();
      makeMove(move, "O");
      const res2 = evaluateBoard();
      if (res2.finished) {
        endGame(res2);
        return;
      }
    }, 320); 
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
  currentPlayer = player === "X" ? "O" : "X";
  updateTurnUI();
}

function updateTurnUI() {
  if (!gameOver) {
    turnEl.textContent = `Turn: ${currentPlayer}`;
  }
}


function evaluateBoard() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { finished: true, winner: board[a], line };
    }
  }
  if (board.every(Boolean)) {
    return { finished: true, winner: null, line: null };
  }
  return { finished: false, winner: null, line: null };
}

function endGame({ winner, line }) {
  gameOver = true;

  if (line) {
    line.forEach(i => cells[i].classList.add("win"));
  }

  if (winner) {
    statusEl.textContent = `🎉 ${winner} wins!`;
    scores[winner] += 1;
  } else {
    statusEl.textContent = "🤝 It's a draw.";
    scores.D += 1;
  }
  renderScores();
  disableRemaining();
}

function disableRemaining() {
  cells.forEach((c, i) => {
    if (!board[i]) c.disabled = true;
  });
}

function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  statusEl.textContent = "Make your move!";
  cells.forEach(c => {
    c.textContent = "";
    c.classList.remove("win", "x", "o");
    c.disabled = false;

    
    c.replaceWith(c.cloneNode(true));
  });

 
  const newCells = Array.from(document.querySelectorAll(".cell"));
  newCells.forEach(cell => {
    cell.addEventListener("click", onCellClick, { once: true });
  });
  updateTurnUI();
}

function renderScores() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}


function chooseCpuMove() {

  const winMove = findBestFor("O");
  if (winMove !== -1) return winMove;


  const blockMove = findBestFor("X");
  if (blockMove !== -1) return blockMove;


  if (!board[4]) return 4;

 
  const corners = [0, 2, 6, 8].filter(i => !board[i]);
  if (corners.length) return randomPick(corners);


  const sides = [1, 3, 5, 7].filter(i => !board[i]);
  if (sides.length) return randomPick(sides);

 
  return board.findIndex(v => !v);
}

function findBestFor(player) {
  for (const [a, b, c] of WIN_LINES) {
    const line = [a, b, c];
    const vals = line.map(i => board[i]);
    const countPlayer = vals.filter(v => v === player).length;
    const countEmpty = vals.filter(v => v === null).length;
    if (countPlayer === 2 && countEmpty === 1) {
      return line[vals.indexOf(null)];
    }
  }
  return -1;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
