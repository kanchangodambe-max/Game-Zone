
const $ = (selector) => document.querySelector(selector);

const gameGrid = $("#gameGrid");
const gameRoom = $("#gameRoom");
const gameContent = $("#gameContent");
const gameTitle = $("#gameTitle");
const gameDescription = $("#gameDescription");
const toast = $("#toast");

let cleanupGame = () => {};
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function goHome() {
  cleanupGame();
  cleanupGame = () => {};
  gameRoom.hidden = true;
  $("#home").scrollIntoView({ behavior: "smooth" });
}

function openGame(name) {
  cleanupGame();
  cleanupGame = () => {};

  gameRoom.hidden = false;
  gameGrid.parentElement.querySelector(".search-wrap").hidden = true;
  $("#gameGrid").hidden = true;
  $("#noResults").hidden = true;

  const games = {
    snake: {
      title: "Snake",
      description: "Eat the glowing food and grow. Don't hit the walls or yourself!",
      start: startSnake
    },
    ttt: {
      title: "Tic-Tac-Toe",
      description: "You are X. Get three in a row before the computer does!",
      start: startTicTacToe
    },
    rps: {
      title: "Rock Paper Scissors",
      description: "Choose your move and challenge the computer.",
      start: startRPS
    },
    racing: {
      title: "Car Racing",
      description: "Dodge the traffic and survive as long as you can!",
      start: startRacing
    },
    memory: {
      title: "Memory Match",
      description: "Flip the cards and find all eight matching pairs.",
      start: startMemory
    }
  };

  const game = games[name];
  if (!game) return;

  gameTitle.textContent = game.title;
  gameDescription.textContent = game.description;
  gameContent.innerHTML = "";
  game.start();

  gameRoom.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLibrary() {
  cleanupGame();
  cleanupGame = () => {};
  gameRoom.hidden = true;
  $("#gameGrid").hidden = false;
  $(".search-wrap").hidden = false;
  $("#games").scrollIntoView({ behavior: "smooth" });
}

$("#homeLink").addEventListener("click", (e) => {
  e.preventDefault();
  showLibrary();
  $("#home").scrollIntoView({ behavior: "smooth" });
});

$("#footerHome").addEventListener("click", (e) => {
  e.preventDefault();
  showLibrary();
  $("#home").scrollIntoView({ behavior: "smooth" });
});

$("#navHome").addEventListener("click", (e) => {
  e.preventDefault();
  showLibrary();
  $("#home").scrollIntoView({ behavior: "smooth" });
});

$("#navGames").addEventListener("click", (e) => {
  e.preventDefault();
  showLibrary();
});

$("#navAbout").addEventListener("click", (e) => {
  e.preventDefault();
  $("#about").scrollIntoView({ behavior: "smooth" });
});

$("#exploreBtn").addEventListener("click", () => showLibrary());
$("#backBtn").addEventListener("click", showLibrary);

gameGrid.addEventListener("click", (e) => {
  const button = e.target.closest("[data-game]");
  if (button) openGame(button.dataset.game);
});

$("#gameSearch").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();
  let visible = 0;

  document.querySelectorAll(".game-card").forEach((card) => {
    const matches = card.dataset.name.includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });

  $("#noResults").hidden = visible !== 0;
});

// ---------- TIC-TAC-TOE ----------

function startTicTacToe() {
  let board = Array(9).fill("");
  let finished = false;
  let thinking = false;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  gameContent.innerHTML = `
    <div class="score-line" id="tttScore"></div>
    <div class="game-status" id="tttStatus">Your turn! Choose a square.</div>
    <div class="ttt-board" id="tttBoard"></div>
    <button class="restart-btn" id="tttRestart">New Round</button>
  `;

  const boardElement = $("#tttBoard");
  const status = $("#tttStatus");
  const score = $("#tttScore");

  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  function winner() {
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }
    return board.every(Boolean) ? "draw" : null;
  }

  function drawBoard() {
    boardElement.innerHTML = "";
    board.forEach((value, index) => {
      const button = document.createElement("button");
      button.className = "ttt-cell " + (value ? value.toLowerCase() : "");
      button.textContent = value;
      button.setAttribute("aria-label", `Square ${index + 1}${value ? ": " + value : ""}`);
      button.disabled = Boolean(value) || finished || thinking;
      button.addEventListener("click", () => playerMove(index));
      boardElement.appendChild(button);
    });

    score.textContent = `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
  }

  function finishRound(result) {
    finished = true;
    if (result === "X") {
      wins++;
      status.textContent = "🎉 You win!";
    } else if (result === "O") {
      losses++;
      status.textContent = "🤖 Computer wins! Try again.";
    } else {
      draws++;
      status.textContent = "🤝 It's a draw!";
    }
    drawBoard();
  }

  function playerMove(index) {
    if (board[index] || finished || thinking) return;

    board[index] = "X";
    drawBoard();

    const result = winner();
    if (result) {
      finishRound(result);
      return;
    }

    thinking = true;
    status.textContent = "Computer is thinking...";
    drawBoard();

    // A short delay makes the computer's move easier to follow.
    computerTimer = setTimeout(() => {
      if (finished) return;

      const empty = board
        .map((value, i) => value ? -1 : i)
        .filter((i) => i !== -1);

      // Try to win, then block the player's winning move.
      let move = findWinningMove("O");
      if (move === -1) move = findWinningMove("X");
      if (move === -1 && !board[4]) move = 4;
      if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];

      if (move !== undefined && move !== -1) board[move] = "O";
      thinking = false;

      const outcome = winner();
      if (outcome) finishRound(outcome);
      else {
        status.textContent = "Your turn! Choose a square.";
        drawBoard();
      }
    }, 350);
  }

  let computerTimer;

  function findWinningMove(mark) {
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = mark;
        const result = winner();
        board[i] = "";
        if (result === mark) return i;
      }
    }
    return -1;
  }

  function resetRound() {
    clearTimeout(computerTimer);
    board = Array(9).fill("");
    finished = false;
    thinking = false;
    status.textContent = "Your turn! Choose a square.";
    drawBoard();
  }

  $("#tttRestart").addEventListener("click", resetRound);
  cleanupGame = () => clearTimeout(computerTimer);
  drawBoard();
}

// ---------- ROCK PAPER SCISSORS ----------

function startRPS() {
  let wins = 0;
  let losses = 0;
  let draws = 0;

  gameContent.innerHTML = `
    <div class="score-line" id="rpsScore">Wins: 0 · Draws: 0 · Losses: 0</div>
    <div class="game-status" id="rpsStatus">Choose your move!</div>
    <div class="rps-choices">
      <button class="rps-choice" data-move="rock">✊<small>Rock</small></button>
      <button class="rps-choice" data-move="paper">✋<small>Paper</small></button>
      <button class="rps-choice" data-move="scissors">✌️<small>Scissors</small></button>
    </div>
    <p id="rpsResult" class="score-line">First to play wins nothing yet!</p>
    <button id="rpsReset" class="restart-btn">Reset Score</button>
  `;

  const icons = { rock: "✊", paper: "✋", scissors: "✌️" };

  gameContent.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => {
      const player = button.dataset.move;
      const options = ["rock", "paper", "scissors"];
      const computer = options[Math.floor(Math.random() * 3)];

      let result;
      if (player === computer) {
        result = "It's a draw!";
        draws++;
      } else if (
        (player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper")
      ) {
        result = "🎉 You win this round!";
        wins++;
      } else {
        result = "🤖 Computer wins this round!";
        losses++;
      }

      $("#rpsStatus").textContent = result;
      $("#rpsResult").textContent =
        `You: ${icons[player]}  vs  Computer: ${icons[computer]}`;
      $("#rpsScore").textContent =
        `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
    });
  });

  $("#rpsReset").addEventListener("click", () => {
    wins = losses = draws = 0;
    $("#rpsStatus").textContent = "Choose your move!";
    $("#rpsResult").textContent = "Ready for another round?";
    $("#rpsScore").textContent = "Wins: 0 · Draws: 0 · Losses: 0";
  });
}

// ---------- MEMORY MATCH ----------

function startMemory() {
  const symbols = ["🐱", "🐶", "🦊", "🐼", "🐸", "🦁", "🐵", "🐧"];
  let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let flipped = [];
  let matched = new Set();
  let moves = 0;
  let lock = false;
  let matchTimer;

  gameContent.innerHTML = `
    <div class="score-line" id="memoryScore">Moves: 0 · Pairs: 0/8</div>
    <div class="game-status" id="memoryStatus">Find the matching pairs!</div>
    <div class="memory-board" id="memoryBoard"></div>
    <button class="restart-btn" id="memoryRestart">Shuffle & Restart</button>
  `;

  const board = $("#memoryBoard");

  function updateScore() {
    $("#memoryScore").textContent =
      `Moves: ${moves} · Pairs: ${matched.size / 2}/8`;
  }

  function drawCards() {
    board.innerHTML = "";
    cards.forEach((symbol, index) => {
      const button = document.createElement("button");
      button.className = "memory-card";
      button.textContent =
        matched.has(index) || flipped.includes(index) ? symbol : "?";

      button.setAttribute("aria-label",
        matched.has(index) || flipped.includes(index)
          ? `Card ${index + 1}: ${symbol}`
          : `Hidden card ${index + 1}`
      );

      if (matched.has(index)) button.classList.add("matched");
      button.disabled = matched.has(index) || flipped.includes(index) || lock;

      button.addEventListener("click", () => flipCard(index));
      board.appendChild(button);
    });
  }

  function flipCard(index) {
    if (lock || matched.has(index) || flipped.includes(index)) return;

    flipped.push(index);
    drawCards();

    if (flipped.length !== 2) return;

    moves++;
    updateScore();

    if (cards[flipped[0]] === cards[flipped[1]]) {
      flipped.forEach((i) => matched.add(i));
      flipped = [];
      drawCards();
      updateScore();

      if (matched.size === cards.length) {
        $("#memoryStatus").textContent = `🏆 You matched every pair in ${moves} moves!`;
      } else {
        $("#memoryStatus").textContent = "Great match! Find another pair.";
      }
    } else {
      lock = true;
      $("#memoryStatus").textContent = "Not a match. Remember the cards!";
      matchTimer = setTimeout(() => {
        flipped = [];
        lock = false;
        drawCards();
        $("#memoryStatus").textContent = "Try another pair!";
      }, 800);
    }
  }

  function reset() {
    clearTimeout(matchTimer);
    cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    flipped = [];
    matched = new Set();
    moves = 0;
    lock = false;
    updateScore();
    $("#memoryStatus").textContent = "Find the matching pairs!";
    drawCards();
  }

  $("#memoryRestart").addEventListener("click", reset);
  cleanupGame = () => clearTimeout(matchTimer);
  drawCards();
}

// ---------- SNAKE ----------

function startSnake() {
  gameContent.innerHTML = `
    <div class="score-line" id="snakeScore">Score: 0</div>
    <div class="game-status" id="snakeStatus">Press Start to play!</div>
    <div class="canvas-wrap"><canvas id="snakeCanvas" class="game-canvas" width="320" height="320"></canvas></div>
    <div class="mobile-controls">
      <button data-dir="up">↑</button>
      <button data-dir="left">←</button>
      <button data-dir="down">↓</button>
      <button data-dir="right">→</button>
    </div>
    <p class="canvas-help">Use arrow keys or WASD to move. Eat the glowing food and avoid crashing.</p>
    <button id="snakeStart">Start / Restart</button>
  `;

  const canvas = $("#snakeCanvas");
  const ctx = canvas.getContext("2d");
  const size = 16;
  const cells = canvas.width / size;
  let snake, food, direction, nextDirection, score, timer;
  let running = false;
  let over = false;

  function newFood() {
    let p;
    do {
      p = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
    } while (snake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  }

  function draw() {
    ctx.fillStyle = "#0a0b18";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#191a30";
    for (let i = 0; i < cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }

    ctx.fillStyle = "#ff5ca8";
    ctx.shadowColor = "#ff5ca8";
    ctx.shadowBlur = 12;
    ctx.fillRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6);
    ctx.shadowBlur = 0;

    snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? "#63f8ff" : "#8e59f8";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = i === 0 ? 8 : 2;
      ctx.fillRect(part.x * size + 1, part.y * size + 1, size - 2, size - 2);
    });
    ctx.shadowBlur = 0;
  }

  function reset() {
    clearInterval(timer);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { ...direction };
    score = 0;
    food = newFood();
    running = true;
    over = false;
    $("#snakeScore").textContent = "Score: 0";
    $("#snakeStatus").textContent = "Go! Eat the pink food.";
    draw();
    timer = setInterval(tick, 115);
  }

  function tick() {
    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };
    const ate = head.x === food.x && head.y === food.y;

    if (
      head.x < 0 || head.x >= cells ||
      head.y < 0 || head.y >= cells ||
      snake.slice(0, ate ? undefined : -1).some(
        (part) => part.x === head.x && part.y === head.y
      )
    ) {
      clearInterval(timer);
      running = false;
      over = true;
      $("#snakeStatus").textContent = `Game over! Final score: ${score}. Restart to play again.`;
      return;
    }

    snake.unshift(head);
    if (ate) {
      score++;
      $("#snakeScore").textContent = `Score: ${score}`;
      food = newFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function setDirection(dir) {
    if (!running) return;
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const next = directions[dir];
    if (next.x === -direction.x && next.y === -direction.y) return;
    nextDirection = next;
  }

  function keyHandler(e) {
    const keys = {
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right"
    };
    if (keys[e.key]) {
      e.preventDefault();
      setDirection(keys[e.key]);
    }
  }

  document.addEventListener("keydown", keyHandler);
  gameContent.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => setDirection(button.dataset.dir));
  });

  $("#snakeStart").addEventListener("click", reset);

  // Draw an idle screen before the first game.
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  food = { x: 15, y: 15 };
  draw();

  cleanupGame = () => {
    clearInterval(timer);
    document.removeEventListener("keydown", keyHandler);
  };
}

// ---------- CAR RACING ----------

function startRacing() {
  gameContent.innerHTML = `
    <div class="score-line" id="raceScore">Distance: 0 · Best: 0</div>
    <div class="game-status" id="raceStatus">Ready to race?</div>
    <div class="canvas-wrap"><canvas id="raceCanvas" class="game-canvas" width="320" height="420"></canvas></div>
    <div class="mobile-controls">
      <button data-lane="-1">← Left</button>
      <button data-lane="1">Right →</button>
    </div>
    <p class="canvas-help">Use ← → or A / D to change lanes. Avoid the red traffic cars!</p>
    <button id="raceStart">Start / Restart Race</button>
  `;

  const canvas = $("#raceCanvas");
  const ctx = canvas.getContext("2d");
  const laneX = [62, 160, 258];
  let lane, enemies, distance, best = 0, roadOffset, timer, over;
  let running = false;
  let frame = 0;

  function drawCar(x, y, color, player = false) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 15, y - 22, 30, 44);
    ctx.fillStyle = player ? "#b7faff" : "#ffd4d4";
    ctx.fillRect(x - 10, y - 15, 20, 10);
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 18, y - 15, 4, 12);
    ctx.fillRect(x + 14, y - 15, 4, 12);
    ctx.fillRect(x - 18, y + 7, 4, 12);
    ctx.fillRect(x + 14, y + 7, 4, 12);
  }

  function draw() {
    ctx.fillStyle = "#123326";
    ctx.fillRect(0, 0, 320, 420);

    ctx.fillStyle = "#252839";
    ctx.fillRect(20, 0, 280, 420);

    ctx.strokeStyle = "#e6e6ef";
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 20]);
    ctx.lineDashOffset = -roadOffset;
    ctx.beginPath();
    ctx.moveTo(113, 0); ctx.lineTo(113, 420);
    ctx.moveTo(207, 0); ctx.lineTo(207, 420);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffdb69";
    ctx.fillRect(20, 0, 3, 420);
    ctx.fillRect(297, 0, 3, 420);

    enemies.forEach((enemy) => drawCar(laneX[enemy.lane], enemy.y, "#ff4d6d"));
    drawCar(laneX[lane], 350, "#8b5cff", true);

    if (!running && over) {
      ctx.fillStyle = "#000b";
      ctx.fillRect(30, 160, 260, 90);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("RACE OVER", 160, 198);
      ctx.font = "13px sans-serif";
      ctx.fillText(`Distance: ${distance}`, 160, 224);
    }
  }

  function updateScore() {
    $("#raceScore").textContent = `Distance: ${distance} · Best: ${best}`;
  }

  function tick() {
    if (!running) return;
    frame++;
    roadOffset = (roadOffset + 5) % 45;

    // Add traffic at intervals, with a small chance of another car.
    if (frame % 36 === 0) {
      const available = [0, 1, 2].filter(
        (n) => !enemies.some((enemy) => enemy.lane === n && enemy.y < 115)
      );
      if (available.length) {
        enemies.push({
          lane: available[Math.floor(Math.random() * available.length)],
          y: -30
        });
      }
    }

    const speed = 4 + Math.min(distance / 35, 4);
    enemies.forEach((enemy) => enemy.y += speed);
    enemies = enemies.filter((enemy) => enemy.y < 460);

    const collision = enemies.some(
      (enemy) => enemy.lane === lane && enemy.y > 310 && enemy.y < 390
    );

    if (collision) {
      running = false;
      over = true;
      best = Math.max(best, distance);
      updateScore();
      $("#raceStatus").textContent = "💥 Crash! Start a new race to try again.";
      draw();
      return;
    }

    if (frame % 6 === 0) {
      distance++;
      updateScore();
    }

    draw();
  }

  function reset() {
    clearInterval(timer);
    lane = 1;
    enemies = [];
    distance = 0;
    roadOffset = 0;
    frame = 0;
    running = true;
    over = false;
    updateScore();
    $("#raceStatus").textContent = "Go! Avoid the traffic.";
    draw();
    timer = setInterval(tick, 45);
  }

  function changeLane(amount) {
    if (!running) return;
    lane = Math.max(0, Math.min(2, lane + amount));
    draw();
  }

  function keyHandler(e) {
    if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") changeLane(-1);
      else changeLane(1);
    }
  }

  document.addEventListener("keydown", keyHandler);
  gameContent.querySelectorAll("[data-lane]").forEach((button) => {
    button.addEventListener("click", () => changeLane(Number(button.dataset.lane)));
  });
  $("#raceStart").addEventListener("click", reset);

  lane = 1;
  enemies = [];
  distance = 0;
  roadOffset = 0;
  over = false;
  draw();

  cleanupGame = () => {
    clearInterval(timer);
    document.removeEventListener("keydown", keyHandler);
  };
}
